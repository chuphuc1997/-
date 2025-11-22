
import React from 'react';
import { ArchiveBoxIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ClockIcon, SearchIcon, TagIcon, XMarkIcon } from './Icons';
import { ProductFilterStatus, ProductFilterExpiration } from '../types';

interface FilterCounts {
    'in-stock': number;
    'low-stock': number;
    'out-of-stock': number;
    'valid': number;
    'expiring-soon': number;
    'expired': number;
    [key: string]: number; // To allow for category counts
}

interface ProductFiltersProps {
    statusFilter: ProductFilterStatus;
    expirationFilter: ProductFilterExpiration;
    categoryFilter: string;
    skuFilter: string;
    onStatusFilterChange: (status: ProductFilterStatus) => void;
    onExpirationFilterChange: (expiration: ProductFilterExpiration) => void;
    onCategoryFilterChange: (category: string) => void;
    onSkuFilterChange: (sku: string) => void;
    onClearFilters: () => void;
    categories: string[];
    counts: FilterCounts | null;
    totalProducts: number;
}

const FilterButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    icon: React.ReactNode;
    label: string;
    count?: number;
}> = ({ onClick, isActive, icon, label, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition whitespace-nowrap flex-shrink-0 ${
            isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
    >
        {icon}
        {label}
        {count !== undefined && (
            <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${isActive ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                {count.toLocaleString()}
            </span>
        )}
    </button>
);

const ProductFilters: React.FC<ProductFiltersProps> = ({
    statusFilter,
    expirationFilter,
    categoryFilter,
    skuFilter,
    onStatusFilterChange,
    onExpirationFilterChange,
    onCategoryFilterChange,
    onSkuFilterChange,
    onClearFilters,
    categories,
    counts,
    totalProducts
}) => {
    const isAnyFilterActive = statusFilter !== 'all' || expirationFilter !== 'all' || categoryFilter !== 'all' || skuFilter !== '';

    const statusFilters: { id: ProductFilterStatus; text: string; icon: React.ReactNode; countKey: keyof FilterCounts | 'all' }[] = [
        { id: 'all', text: '전체', icon: <ArchiveBoxIcon className="w-4 h-4 mr-1.5" />, countKey: 'all' },
        { id: 'in-stock', text: '재고 양호', icon: <CheckCircleIcon className="w-4 h-4 mr-1.5" />, countKey: 'in-stock' },
        { id: 'low-stock', text: '재고 부족', icon: <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />, countKey: 'low-stock' },
        { id: 'out-of-stock', text: '재고 없음', icon: <XCircleIcon className="w-4 h-4 mr-1.5" />, countKey: 'out-of-stock' },
    ];

    const expirationFilters: { id: ProductFilterExpiration; text: string; icon: React.ReactNode; countKey: keyof FilterCounts | 'all' }[] = [
        { id: 'all', text: '전체', icon: <ClockIcon className="w-4 h-4 mr-1.5" />, countKey: 'all' },
        { id: 'valid', text: '유효', icon: <CheckCircleIcon className="w-4 h-4 mr-1.5" />, countKey: 'valid' },
        { id: 'expiring-soon', text: '만료 임박', icon: <ExclamationTriangleIcon className="w-4 h-4 mr-1.5" />, countKey: 'expiring-soon' },
        { id: 'expired', text: '만료', icon: <XCircleIcon className="w-4 h-4 mr-1.5" />, countKey: 'expired' },
    ];

    return (
        <div className="mb-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="space-y-4">
                 {/* Status Filters */}
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px] text-left sm:text-right sm:pr-2">재고 상태</span>
                    <div className="flex flex-nowrap overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                        {statusFilters.map(({ id, text, icon, countKey }) => (
                            <FilterButton
                                key={id}
                                onClick={() => onStatusFilterChange(id)}
                                isActive={statusFilter === id}
                                icon={icon}
                                label={text}
                                count={countKey === 'all' ? totalProducts : counts?.[countKey]}
                            />
                        ))}
                    </div>
                </div>

                {/* Expiration Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px] text-left sm:text-right sm:pr-2">유통기한</span>
                    <div className="flex flex-nowrap overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                        {expirationFilters.map(({ id, text, icon, countKey }) => (
                            <FilterButton
                                key={id}
                                onClick={() => onExpirationFilterChange(id)}
                                isActive={expirationFilter === id}
                                icon={icon}
                                label={text}
                                count={countKey === 'all' ? totalProducts : counts?.[countKey]}
                            />
                        ))}
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px] text-left sm:text-right sm:pr-2">카테고리</span>
                    <div className="flex flex-nowrap overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                        <FilterButton
                            onClick={() => onCategoryFilterChange('all')}
                            isActive={categoryFilter === 'all'}
                            icon={<TagIcon className="w-4 h-4 mr-1.5" />}
                            label="모두"
                            count={totalProducts}
                        />
                        {categories.map(cat => (
                            <FilterButton
                                key={cat}
                                onClick={() => onCategoryFilterChange(cat)}
                                isActive={categoryFilter === cat}
                                icon={<TagIcon className="w-4 h-4 mr-1.5" />}
                                label={cat}
                                count={counts?.[cat]}
                            />
                        ))}
                    </div>
                </div>

                {/* SKU Search & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 sm:border-0">
                    <div className="flex items-center w-full sm:w-auto gap-2">
                         <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[70px] text-left sm:text-right sm:pr-2">SKU 검색</span>
                         <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={skuFilter}
                                onChange={(e) => onSkuFilterChange(e.target.value)}
                                placeholder="SKU 입력..."
                                className="w-full pl-9 pr-3 py-1.5 text-sm font-medium rounded-md transition bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                     {isAnyFilterActive && (
                        <button 
                            onClick={onClearFilters}
                            className="w-full sm:w-auto mt-1 sm:mt-0 ml-auto sm:ml-4 px-4 py-2 text-xs font-semibold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center"
                        >
                            <XMarkIcon className="w-3.5 h-3.5 mr-1.5" />
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
