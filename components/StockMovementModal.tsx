
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './Modal';
import { ReceiveIcon, ArrowUpOnSquareIcon, PrinterIcon } from './Icons';

type MovementType = 'RECEIVE' | 'SHIP';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, quantity: number, type: MovementType, totalValue?: number, shouldPrint?: boolean) => void;
  product: Product | null;
  isLoading: boolean;
  canViewFinancials: boolean;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onSave, product, isLoading, canViewFinancials }) => {
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<MovementType>('RECEIVE');
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setType('RECEIVE');
      if (product) {
        setUnitPrice(product.price);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const maxShipQuantity = product.quantity;
  const isShipment = type === 'SHIP';
  const quantityError = isShipment && quantity > maxShipQuantity;
  
  const totalValue = quantity * unitPrice;

  const handleSubmit = (e: React.FormEvent, shouldPrint: boolean = false) => {
    e.preventDefault();
    if (quantity > 0 && !quantityError) {
      // Only pass totalValue if user has permission to see/edit it
      onSave(product.id, quantity, type, canViewFinancials ? totalValue : undefined, shouldPrint);
    }
  };

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button 
        type="button"
        onClick={(e) => handleSubmit(e, true)}
        disabled={quantity <= 0 || quantityError || isLoading} 
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
      >
        <PrinterIcon className="w-4 h-4 mr-2" />
        {isLoading ? '처리 중...' : '저장 & 인쇄'}
      </button>
      <button 
        type="button"
        onClick={(e) => handleSubmit(e, false)}
        disabled={quantity <= 0 || quantityError || isLoading} 
        className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed ${
          isShipment ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'
        }`}
      >
        {isLoading ? '처리 중...' : (isShipment ? '출고 처리' : '입고 처리')}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`'${product.name}' 재고 처리`} footer={modalFooter}>
      <form id="stock-movement-form" onSubmit={(e) => handleSubmit(e, false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              type="button"
              onClick={() => setType('RECEIVE')}
              className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${type === 'RECEIVE' ? 'bg-white dark:bg-gray-800 shadow text-cyan-600' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <ReceiveIcon className="w-5 h-5 mr-2" /> 입고
            </button>
            <button
              type="button"
              onClick={() => setType('SHIP')}
              className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${type === 'SHIP' ? 'bg-white dark:bg-gray-800 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <ArrowUpOnSquareIcon className="w-5 h-5 mr-2" /> 출고
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>현재 재고:</strong> {product.quantity.toLocaleString()}개
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="movement-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isShipment ? '출고할 수량' : '입고할 수량'}
                </label>
                <input
                type="number"
                name="quantity"
                id="movement-quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                required
                min="1"
                max={isShipment ? maxShipQuantity : undefined}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {quantityError && <p className="text-red-500 text-xs mt-1">현재 재고보다 많이 출고할 수 없습니다.</p>}
            </div>
            
            {canViewFinancials && (
                <div>
                    <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        단가 (원)
                    </label>
                    <input
                        type="number"
                        name="unitPrice"
                        id="unit-price"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>
            )}
          </div>

          {canViewFinancials && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">총 거래 금액</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{totalValue.toLocaleString()}원</span>
              </div>
          )}

        </div>
      </form>
    </Modal>
  );
};

export default StockMovementModal;
