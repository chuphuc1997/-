import React, { useState, useEffect } from 'react';
import { Warehouse } from '../types';
import Modal from './Modal';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Warehouse) => void;
  warehouse: Warehouse | null;
  isLoading: boolean;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ isOpen, onClose, onSave, warehouse, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        location: warehouse.location,
      });
    } else {
      setFormData({ name: '', location: '' });
    }
  }, [warehouse, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouse) {
        onSave({
            ...warehouse,
            ...formData,
        });
    }
  };

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="warehouse-form" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-500">
        {isLoading ? '저장 중...' : '저장'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="창고 정보 수정" footer={modalFooter}>
      <form id="warehouse-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">창고명</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">위치</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default WarehouseModal;