import React, { useState, useMemo } from 'react';
import { Transaction, Warehouse, TransactionType } from '../types';
import { ChartBarIcon, CubeIcon, PackageIcon, ChevronLeftIcon, ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, ArrowRightLeftIcon } from './Icons';

interface StatisticsReportProps {
    transactions: Transaction[];
    warehouses: Warehouse[];
    onBack: () => void;
}

type Period = 'weekly' | 'monthly' | 'yearly';

const getWeek = (date: Date): [number, number] => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
};

const getPeriodKey = (date: Date, period: Period): string => {
    const d = new Date(date);
    switch (period) {
        case 'yearly':
            return d.getFullYear().toString();
        case 'monthly':
            return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        case 'weekly':
            const [year, week] = getWeek(d);
            return `${year}-W${week.toString().padStart(2, '0')}`;
    }
};

const getPeriodTitle = (key: string, period: Period): string => {
    switch (period) {
        case 'yearly':
            return `${key}년`;
        case 'monthly':
            const [year, month] = key.split('-');
            return `${year}년 ${month}월`;
        case 'weekly':
            const [wYear, week] = key.split('-W');
            return `${wYear}년 ${week}주차`;
    }
};

const findTopPerformer = (activity: Record<string, number>, items: {id: string, name: string}[], key: 'product' | 'warehouse') => {
    const topId = Object.entries(activity).sort(([, a], [, b]) => b - a)[0]?.[0];
    if (!topId) return '해당 없음';
    const topItem = items.find(item => item.id === topId);
    return topItem ? topItem.name : '알 수 없음';
};

// Fix: Add interface for aggregated data to fix typing issues.
interface AggregatedData {
    key: string;
    totalReceived: number;
    totalShipped: number;
    transactionCount: number;
    productActivity: Record<string, number>;
    warehouseActivity: Record<string, number>;
}


const StatisticsReport: React.FC<StatisticsReportProps> = ({ transactions, warehouses, onBack }) => {
    const [period, setPeriod] = useState<Period>('monthly');
    
    const allProducts = useMemo(() => {
        const productMap = new Map<string, { id: string, name: string }>();
        transactions.forEach(t => {
            if (!productMap.has(t.productId)) {
                productMap.set(t.productId, { id: t.productId, name: t.productName });
            }
        });
        return Array.from(productMap.values());
    }, [transactions]);

    const aggregatedData = useMemo(() => {
        const receivedTypes = [TransactionType.CREATE, TransactionType.RECEIVE, TransactionType.IN, TransactionType.QUICK_RECEIVE];
        const shippedTypes = [TransactionType.OUT, TransactionType.DELETE, TransactionType.QUICK_SHIP];

        const grouped = transactions.reduce((acc, t) => {
            const key = getPeriodKey(new Date(t.date), period);
            if (!acc[key]) {
                acc[key] = {
                    key: key,
                    totalReceived: 0,
                    totalShipped: 0,
                    transactionCount: 0,
                    productActivity: {} as Record<string, number>,
                    warehouseActivity: {} as Record<string, number>,
                };
            }
            const group = acc[key];
            group.transactionCount++;
            
            if (receivedTypes.includes(t.type)) {
                group.totalReceived += t.quantity;
            } else if (shippedTypes.includes(t.type)) {
                group.totalShipped += t.quantity;
            }
            
            group.productActivity[t.productId] = (group.productActivity[t.productId] || 0) + t.quantity;
            group.warehouseActivity[t.warehouseId] = (group.warehouseActivity[t.warehouseId] || 0) + 1;
            if(t.relatedWarehouseId) {
                group.warehouseActivity[t.relatedWarehouseId] = (group.warehouseActivity[t.relatedWarehouseId] || 0) + 1;
            }

            return acc;
        // Fix: Use the AggregatedData interface to properly type the accumulator.
        }, {} as Record<string, AggregatedData>);

        return Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key));

    }, [transactions, period]);

    const PeriodButton: React.FC<{p: Period, label: string}> = ({ p, label }) => (
        <button
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-semibold rounded-md ${period === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              대시보드로 돌아가기
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center"><ChartBarIcon className="mr-3"/>통계 보고서</h2>
                    <div className="flex items-center space-x-2 p-1 bg-gray-200 dark:bg-gray-900 rounded-lg">
                       <PeriodButton p="weekly" label="주별" />
                       <PeriodButton p="monthly" label="월별" />
                       <PeriodButton p="yearly" label="연도별" />
                    </div>
                </div>

                {aggregatedData.length > 0 ? (
                    <div className="space-y-6">
                        {aggregatedData.map(data => (
                            <div key={data.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">{getPeriodTitle(data.key, period)}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center"><ArrowDownOnSquareIcon className="mr-2"/>총 입고량</p>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-200">{data.totalReceived.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center"><ArrowUpOnSquareIcon className="mr-2"/>총 출고량</p>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-200">{data.totalShipped.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center"><ArrowRightLeftIcon className="mr-2"/>순 재고 변동</p>
                                        <p className={`text-2xl font-bold ${data.totalReceived - data.totalShipped >= 0 ? 'text-blue-700 dark:text-blue-200' : 'text-red-700 dark:text-red-200'}`}>
                                            {(data.totalReceived - data.totalShipped).toLocaleString()}
                                        </p>
                                    </div>
                                     <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">총 거래 수</p>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.transactionCount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center"><PackageIcon className="w-4 h-4 mr-2"/>거래량 TOP 상품</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{findTopPerformer(data.productActivity, allProducts, 'product')}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center"><CubeIcon className="w-4 h-4 mr-2"/>활동량 TOP 창고</p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{findTopPerformer(data.warehouseActivity, warehouses, 'warehouse')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">선택한 기간에 대한 거래 데이터가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsReport;