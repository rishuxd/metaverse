import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading = false, className = "", children, disabled, ...props }, ref) => {
    const baseStyles = "rounded-xl py-3 px-5 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "bg-teal-600 text-white hover:bg-teal-700",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700"
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "Loading..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
