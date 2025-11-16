
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './Modal';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceive: (productId: string, quantity: number) => void;
  product: Product | null;
}

const ReceiveStockModal: React.FC<ReceiveStockModalProps> = ({ isOpen, onClose, onReceive, product }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  if (!product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > 0) {
      onReceive(product.id, quantity);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`'${product.name}' 상품 입고`}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>현재 재고:</strong> {product.quantity.toLocaleString()}개
          </p>
          <div>
            <label htmlFor="receive-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">입고할 수량</label>
            <input
              type="number"
              name="quantity"
              id="receive-quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            취소
          </button>
          <button type="submit" disabled={quantity <= 0} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
            입고 처리
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceiveStockModal;
