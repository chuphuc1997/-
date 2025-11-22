import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonClass?: string;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = '확인',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  isLoading,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const modalFooter = (
    <div className="flex justify-center space-x-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      >
        취소
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass} disabled:bg-gray-400`}
      >
        {isLoading ? '처리 중...' : confirmButtonText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={modalFooter}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="mt-3">
          <p className="text-lg font-medium text-gray-900 dark:text-white">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;