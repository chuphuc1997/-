
import React from 'react';
import { Warehouse } from '../types';
import { WarehouseIcon, MapPinIcon, ExclamationTriangleIcon, CubeIcon } from './Icons';

interface WarehouseSummaryProps {
  warehouses: Warehouse[];
  onSelectWarehouse: (warehouseId: string, filter?: 'low-stock') => void;
}

const WarehouseSummary: React.FC<WarehouseSummaryProps> = ({ warehouses, onSelectWarehouse }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
        <WarehouseIcon className="w-6 h-6 mr-2 text-blue-600" />
        창고별 재고 요약
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {warehouses.map(wh => {
          const totalQuantity = wh.products.reduce((sum, p) => sum + p.quantity, 0);
          const lowStockCount = wh.products.filter(p => p.minStockLevel !== undefined && p.quantity < p.minStockLevel).length;

          return (
            <div 
              key={wh.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectWarehouse(wh.id)}
            >
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/40 transition-colors">
                       <WarehouseIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{wh.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <MapPinIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{wh.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Total Quantity Widget */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <CubeIcon className="w-3.5 h-3.5 mr-1.5" />
                      총 재고
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{totalQuantity.toLocaleString()}</span>
                  </div>

                  {/* Low Stock Widget (Clickable) */}
                  <div 
                    className={`p-3 rounded-lg border flex flex-col transition-all duration-200 ${
                        lowStockCount > 0 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer hover:shadow-sm active:scale-95' 
                        : 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30'
                    }`}
                    onClick={(e) => {
                        if (lowStockCount > 0) {
                            e.stopPropagation();
                            onSelectWarehouse(wh.id, 'low-stock');
                        }
                    }}
                    title={lowStockCount > 0 ? "클릭하여 재고 부족 상품 보기" : "재고 상태 양호"}
                  >
                    <div className={`flex items-center text-xs font-medium mb-1 ${lowStockCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      <ExclamationTriangleIcon className="w-3.5 h-3.5 mr-1.5" />
                      {lowStockCount > 0 ? '재고 부족' : '상태 양호'}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className={`text-xl font-bold ${lowStockCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                            {lowStockCount.toLocaleString()}
                        </span>
                        {lowStockCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-white/50 dark:bg-black/20 rounded text-red-700 dark:text-red-300">
                                확인 &rarr;
                            </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarehouseSummary;
