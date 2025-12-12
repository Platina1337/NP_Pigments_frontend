'use client';

import React, { useRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newCode = [...code];
    // Allow only one digit
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Combine code and call callback if complete
    const combinedCode = newCode.join('');
    if (combinedCode.length === length && !newCode.includes('')) {
      onComplete(combinedCode);
    }

    // Move to next input if value entered
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
        const newCode = [...code];
        pastedData.forEach((char, index) => {
            if (index < length) newCode[index] = char;
        });
        setCode(newCode);
        const combinedCode = newCode.join('');
        if (combinedCode.length === length) {
            onComplete(combinedCode);
        }
        // Focus last filled or first empty
        const nextIndex = Math.min(pastedData.length, length - 1);
         inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-4 justify-center">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
             // Assign ref without returning anything
             inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={clsx(
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200",
            "bg-secondary/30 text-foreground",
            "focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none focus:bg-background",
            "disabled:opacity-50 disabled:cursor-not-allowed",
             digit ? "border-primary/50" : "border-border"
          )}
        />
      ))}
    </div>
  );
};

