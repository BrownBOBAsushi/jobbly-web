import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  disabled, 
  className = '', 
  ...props 
}: ButtonProps) {
  
  // Define styles based on variant
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center min-w-[100px]";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md active:transform active:scale-95",
    secondary: "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700",
    outline: "border-2 border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
  };

  // Logic to handle disabled state
  const isDisabled = disabled || isLoading;
  const disabledStyles = "opacity-50 cursor-not-allowed shadow-none active:scale-100";

  return (
    <button
      disabled={isDisabled}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${isDisabled ? disabledStyles : ''} 
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}