
import React, { useMemo } from 'react';
import { Product, User, Warehouse } from '../types';
import Modal from './Modal';
import TransactionTypeInfo from './TransactionTypeInfo';

interface ProductHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  users: User[];
  warehouses: Warehouse[];
}

const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({ isOpen, onClose, product, users, warehouses }) => {
  if (!product) return null;

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || '알 수 없음';
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || '알 수 없음';
  
  const sortedHistory = useMemo(() => {
    if (!product.quantityHistory) return [];
    return [...product.quantityHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [product.quantityHistory]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`'${product.name}' 수량 변경 내역`}>
      <div className="max-h-96 overflow-y-auto">
        {sortedHistory.length > 0 ? (
           <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                    {['날짜', '구분', '변경 전', '변경', '변경 후', '담당자', '관련 정보'].map(header => (
                        <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedHistory.map(entry => {
                    const changeText = entry.quantityChange > 0 ? `+${entry.quantityChange.toLocaleString()}` : entry.quantityChange.toLocaleString();
                    const changeColor = entry.quantityChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
                    return (
                        <tr key={entry.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(entry.date).toLocaleString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap font-medium"><TransactionTypeInfo type={entry.type} /></td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{entry.oldQuantity.toLocaleString()}</td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm font-semibold ${changeColor}`}>{changeText}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{entry.newQuantity.toLocaleString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getUserName(entry.userId)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{entry.relatedWarehouseId ? getWarehouseName(entry.relatedWarehouseId) : '-'}</td>
                        </tr>
                    )
                })}
              </tbody>
           </table>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">이 상품에 대한 수량 변경 내역이 없습니다.</p>
          </div>
        )}
      </div>
       <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            닫기
          </button>
        </div>
    </Modal>
  );
};

export default ProductHistoryModal;
