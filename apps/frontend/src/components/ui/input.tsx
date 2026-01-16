import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className = "", ...props }, ref) => {
    return (
      <div className="group">
        {label && (
          <label
            htmlFor={props.id}
            className="flex items-center gap-2 text-xs font-light text-slate-500 dark:text-slate-400 mb-3 ml-2 uppercase tracking-widest"
          >
            {icon && (
              <span className="material-symbols-filled text-lg">{icon}</span>
            )}
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-6 py-5 rounded-[2rem] border-2 border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-600 focus:bg-white dark:focus:bg-black focus:ring-0 transition-all outline-none ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-red-600 text-sm ml-2 mt-2 block">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
