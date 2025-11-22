
import React, { useState, useMemo } from 'react';
import { Transaction, User, Warehouse, TransactionType } from '../types';
import TransactionTypeInfo, { getTransactionTypeName } from './TransactionTypeInfo';
import { ArrowDownTrayIcon, XMarkIcon } from './Icons';

interface AuditTrailProps {
    transactions: Transaction[];
    users: User[];
    warehouses: Warehouse[];
    onExport: (data: Transaction[]) => void;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ transactions, users, warehouses, onExport }) => {
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        warehouseId: 'all',
        userId: 'all',
        type: 'all',
        productSearch: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleResetFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            warehouseId: 'all',
            userId: 'all',
            type: 'all',
            productSearch: '',
        });
    };

    const setDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
        const today = new Date();
        let from = new Date();

        switch (period) {
            case 'today':
                break;
            case 'week':
                from.setDate(today.getDate() - today.getDay());
                break;
            case 'month':
                from.setDate(1);
                break;
            case 'year':
                from = new Date(today.getFullYear(), 0, 1);
                break;
        }
        setFilters(prev => ({
            ...prev,
            dateFrom: from.toISOString().split('T')[0],
            dateTo: today.toISOString().split('T')[0],
        }));
    };

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                if (filters.dateFrom && transactionDate < new Date(filters.dateFrom)) return false;
                if (filters.dateTo && transactionDate > new Date(filters.dateTo + 'T23:59:59')) return false;
                if (filters.warehouseId !== 'all' && t.warehouseId !== filters.warehouseId && t.relatedWarehouseId !== filters.warehouseId) return false;
                if (filters.userId !== 'all' && t.userId !== filters.userId) return false;
                if (filters.type !== 'all' && t.type !== filters.type) return false;
                if (filters.productSearch && !t.productName.toLowerCase().includes(filters.productSearch.toLowerCase()) && !t.productSku.toLowerCase().includes(filters.productSearch.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filters]);

    const isAnyFilterActive = filters.dateFrom !== '' || filters.dateTo !== '' || filters.warehouseId !== 'all' || filters.userId !== 'all' || filters.type !== 'all' || filters.productSearch !== '';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">감사 기록</h2>
                <div>
                     <button onClick={() => onExport(filteredTransactions)} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        CSV로 내보내기
                    </button>
                </div>
            </div>

            <div className="mb-6 p-4 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                     <div className="flex items-center space-x-2 overflow-x-auto pb-1 w-full md:w-auto">
                        {['today', 'week', 'month', 'year'].map(period => (
                            <button 
                                key={period} 
                                onClick={() => setDateRange(period as any)} 
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap transition-colors"
                            >
                                { {today: '오늘', week: '이번 주', month: '이번 달', year: '올해'}[period] }
                            </button>
                        ))}
                    </div>
                    {isAnyFilterActive && (
                        <button 
                            onClick={handleResetFilters} 
                            className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            필터 초기화
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" name="productSearch" placeholder="상품명/SKU 검색..." value={filters.productSearch} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"/>
                    <select name="warehouseId" value={filters.warehouseId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">모든 창고</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <select name="userId" value={filters.userId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">모든 사용자</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">모든 유형</option>
                        {Object.values(TransactionType).map(t => <option key={t} value={t}>{getTransactionTypeName(t)}</option>)}
                    </select>
                     <div>
                        <input type="date" id="dateFrom" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" placeholder="시작일"/>
                    </div>
                    <div>
                        <input type="date" id="dateTo" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" placeholder="종료일"/>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                 <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">창고</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수량</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">관련 창고</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">담당자</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(t => {
                                const user = users.find(u => u.id === t.userId);
                                const warehouse = warehouses.find(w => w.id === t.warehouseId);
                                const relatedWarehouseName = t.relatedWarehouseId ? warehouses.find(w => w.id === t.relatedWarehouseId)?.name : '-';
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{warehouse?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium"><TransactionTypeInfo type={t.type} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t.productName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {t.productSku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            {t.type === TransactionType.OUT || t.type === TransactionType.DELETE || t.type === TransactionType.QUICK_SHIP || t.type === TransactionType.SHIP ? (
                                                <span className="text-red-600 dark:text-red-400">-{t.quantity.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-green-600 dark:text-green-400">+{t.quantity.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{relatedWarehouseName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user?.name || '알 수 없음'}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">필터 조건에 맞는 거래 내역이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditTrail;
