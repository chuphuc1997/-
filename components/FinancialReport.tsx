
import React, { useMemo, useState } from 'react';
import { Warehouse, Transaction, TransactionType } from '../types';
import { CurrencyDollarIcon, ChartBarIcon, CubeIcon, WarehouseIcon, CalendarDaysIcon, ArrowDownTrayIcon } from './Icons';

interface FinancialReportProps {
    warehouses: Warehouse[];
    transactions: Transaction[];
    onExport: () => void;
}

// Hex colors for charts
const CHART_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#6b7280'];

const PieChart: React.FC<{ data: { name: string; value: number }[], totalValue: number }> = ({ data, totalValue }) => {
    if (totalValue === 0) return <div className="flex items-center justify-center h-32 text-sm text-gray-500">데이터 없음</div>;

    let cumulativePercent = 0;
    const gradientStops = data.map((item, index) => {
        const start = cumulativePercent;
        const percent = (item.value / totalValue) * 100;
        cumulativePercent += percent;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        return `${color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-4 sm:gap-8">
             <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                <div 
                    className="w-full h-full rounded-full shadow-inner"
                    style={{ background: `conic-gradient(${gradientStops})` }}
                ></div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
                <div className="grid grid-cols-1 gap-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center text-xs sm:text-sm justify-between">
                            <div className="flex items-center truncate mr-2">
                                <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                                <span className="truncate text-gray-700 dark:text-gray-300" title={item.name}>{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                {item.value.toLocaleString()}원 ({((item.value / totalValue) * 100).toFixed(1)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FinancialReport: React.FC<FinancialReportProps> = ({ warehouses, transactions, onExport }) => {
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

    const setQuickDateRange = (period: 'week' | 'month' | 'year') => {
        const today = new Date();
        let from = new Date();

        switch (period) {
            case 'week': from.setDate(today.getDate() - today.getDay()); break;
            case 'month': from.setDate(1); break;
            case 'year': from = new Date(today.getFullYear(), 0, 1); break;
        }
        setDateRange({ from: from.toISOString().split('T')[0], to: today.toISOString().split('T')[0] });
    };

    // 1. Current Asset Value (Snapshot based on current warehouse state)
    const currentAssetStats = useMemo(() => {
        let totalValue = 0;
        const warehouseValues: Record<string, number> = {};
        const categoryValues: Record<string, number> = {};
        const topProducts: { name: string; warehouse: string; quantity: number; value: number }[] = [];

        warehouses.forEach(wh => {
            let whValue = 0;
            wh.products.forEach(p => {
                const pValue = p.quantity * p.price;
                whValue += pValue;
                totalValue += pValue;

                const cat = p.category || '미분류';
                categoryValues[cat] = (categoryValues[cat] || 0) + pValue;

                topProducts.push({
                    name: p.name,
                    warehouse: wh.name,
                    quantity: p.quantity,
                    value: pValue
                });
            });
            warehouseValues[wh.name] = whValue;
        });

        // Sort and limit top products
        topProducts.sort((a, b) => b.value - a.value);

        return {
            totalValue,
            warehouseData: Object.entries(warehouseValues).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            categoryData: Object.entries(categoryValues).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
            topProducts: topProducts.slice(0, 5)
        };
    }, [warehouses]);

    // 2. Financial Flow (Based on transactions)
    const flowStats = useMemo(() => {
        let income = 0;
        let expense = 0;
        const dailyData: Record<string, { income: number; expense: number }> = {};

        const filtered = transactions.filter(t => {
            if (!t.totalValue) return false;
            const tDate = new Date(t.date);
            if (dateRange.from && tDate < new Date(dateRange.from)) return false;
            if (dateRange.to && tDate > new Date(dateRange.to + 'T23:59:59')) return false;
            return true;
        });

        filtered.forEach(t => {
            const dateKey = t.date.split('T')[0];
            if (!dailyData[dateKey]) dailyData[dateKey] = { income: 0, expense: 0 };

            const value = t.totalValue || 0;
            // Income: Receiving stock (Value added to warehouse)
            // Expense: Shipping stock (Value removed from warehouse)
            // Note: This interprets "Inventory Value Flow". 
            // RECEIVE = Money spent to buy stock (Asset increase, Cash decrease).
            // SHIP = Money gained from sales (Asset decrease, Cash increase).
            // Here we track "Asset Value Flow".
            
            const incomingTypes = [TransactionType.IN, TransactionType.RECEIVE, TransactionType.CREATE, TransactionType.QUICK_RECEIVE];
            const outgoingTypes = [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP];

            if (incomingTypes.includes(t.type)) {
                income += value;
                dailyData[dateKey].income += value;
            } else if (outgoingTypes.includes(t.type)) {
                expense += value;
                dailyData[dateKey].expense += value;
            }
        });

        const sortedDates = Object.keys(dailyData).sort();
        const chartData = sortedDates.map(date => ({
            date,
            ...dailyData[date]
        }));

        return { income, expense, net: income - expense, chartData };
    }, [transactions, dateRange]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 mr-2 text-blue-600" />
                    재무 보고서
                </h2>
                <button onClick={onExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    보고서 내보내기
                </button>
            </div>

            {/* Top Cards - Current Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold opacity-90">총 자산 가치 (현재)</h3>
                        <CubeIcon className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">{currentAssetStats.totalValue.toLocaleString()}원</p>
                    <p className="text-sm mt-2 opacity-75">모든 창고 재고 합계</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">기간 내 입고 가치</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Asset Increase</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">+{flowStats.income.toLocaleString()}원</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">기간 내 출고 가치</h3>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Asset Decrease</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">-{flowStats.expense.toLocaleString()}원</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Warehouse Value Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                        <WarehouseIcon className="w-5 h-5 mr-2 text-gray-500" />
                        창고별 자산 가치
                    </h3>
                    <div className="h-64">
                        <PieChart data={currentAssetStats.warehouseData} totalValue={currentAssetStats.totalValue} />
                    </div>
                </div>

                {/* Category Value Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                        <ChartBarIcon className="w-5 h-5 mr-2 text-gray-500" />
                        카테고리별 자산 가치
                    </h3>
                    <div className="h-64">
                        <PieChart data={currentAssetStats.categoryData} totalValue={currentAssetStats.totalValue} />
                    </div>
                </div>
            </div>

            {/* Flow Chart & Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">자산 변동 추이</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {(['week', 'month', 'year'] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setQuickDateRange(period)}
                                    className="px-3 py-1 text-xs font-medium rounded-md hover:bg-white dark:hover:bg-gray-600 shadow-sm transition-all"
                                >
                                    {period === 'week' ? '이번 주' : period === 'month' ? '이번 달' : '올해'}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                            <input 
                                type="date" 
                                value={dateRange.from} 
                                onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} 
                                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
                            />
                            <span className="text-gray-400">~</span>
                            <input 
                                type="date" 
                                value={dateRange.to} 
                                onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} 
                                className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Simple CSS Bar Chart for Trend */}
                <div className="h-64 flex items-end justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 px-2">
                    {flowStats.chartData.length > 0 ? (
                        flowStats.chartData.map((data, idx) => {
                            const maxVal = Math.max(...flowStats.chartData.map(d => Math.max(d.income, d.expense)));
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

             {/* Top Value Products Table */}
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">자산 가치 Top 5 상품</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">순위</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품명</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">창고</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수량</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총 가치</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {currentAssetStats.topProducts.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-bold">#{idx + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.warehouse}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">{item.quantity.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600 dark:text-blue-400">{item.value.toLocaleString()}원</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancialReport;
