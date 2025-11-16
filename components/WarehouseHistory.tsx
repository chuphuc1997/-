import React, { useMemo } from 'react';
import { Transaction, User, Warehouse, TransactionType } from '../types';
import TransactionTypeInfo from './TransactionTypeInfo';

interface WarehouseHistoryProps {
    warehouseId: string;
    transactions: Transaction[];
    users: User[];
    warehouses: Warehouse[];
}

const WarehouseHistory: React.FC<WarehouseHistoryProps> = ({ warehouseId, transactions, users, warehouses }) => {
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="mt-6 text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">이 창고에 대한 거래 내역이 없습니다.</p>
            </div>
        );
    }
    
    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수량</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">관련 창고</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">담당자</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedTransactions.map(t => {
                        const user = users.find(u => u.id === t.userId);
                        const isSource = t.warehouseId === warehouseId;
                        
                        let relatedWarehouseName = '-';
                        if (t.relatedWarehouseId) {
                            relatedWarehouseName = warehouses.find(wh => wh.id === t.relatedWarehouseId)?.name || '알 수 없는 창고';
                        }
                        
                        // For display purposes, reverse IN/OUT if we are viewing from the destination perspective
                        let displayType = t.type;
                        if (!isSource && t.type === TransactionType.OUT) displayType = TransactionType.IN;
                        if (!isSource && t.type === TransactionType.IN) displayType = TransactionType.OUT;

                        return (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    <TransactionTypeInfo type={displayType} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{t.productName}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {t.productSku}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                    {displayType === TransactionType.OUT || displayType === TransactionType.DELETE || displayType === TransactionType.QUICK_SHIP ? (
                                        <span className="text-red-600 dark:text-red-400">-{t.quantity.toLocaleString()}</span>
                                    ) : (
                                        <span className="text-green-600 dark:text-green-400">+{t.quantity.toLocaleString()}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{relatedWarehouseName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user?.name || '알 수 없음'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default WarehouseHistory;