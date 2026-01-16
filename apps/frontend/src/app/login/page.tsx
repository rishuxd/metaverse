"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/signin`,
        { username, password },
      );

      if (response.status === 200) {
        const token = response.data.data.token;

        // Store token in cookie only (7 days expiry)
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;

        // Store user info in localStorage for UI display
        localStorage.setItem("username", response.data.data.username);
        localStorage.setItem("avatarUrl", response.data.data.avatarUrl);

        setSuccessMessage("Login successful! Redirecting...");

        // Redirect to original page or dashboard
        setTimeout(() => {
          router.push(redirect || "/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome!"
      subtitle="Step back into the Town."
      avatarImage="/assets/avatars/avatar3.png"
    >
      <form onSubmit={handleLogin} className="space-y-8">
        <Input
          id="username"
          label="User name"
          icon="id_card"
          type="text"
          placeholder="Enter your user name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          icon="lock"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" isLoading={isLoading}>
          Enter Town
        </Button>
      </form>
      <div className="mt-10 pt-8 border-t border-slate-200/30 dark:border-white/10 text-center">
        <p className="text-slate-500 text-sm">
          New to the town?{" "}
          <a
            href={
              redirect
                ? `/signup?redirect=${encodeURIComponent(redirect)}`
                : "/signup"
            }
            className="text-teal-600 font-bold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default Login;
