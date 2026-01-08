import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={props.id} className="text-gray-700 text-sm font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all ${className}`}
          {...props}
        />
        {error && (
          <span className="text-red-600 text-sm">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
