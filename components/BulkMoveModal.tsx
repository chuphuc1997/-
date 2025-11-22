import React, { useState, useEffect } from 'react';
import { Product, Warehouse } from '../types';
import Modal from './Modal';
import { PackageIcon } from './Icons';

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (productIds: string[], sourceWarehouseId: string, destinationWarehouseId: string) => void;
  products: Product[];
  sourceWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  isLoading: boolean;
}

const BulkMoveModal: React.FC<BulkMoveModalProps> = ({ isOpen, onClose, onMove, products, sourceWarehouse, warehouses, isLoading }) => {
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');

  const availableWarehouses = warehouses.filter(wh => wh.id !== sourceWarehouse?.id);

  useEffect(() => {
    if (isOpen) {
      if (availableWarehouses.length > 0) {
        setDestinationWarehouseId(availableWarehouses[0].id);
      } else {
        setDestinationWarehouseId('');
      }
    }
  }, [isOpen, sourceWarehouse, availableWarehouses]);

  if (!sourceWarehouse || products.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationWarehouseId) {
      const productIds = products.map(p => p.id);
      onMove(productIds, sourceWarehouse.id, destinationWarehouseId);
    }
  };
  
  const isMoveDisabled = !destinationWarehouseId || availableWarehouses.length === 0 || isLoading;

  const modalFooter = (
    <div className="flex justify-end space-x-3">
      <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        취소
      </button>
      <button type="submit" form="bulk-move-form" disabled={isMoveDisabled} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
        {isLoading ? '이동 중...' : '이동'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`선택된 상품 ${products.length}개 일괄 이동`} footer={modalFooter}>
      <form id="bulk-move-form" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>현재 창고:</strong> {sourceWarehouse.name}
          </p>
          <div>
            <h4 className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이동할 상품 목록</h4>
            <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700/50">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <PackageIcon className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-800 dark:text-gray-200">{p.name}</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-300">{p.quantity.toLocaleString()}개</span>
                </div>
              ))}
            </div>
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
           <p className="text-xs text-gray-500 dark:text-gray-400">참고: 일괄 이동은 선택된 상품의 현재 창고 재고 전체를 이동시킵니다.</p>
        </div>
      </form>
    </Modal>
  );
};

export default BulkMoveModal;