import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string; // Prepared for future validation messages
}

export function Input({ label, error, className = '', disabled, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        disabled={disabled}
        className={`
          w-full px-4 py-3 rounded-lg border outline-none transition-all
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
          ${disabled ? 'opacity-70 bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}