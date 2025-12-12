'use client';

import React, { useId, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  placeholder,
  type,
  showPasswordToggle,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === 'password';
  const shouldShowToggle = showPasswordToggle ?? isPasswordType;
  const actualType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className="relative w-full group">
      <input
        id={inputId}
        placeholder=" " 
        type={actualType}
        className={clsx(
          'peer w-full bg-transparent border-2 border-border/40 rounded-lg px-4 py-3 pt-6 text-base text-foreground placeholder-transparent',
          'transition-all duration-200 ease-in-out',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'hover:border-border/60',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          shouldShowToggle && 'pr-12',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className={clsx(
            'absolute left-4 top-4 text-foreground/50 text-base transition-all duration-200 pointer-events-none origin-left',
            'peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-foreground/50',
            'peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary peer-focus:font-medium',
            'peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-foreground/70 peer-[:not(:placeholder-shown)]:font-medium',
            error && 'text-red-500 peer-focus:text-red-500'
          )}
        >
          {label}
        </label>
      )}
      {shouldShowToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-foreground/40 hover:text-foreground/70 transition-colors rounded-md hover:bg-foreground/5"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={1.5} />
          ) : (
            <Eye size={18} strokeWidth={1.5} />
          )}
        </button>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">{error}</p>
      )}
    </div>
  );
};
