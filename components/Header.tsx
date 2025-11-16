
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WarehouseIcon, UserCircleIcon, SearchIcon, PackageIcon, BellIcon, ExclamationTriangleIcon } from './Icons';
import { User, Warehouse, Product, LowStockNotification } from '../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  warehouses: Warehouse[];
  onSearchResultClick: (warehouseId: string, productId: string) => void;
  notifications: LowStockNotification[];
  onDismissAllNotifications: () => void;
}

interface SearchResult {
  product: Product;
  warehouse: Warehouse;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, warehouses, onSearchResultClick, notifications, onDismissAllNotifications }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) {
      return [];
    }
    const results: SearchResult[] = [];
    const lowercasedTerm = searchTerm.toLowerCase();
    
    for (const warehouse of warehouses) {
      for (const product of warehouse.products) {
        if (
          product.name.toLowerCase().includes(lowercasedTerm) ||
          product.sku.toLowerCase().includes(lowercasedTerm)
        ) {
          results.push({ product, warehouse });
        }
      }
    }
    return results;
  }, [searchTerm, warehouses]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleResultClick = (warehouseId: string, productId: string) => {
    onSearchResultClick(warehouseId, productId);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleNotificationClick = (warehouseId: string, productId: string) => {
    onSearchResultClick(warehouseId, productId);
    setShowNotifications(false);
  };
  
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <WarehouseIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">
              재고 관리
            </h1>
          </div>
          
          <div className="flex-1 flex justify-center px-2 lg:ml-6" ref={searchContainerRef}>
            <div className="w-full max-w-lg lg:max-w-xs relative">
              <label htmlFor="search" className="sr-only">상품 검색</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="상품명 또는 SKU 검색"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  autoComplete="off"
                />
              </div>
              {showResults && searchTerm.length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map(({ product, warehouse }) => (
                        <li key={`${warehouse.id}-${product.id}`}>
                          <button
                            onClick={() => handleResultClick(warehouse.id, product.id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-start"
                          >
                            <PackageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">창고: {warehouse.name}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      검색 결과가 없습니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
             <div className="relative" ref={notificationContainerRef}>
              <button onClick={() => setShowNotifications(prev => !prev)} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <BellIcon className="h-6 w-6" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                 <div className="absolute z-10 mt-2 w-80 right-0 bg-white dark:bg-gray-700 shadow-lg rounded-md max-h-96 overflow-y-auto">
                   <div className="p-3 font-semibold border-b dark:border-gray-600 text-gray-800 dark:text-gray-100">알림</div>
                   {unreadNotifications.length > 0 ? (
                     <>
                      <ul>
                        {unreadNotifications.map((notification) => (
                           <li key={notification.id} className="border-b dark:border-gray-600">
                             <button
                               onClick={() => handleNotificationClick(notification.warehouseId, notification.productId)}
                               className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-start"
                             >
                               <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" />
                               <div>
                                 <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.productName}</p>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">{notification.warehouseName}</p>
                                 <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                                   재고 부족: {notification.currentQuantity} / {notification.minStockLevel}
                                 </p>
                               </div>
                             </button>
                           </li>
                         ))}
                       </ul>
                       <div className="p-2">
                         <button
                           onClick={onDismissAllNotifications}
                           className="w-full text-center text-sm py-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                         >
                           모두 읽음으로 표시
                         </button>
                       </div>
                     </>
                   ) : (
                     <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                       새로운 알림이 없습니다.
                     </div>
                   )}
                 </div>
              )}
            </div>

            <div className="flex items-center">
              <UserCircleIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
              <span className="ml-2 font-semibold text-gray-700 dark:text-gray-200 hidden md:inline">
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
