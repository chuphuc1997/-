import React from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col transform transition-all max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white rounded-lg text-sm p-1.5"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">닫기</span>
          </button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
