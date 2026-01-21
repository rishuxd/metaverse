"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  avatarImage: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle = "Initialize your digital existence",
  avatarImage,
  children,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    console.log("Dark mode toggled");
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-200 flex flex-col"
      style={{
        background: "var(--auth-bg-light)",
      }}
    >
      {/* Dark Mode Gradient Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 opacity-0 dark:opacity-100 z-0"
        style={{
          background: "var(--auth-bg-dark)",
        }}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "var(--auth-bg-overlay)",
            backgroundSize: "40px 40px",
          }}
        />
        <span
          className="absolute text-[240px] opacity-50 dark:opacity-30 top-[-40px] left-[5%] blur-sm select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <span
          className="absolute text-[300px] opacity-60 dark:opacity-40 top-20 right-[10%] blur-sm select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <span
          className="absolute text-[180px] opacity-45 dark:opacity-25 bottom-10 left-[15%] blur-md select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <div className="absolute bg-green-500/20 dark:bg-green-500/10 rounded-[2rem] border-b-8 border-green-600/30 w-96 h-24 top-[15%] left-[5%] -rotate-2"></div>
        <div className="absolute bg-green-500/20 dark:bg-green-500/10 rounded-[2rem] border-b-8 border-green-600/30 w-64 h-32 bottom-[10%] right-[10%] rotate-3"></div>
        <div className="absolute top-[20%] left-[20%] w-24 h-24 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-3xl flex items-center justify-center opacity-60">
          <span className="text-5xl select-none">🌳</span>
        </div>
        <div className="absolute bottom-[15%] left-[15%] w-28 h-28 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-[2rem] flex items-center justify-center opacity-60">
          <span className="text-6xl select-none">🏠</span>
        </div>
        <div className="absolute top-1/2 left-[10%] w-16 h-16 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-2xl flex items-center justify-center opacity-40">
          <span className="text-3xl select-none">➕</span>
        </div>
        <div className="absolute bottom-[20%] right-[10%] w-24 h-24 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-3xl flex items-center justify-center opacity-60">
          <span className="text-5xl select-none">🌳</span>
        </div>
      </div>

      {/* Header */}
      <header className="h-[120px] p-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md px-6 py-4 rounded-full border border-white/30">
          <span className="material-symbols-outlined text-teal-500 text-3xl">
            eco
          </span>
          <span className="text-sm font-light tracking-tight text-slate-800 dark:text-white uppercase">
            Rishu's Town
          </span>
        </div>
        <button
          onClick={toggleDarkMode}
          className="w-14 h-14 flex items-center justify-center rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 hover:scale-105 transition-all group p-0"
        >
          {mounted && (
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform text-[24px] leading-none">
              {theme === "dark" ? (
                <span className="text-yellow-400">light_mode</span>
              ) : (
                <span className="text-sky-900">dark_mode</span>
              )}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Description Card */}
          <div className="hidden lg:block space-y-8">
            <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 p-8 rounded-[3rem] space-y-6 max-w-md">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-blue-500">
                    person
                  </span>
                </div>
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center -translate-y-4 border-4 border-teal-500 shadow-xl">
                  <span className="material-symbols-outlined text-teal-500 text-3xl">
                    face
                  </span>
                </div>
                <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-pink-500">
                    person_3
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Build Your <span className="text-teal-500">Space</span> in the
                Town.
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Explore interactive 2D spaces, hang out with friends, and
                connect with people in real time inside a shared virtual town.
              </p>
            </div>
          </div>

          {/* Right Side - Form Card */}
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full"></div>

            <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 p-10 lg:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
                  {title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 flex justify-between items-end relative z-20">
        <div className="text-left">
          <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">
            Jyotiswaroop Srivastava
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/xd_rishu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
              title="Twitter/X"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/jyotiswaroop-srivastava"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
              title="LinkedIn"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@pseudorishi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
              title="YouTube"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="https://github.com/rishuxd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
              title="GitHub"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
            <a
              href="https://leetcode.com/u/mrswaroop/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
              title="LeetCode"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
            PseudoRishi
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest">
            V1.0.4
          </div>
        </div>
      </footer>
    </div>
  );
};
