
import React, { useState, useMemo } from 'react';
import { Transaction, User, Warehouse, TransactionType } from '../types';
import TransactionTypeInfo, { getTransactionTypeName } from './TransactionTypeInfo';
import { ArrowDownTrayIcon, XMarkIcon, CurrencyDollarIcon } from './Icons';

interface TransactionPageProps {
    transactions: Transaction[];
    users: User[];
    warehouses: Warehouse[];
    onExport: (data: Transaction[]) => void;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ transactions, users, warehouses, onExport }) => {
    const [filters, setFilters] = useState({
        dateFrom: '',
        dateTo: '',
        warehouseId: 'all',
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
                if (filters.type !== 'all' && t.type !== filters.type) return false;
                if (filters.productSearch && !t.productName.toLowerCase().includes(filters.productSearch.toLowerCase()) && !t.productSku.toLowerCase().includes(filters.productSearch.toLowerCase())) return false;
                // Ensure we only show transactions that likely have financial implications or are significant
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filters]);

    const financials = useMemo(() => {
        let totalIncoming = 0;
        let totalOutgoing = 0;

        const incomingTypes = [TransactionType.IN, TransactionType.RECEIVE, TransactionType.CREATE, TransactionType.QUICK_RECEIVE];
        const outgoingTypes = [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP];

        filteredTransactions.forEach(t => {
            const value = t.totalValue || 0;
            if (incomingTypes.includes(t.type)) {
                totalIncoming += value;
            } else if (outgoingTypes.includes(t.type)) {
                totalOutgoing += value;
            }
        });

        return { totalIncoming, totalOutgoing, net: totalIncoming - totalOutgoing };
    }, [filteredTransactions]);

    const dailyStats = useMemo(() => {
        const stats: Record<string, { income: number; expense: number }> = {};

        filteredTransactions.forEach(t => {
            const dateKey = t.date.split('T')[0];
            if (!stats[dateKey]) stats[dateKey] = { income: 0, expense: 0 };

            const value = t.totalValue || 0;
            const incomingTypes = [TransactionType.IN, TransactionType.RECEIVE, TransactionType.CREATE, TransactionType.QUICK_RECEIVE];
            const outgoingTypes = [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP];

            if (incomingTypes.includes(t.type)) {
                stats[dateKey].income += value;
            } else if (outgoingTypes.includes(t.type)) {
                stats[dateKey].expense += value;
            }
        });

        return Object.entries(stats)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, values]) => ({ date, ...values }));
    }, [filteredTransactions]);

    const isAnyFilterActive = filters.dateFrom !== '' || filters.dateTo !== '' || filters.warehouseId !== 'all' || filters.type !== 'all' || filters.productSearch !== '';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <CurrencyDollarIcon className="w-6 h-6 mr-2 text-blue-600" />
                    거래 관리 및 보고
                </h2>
                 <div>
                     <button onClick={() => onExport(filteredTransactions)} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto justify-center">
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        CSV로 내보내기
                    </button>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-green-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 입고 금액</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{financials.totalIncoming.toLocaleString()}원</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-red-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">총 출고 금액</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{financials.totalOutgoing.toLocaleString()}원</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500 dark:text-gray-400">순 거래 금액</p>
                    <p className={`text-2xl font-bold ${financials.net >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {financials.net > 0 ? '+' : ''}{financials.net.toLocaleString()}원
                    </p>
                </div>
            </div>

            {/* Daily Transaction Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">일별 거래 금액 추이</h3>
                <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 px-2 overflow-x-auto custom-scrollbar">
                    {dailyStats.length > 0 ? (
                        dailyStats.map((data) => {
                            const maxVal = Math.max(...dailyStats.map(d => Math.max(d.income, d.expense)));
                            const incomeHeight = maxVal ? (data.income / maxVal) * 100 : 0;
                            const expenseHeight = maxVal ? (data.expense / maxVal) * 100 : 0;

                            return (
                                <div key={data.date} className="flex flex-col justify-end items-center flex-1 h-full group relative min-w-[40px]">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-gray-800 text-white text-xs rounded p-2 shadow-lg whitespace-nowrap">
                                        <div className="font-bold">{data.date}</div>
                                        <div className="text-green-400">입고: {data.income.toLocaleString()}원</div>
                                        <div className="text-red-400">출고: {data.expense.toLocaleString()}원</div>
                                    </div>

                                    <div className="flex gap-1 items-end w-full justify-center h-full px-1">
                                        <div style={{ height: `${incomeHeight}%` }} className="w-1/2 bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-all"></div>
                                        <div style={{ height: `${expenseHeight}%` }} className="w-1/2 bg-red-500 rounded-t opacity-80 hover:opacity-100 transition-all"></div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{data.date.substring(5)}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">기간 내 데이터가 없습니다.</div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <input type="text" name="productSearch" placeholder="상품명/SKU 검색..." value={filters.productSearch} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"/>
                        <select name="warehouseId" value={filters.warehouseId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">모든 창고</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">모든 거래 유형</option>
                            {Object.values(TransactionType).map(t => <option key={t} value={t}>{getTransactionTypeName(t)}</option>)}
                        </select>
                        <div className="flex space-x-2">
                            <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                            <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">창고</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">구분</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수량</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">단가</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총액</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">담당자</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredTransactions.length > 0 ? filteredTransactions.map(t => {
                                const user = users.find(u => u.id === t.userId);
                                const warehouse = warehouses.find(w => w.id === t.warehouseId);
                                const isNegative = [TransactionType.OUT, TransactionType.DELETE, TransactionType.SHIP, TransactionType.QUICK_SHIP].includes(t.type);
                                const unitPrice = t.totalValue ? t.totalValue / t.quantity : 0;

                                return (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{warehouse?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium"><TransactionTypeInfo type={t.type} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t.productName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {t.productSku}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100 font-medium">
                                            {t.quantity.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                                            {unitPrice.toLocaleString()}원
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                            {isNegative ? '-' : '+'}{(t.totalValue || 0).toLocaleString()}원
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user?.name || '알 수 없음'}</td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">거래 내역이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionPage;
