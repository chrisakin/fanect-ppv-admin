import React from 'react';

/**
 * LoadingSpinnerProps
 * - size: small/medium/large
 * - className: optional extra classes
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * LoadingSpinner
 * Simple animated spinner used while loading data or processes.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin ${className}`}></div>
    </div>
  );
};