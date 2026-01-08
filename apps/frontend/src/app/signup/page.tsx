"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const SignupForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/signup`,
        { username, password },
      );

      if (response.status === 201) {
        // Redirect to login with the same redirect parameter if it exists
        const loginUrl = redirect
          ? `/login?redirect=${encodeURIComponent(redirect)}`
          : "/login";
        router.push(loginUrl);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      avatarImage="/assets/avatars/avatar4.png"
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-5 w-full">
        <Input
          id="username"
          label="Username"
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" isLoading={isLoading}>
          Sign Up
        </Button>
      </form>
      <p className="text-gray-600 mt-6 text-sm">
        Already have an account?{" "}
        <a
          href={
            redirect
              ? `/login?redirect=${encodeURIComponent(redirect)}`
              : "/login"
          }
          className="text-teal-600 font-semibold hover:underline"
        >
          Sign In
        </a>
      </p>
    </AuthLayout>
  );
};

const Signup = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
};

export default Signup;
