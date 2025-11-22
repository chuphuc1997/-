import React from 'react';

interface LoadingSpinnerProps {
  isOpen: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[100] flex justify-center items-center">
      <div className="w-12 h-12 border-4 border-white dark:border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <span className="sr-only">로딩 중...</span>
    </div>
  );
};

export default LoadingSpinner;
