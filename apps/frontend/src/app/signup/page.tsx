"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`,
        {
          username,
          password,
        }
      );

      if (response.status === 201) {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen"
      style={{
        backgroundImage: 'url("/sprites/sky.png")',
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center justify-between h-auto w-full max-w-md py-8 px-12 rounded-3xl bg-white shadow-2xl">
        <div
          className="w-24 h-10 mb-6"
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              marginLeft: 5,
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundImage: `url("/avatars/avatar4.png")`,
              scale: 2,
            }}
          />
        </div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Create Account</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-5 w-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-gray-700 text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-gray-700 text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <button
            className="rounded-xl py-3 px-5 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all shadow-lg mt-2"
            type="submit"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-600 mt-6 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-teal-600 font-semibold hover:underline"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
