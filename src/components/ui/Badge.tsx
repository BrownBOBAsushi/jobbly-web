// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'info' | 'default';
  className?: string;
}

const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

const colorMap = {
  primary: 'bg-indigo-100 text-indigo-800', // Our purple/blue theme
  success: 'bg-green-100 text-green-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  return (
    <span className={`${baseStyles} ${colorMap[variant]} ${className}`}>
      {children}
    </span>
  );
};