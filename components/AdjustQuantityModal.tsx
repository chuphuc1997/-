
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import Modal from './Modal';
import { ArrowRightLeftIcon } from './Icons';

interface AdjustQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, newQuantity: number) => void;
  product: Product | null;
  isLoading: boolean;
}

const AdjustQuantityModal: React.FC<AdjustQuantityModalProps> = ({ isOpen, onClose, onSave, product, isLoading }) => {
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setNewQuantity(product.quantity.toString());
    } else {
      setNewQuantity('');
    }
  }, [isOpen, product]);

  if (!product) return null;

  const currentQty = product.quantity;
  const nextQty = parseInt(newQuantity, 10);
  const isValid = !isNaN(nextQty) && nextQty >= 0;
  const diff = isValid ? nextQty - currentQty : 0;
  const valueChange = diff * product.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && diff !== 0) {
      onSave(product.id, nextQty);
    }
  };
  
  const handleQuickAdjust = (amount: number) => {
    setNewQuantity(prev => {
        const currentVal = prev === '' ? currentQty : (parseInt(prev, 10) || 0);
        return Math.max(0, currentVal + amount).toString();
    });
  };

  const handleReset = () => {
      setNewQuantity(currentQty.toString());
  };

  const isSaveDisabled = !isValid || diff === 0 || isLoading;

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="adjust-quantity-form" disabled={isSaveDisabled} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
        {isLoading ? '저장 중...' : '변경 내용 저장'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`'${product.name}' 수량 조정`} footer={modalFooter}>
      <form id="adjust-quantity-form" onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>현재 재고</span>
                  <span>변경 후 재고</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{currentQty.toLocaleString()}</span>
                  <ArrowRightLeftIcon className="w-6 h-6 text-gray-400" />
                  <span className={`text-2xl font-bold ${diff !== 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                      {isValid ? nextQty.toLocaleString() : '-'}
                  </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">변동 내역:</span>
                  <span className={`font-bold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString()} 개
                  </span>
              </div>
              <div className="mt-1 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>예상 가치 변동:</span>
                  <span className={`${valueChange > 0 ? 'text-green-600' : valueChange < 0 ? 'text-red-600' : ''}`}>
                       {valueChange > 0 ? '+' : ''}{valueChange.toLocaleString()} 원
                  </span>
              </div>
          </div>

          <div>
            <label htmlFor="new-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">최종 수량 입력</label>
            <div className="relative">
                <input
                type="number"
                name="newQuantity"
                id="new-quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                min="0"
                className="w-full px-3 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-bold text-right pr-4"
                autoFocus
                placeholder="수량 입력"
                />
                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">개</span>
            </div>
          </div>

           <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">빠른 조정</label>
                <button type="button" onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
                    초기화 (현재 수량)
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {[1, 10, 50, 100].map(amount => (
                    <button key={amount} type="button" onClick={() => handleQuickAdjust(amount)} className="flex-1 min-w-[60px] py-2 text-sm font-semibold rounded-md transition-colors bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 border border-blue-100 dark:border-blue-800">
                        +{amount}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                 {[-1, -10, -50, -100].map(amount => (
                    <button key={amount} type="button" onClick={() => handleQuickAdjust(amount)} className="flex-1 min-w-[60px] py-2 text-sm font-semibold rounded-md transition-colors bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50 border border-red-100 dark:border-red-800">
                        {amount}
                    </button>
                ))}
            </div>
            <div className="mt-2">
                 <button type="button" onClick={() => setNewQuantity('0')} className="w-full py-2 text-sm font-semibold rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600">
                    0으로 설정 (재고 소진)
                </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AdjustQuantityModal;
