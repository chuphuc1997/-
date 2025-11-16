
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './Modal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'lastUpdated'>>({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    minStockLevel: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        price: product.price,
        minStockLevel: product.minStockLevel || 0,
      });
    } else {
      setFormData({ name: '', sku: '', quantity: 0, price: 0, minStockLevel: 0 });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: product?.id || `prod-${new Date().getTime()}`,
      ...formData,
      lastUpdated: new Date().toISOString(),
    };
    onSave(newProduct);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? '상품 수정' : '새 상품 추가'}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">상품명</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
            <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">수량</label>
              <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">가격 (원)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
           <div>
            <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">최소 재고 수준 (경고 기준)</label>
            <input type="number" name="minStockLevel" id="minStockLevel" value={formData.minStockLevel} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            취소
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            저장
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
