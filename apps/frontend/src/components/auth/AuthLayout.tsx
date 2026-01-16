import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  title: string;
  avatarImage: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  avatarImage,
  children,
}) => {
  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center px-8"
      style={{
        backgroundImage: 'url("/assets/sprites/sky.png")',
      }}
    >
      <div className="flex items-center gap-8 max-w-7xl w-full">
        {/* Login/Signup Card - Left Side */}
        <div className="flex flex-col items-center justify-between h-auto w-full max-w-sm py-6 px-8 rounded-3xl bg-white shadow-2xl">
          <Image
            src="/leaf.png"
            alt="Rishu's Town Logo"
            width={48}
            height={48}
            className="mb-4"
            style={{ imageRendering: "auto" }}
          />
          <div className="w-24 h-10 mb-6 relative">
            <div
              className="absolute w-full h-full scale-[2]"
              style={{
                marginLeft: 5,
                backgroundImage: `url("${avatarImage}")`,
              }}
            />
          </div>
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{title}</h1>
          {children}
        </div>

        {/* OG Image - Right Side */}
        <div className="hidden lg:block flex-1">
          <Image
            src="/og-image.png"
            alt="Rishu's Town - Interactive Virtual Spaces"
            width={800}
            height={420}
            className="rounded-2xl shadow-2xl w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};
