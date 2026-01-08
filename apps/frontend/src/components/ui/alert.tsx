import React from "react";

interface AlertProps {
  variant: "success" | "error" | "info";
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant, children }) => {
  const variantStyles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700"
  };

  return (
    <div className={`border px-4 py-3 rounded-xl ${variantStyles[variant]}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};
