
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Warehouse } from '../types';
import Modal from './Modal';
import { PrinterIcon } from './Icons';

interface MoveProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (productId: string, sourceWarehouseId: string, destinationWarehouseId: string, quantity: number, shouldPrint?: boolean) => void;
  product: Product | null;
  sourceWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  isLoading: boolean;
  canViewFinancials: boolean;
}

const MoveProductModal: React.FC<MoveProductModalProps> = ({ isOpen, onClose, onMove, product, sourceWarehouse, warehouses, isLoading, canViewFinancials }) => {
  const [quantity, setQuantity] = useState(1);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');

  const availableWarehouses = useMemo(() => 
    warehouses.filter(wh => wh.id !== sourceWarehouse?.id),
    [warehouses, sourceWarehouse]
  );

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      if (availableWarehouses.length > 0) {
        setDestinationWarehouseId(availableWarehouses[0].id);
      } else {
        setDestinationWarehouseId('');
      }
    }
  }, [isOpen, availableWarehouses]);

  if (!product || !sourceWarehouse) return null;

  const maxQuantity = product.quantity;

  const handleSubmit = (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    if (quantity > 0 && quantity <= maxQuantity && destinationWarehouseId) {
      onMove(product.id, sourceWarehouse.id, destinationWarehouseId, quantity, shouldPrint);
    }
  };
  
  const isMoveDisabled = !destinationWarehouseId || quantity <= 0 || quantity > maxQuantity || availableWarehouses.length === 0 || isLoading;
  const totalValue = quantity * product.price;

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button 
        type="button" 
        onClick={(e) => handleSubmit(e, true)}
        disabled={isMoveDisabled} 
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        <PrinterIcon className="w-4 h-4 mr-2" />
        {isLoading ? '처리 중...' : '이동 & 인쇄'}
      </button>
      <button 
        type="button" 
        onClick={(e) => handleSubmit(e, false)}
        disabled={isMoveDisabled} 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? '이동 중...' : '이동'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`'${product.name}' 상품 이동`} footer={modalFooter}>
      <form id="move-product-form" onSubmit={(e) => handleSubmit(e, false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>현재 창고:</strong> {sourceWarehouse.name} <br/>
            <strong>현재 재고:</strong> {product.quantity.toLocaleString()}개
          </p>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이동할 수량</label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
              required
              min="1"
              max={maxQuantity}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
             {quantity > maxQuantity && <p className="text-red-500 text-xs mt-1">현재 재고보다 많이 이동할 수 없습니다.</p>}
          </div>
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">도착 창고</label>
            <select
              id="destination"
              value={destinationWarehouseId}
              onChange={(e) => setDestinationWarehouseId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="" disabled>창고 선택...</option>
              {availableWarehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
            {availableWarehouses.length === 0 && <p className="text-yellow-500 text-xs mt-1">이동할 다른 창고가 없습니다.</p>}
          </div>

          {canViewFinancials && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">현재 단가:</span>
                    <span className="text-gray-900 dark:text-gray-100">{product.price.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-700 dark:text-gray-200">총 이동 가치:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{totalValue.toLocaleString()}원</span>
                  </div>
              </div>
          )}

        </div>
      </form>
    </Modal>
  );
};

export default MoveProductModal;
