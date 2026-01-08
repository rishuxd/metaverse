import React from "react";

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
      className="flex items-center justify-center h-screen bg-cover bg-center"
      style={{
        backgroundImage: 'url("/assets/sprites/sky.png")',
      }}
    >
      <div className="flex flex-col items-center justify-between h-auto w-full max-w-md py-8 px-12 rounded-3xl bg-white shadow-2xl">
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
    </div>
  );
};
