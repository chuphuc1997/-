
import React, { useMemo } from 'react';
import { Warehouse } from '../types';
import { CubeIcon, ExclamationTriangleIcon } from './Icons';

interface CategoryStockSummaryProps {
  warehouses: Warehouse[];
}

const CategoryStockSummary: React.FC<CategoryStockSummaryProps> = ({ warehouses }) => {
  const categorySummary = useMemo(() => {
    const categories: Record<string, {
        totalQuantity: number;
        lowStockCount: number;
        uniqueProducts: Set<string>;
    }> = {};

    warehouses.forEach(wh => {
        wh.products.forEach(p => {
            const catName = p.category || '미분류';
            if (!categories[catName]) {
                categories[catName] = { totalQuantity: 0, lowStockCount: 0, uniqueProducts: new Set() };
            }
            categories[catName].totalQuantity += p.quantity;
            categories[catName].uniqueProducts.add(p.sku); // Count unique SKUs

            if (p.minStockLevel !== undefined && p.quantity < p.minStockLevel) {
                categories[catName].lowStockCount += 1;
            }
        });
    });

    return Object.entries(categories)
        .map(([name, data]) => ({
            name,
            totalQuantity: data.totalQuantity,
            lowStockCount: data.lowStockCount,
            uniqueProductCount: data.uniqueProducts.size,
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [warehouses]);

  const chartData = categorySummary.slice(0, 7);
  const maxValue = Math.max(...chartData.map(item => item.totalQuantity), 0);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">카테고리별 재고 요약</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Section */}
        <div className="flex flex-col justify-between h-full min-h-[300px]">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">재고 수량 Top 7</h4>
          <div className="flex items-end justify-around h-64 pt-4 space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            {maxValue > 0 ? chartData.map((item, index) => (
              <div key={item.name} className="flex flex-col items-center flex-1 group relative">
                 {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        {item.name}: {item.totalQuantity.toLocaleString()}
                    </div>
                </div>
                
                <div className="w-full flex justify-center items-end h-full relative">
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${colors[index % colors.length]} hover:opacity-80`}
                    style={{ height: `${(item.totalQuantity / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2 w-full truncate px-1" title={item.name}>
                    {item.name}
                </div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5">
                    {item.totalQuantity.toLocaleString()}
                </div>
              </div>
            )) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400">데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* Details List Section */}
        <div className="flex flex-col h-full min-h-[300px]">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">상세 현황</h4>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 max-h-80">
            <ul className="space-y-3">
                {categorySummary.map((cat) => (
                <li key={cat.name} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800 dark:text-gray-200">{cat.name}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {cat.uniqueProductCount} 품목 (SKU)
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-600">
                             <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                <CubeIcon className="w-3.5 h-3.5 mr-1.5" />
                                총 수량
                             </div>
                             <span className="font-bold text-gray-900 dark:text-white text-sm">{cat.totalQuantity.toLocaleString()}</span>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded border ${cat.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-600'}`}>
                             <div className={`flex items-center text-xs ${cat.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1.5" />
                                재고 부족
                             </div>
                             <span className={`font-bold text-sm ${cat.lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{cat.lowStockCount.toLocaleString()}</span>
                        </div>
                    </div>
                </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryStockSummary;
