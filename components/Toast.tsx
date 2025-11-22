
import React, { useEffect } from 'react';
import { InformationCircleIcon, ExclamationTriangleIcon, PlusCircleIcon, XMarkIcon } from './Icons';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <PlusCircleIcon className="w-5 h-5 text-green-500" />,
  error: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`max-w-sm w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all animate-fade-in-down backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95`}
    >
      <div className="p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(toast.id)}
              className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
