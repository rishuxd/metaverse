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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

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

        // Redirect to original page or dashboard
        router.push(redirect || "/dashboard");
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
    <AuthLayout title="Welcome Back" avatarImage="/avatars/avatar3.png">
      <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
        <Input
          id="username"
          label="Username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
      <p className="text-gray-600 mt-6 text-sm">
        Don't have an account?{" "}
        <a
          href={
            redirect
              ? `/signup?redirect=${encodeURIComponent(redirect)}`
              : "/signup"
          }
          className="text-teal-600 font-semibold hover:underline"
        >
          Sign Up
        </a>
      </p>
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
