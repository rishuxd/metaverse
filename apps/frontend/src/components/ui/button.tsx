import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "w-full font-bold py-6 rounded-[2rem] shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm";

    const variantStyles = {
      primary: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span className="text-sm">{children}</span>
            <span className="material-symbols-outlined group-hover/btn:translate-x-2 transition-transform">
              arrow_forward
            </span>
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
