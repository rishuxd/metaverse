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
        <h1 className="mb-6 text-black">Welcome to Rishu's Town</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col">
            <label htmlFor="username" className="text-gray-700 text-sm">
              Username
            </label>
            <input
              id="username"
              className="rounded-lg p-3 text-black border-gray-500 border-2 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col mb-8">
            <label htmlFor="password" className="text-gray-700 text-sm">
              Password
            </label>
            <input
              id="password"
              className="rounded-lg p-3 text-black border-gray-700 border-2 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-sm"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="rounded-lg py-3 px-5 bg-teal-400 text-gray-900 font-semibold hover:bg-teal-600 transition-all"
            type="submit"
          >
            Signup Yourself
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="text-gray-600 mt-6 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-teal-700 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
