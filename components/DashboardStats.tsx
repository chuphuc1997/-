
import React from 'react';
import { PackageIcon, CubeIcon, ExclamationTriangleIcon, ClockIcon, XCircleIcon } from './Icons';

interface DashboardStatsProps {
  stats: {
    totalUniqueProducts: number;
    totalStockQuantity: number;
    lowStockProductsCount: number;
    expiringSoonCount: number;
    expiredCount: number;
  };
  onClickStat?: (type: 'low-stock' | 'expiring-soon' | 'expired') => void;
}

const StatCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    value: string | number; 
    colorClass: string;
    onClick?: () => void;
}> = ({ icon, title, value, colorClass, onClick }) => (
  <div 
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
    onClick={onClick}
  >
    <div className={`rounded-full p-3 ${colorClass}`}>
      {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
    </div>
  </div>
);


const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onClickStat }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <StatCard
        icon={<PackageIcon className="h-6 w-6 text-blue-800 dark:text-blue-200" title="총 상품 종류" />}
        title="총 상품 종류"
        value={stats.totalUniqueProducts}
        colorClass="bg-blue-100 dark:bg-blue-900/40"
      />
      <StatCard
        icon={<CubeIcon className="h-6 w-6 text-green-800 dark:text-green-200" title="총 재고량" />}
        title="총 재고량"
        value={stats.totalStockQuantity}
        colorClass="bg-green-100 dark:bg-green-900/40"
      />
      <StatCard
        icon={<ExclamationTriangleIcon className="h-6 w-6 text-yellow-800 dark:text-yellow-200" title="재고 부족" />}
        title="재고 부족"
        value={stats.lowStockProductsCount}
        colorClass="bg-yellow-100 dark:bg-yellow-900/40"
        onClick={() => onClickStat && onClickStat('low-stock')}
      />
      <StatCard
        icon={<ClockIcon className="h-6 w-6 text-orange-800 dark:text-orange-200" title="만료 임박" />}
        title="만료 임박"
        value={stats.expiringSoonCount}
        colorClass="bg-orange-100 dark:bg-orange-900/40"
        onClick={() => onClickStat && onClickStat('expiring-soon')}
      />
      <StatCard
        icon={<XCircleIcon className="h-6 w-6 text-red-800 dark:text-red-200" title="만료됨" />}
        title="만료됨"
        value={stats.expiredCount}
        colorClass="bg-red-100 dark:bg-red-900/40"
        onClick={() => onClickStat && onClickStat('expired')}
      />
    </div>
  );
};

export default DashboardStats;
