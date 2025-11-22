
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserCircleIcon, SearchIcon, PackageIcon, BellIcon, ExclamationTriangleIcon, Cog6ToothIcon, LogoutIcon, Bars3Icon, XMarkIcon, ChevronLeftIcon } from './Icons';
import { User, Warehouse, Product, AppNotification, NotificationType, LowStockNotification, ExpirationNotification } from '../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  warehouses: Warehouse[];
  onSearchResultClick: (warehouseId: string, productId: string) => void;
  notifications: AppNotification[];
  onDismissAllNotifications: () => void;
  onToggleNotificationRead: (notificationId: string) => void;
  onOpenSettings: () => void;
  canAccessSettings: boolean;
  pageTitle: string;
  onMenuClick: () => void;
}

interface SearchResult {
  product: Product;
  warehouse: Warehouse;
}

// Helper component for rendering images with a fallback
const ImageWithFallback: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError || !src) {
        return <PackageIcon className={`${className} text-gray-400`} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className={`${className} object-cover`}
        />
    );
};


// Helper component for highlighting search matches
const HighlightMatch: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  // Escape regex special characters in the highlight string
  const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        // The parts array from split with a capturing group will have the matched delimiter at odd indices.
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-sm">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const getRelevanceScore = (text: string, term: string): number => {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    
    const index = lowerText.indexOf(lowerTerm);
    if (index === -1) return 0;

    let score = 1; // Base score for any match
    if (index === 0) score += 5; // Higher score for match at the beginning
    if (index > 0 && !lowerText[index - 1].match(/\w/)) score += 3; // Higher score for match at the beginning of a word
    if (text.length === term.length) score += 10; // Exact match bonus
    
    return score;
};

// Helper component for user avatars
const Avatar: React.FC<{ src?: string; alt: string; className?: string }> = ({ src, alt, className = 'h-8 w-8' }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError || !src) {
        return <UserCircleIcon className={`${className} text-gray-500 dark:text-gray-400`} />;
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className={`${className} rounded-full object-cover`}
        />
    );
};


const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, warehouses, onSearchResultClick, notifications, onDismissAllNotifications, onToggleNotificationRead, onOpenSettings, canAccessSettings, pageTitle, onMenuClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // Mobile search state
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    warehouses.forEach(warehouse => {
        warehouse.products.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
    });
    return Array.from(categories).sort();
  }, [warehouses]);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) {
      return [];
    }
    const results: (SearchResult & { score: number })[] = [];
    const lowercasedTerm = searchTerm.toLowerCase();
    
    for (const warehouse of warehouses) {
      for (const product of warehouse.products) {
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          continue;
        }
        
        const nameScore = getRelevanceScore(product.name, lowercasedTerm);
        const skuScore = getRelevanceScore(product.sku, lowercasedTerm);
        const categoryScore = getRelevanceScore(product.category || '', lowercasedTerm);
        const warehouseScore = getRelevanceScore(warehouse.name, lowercasedTerm);
        
        // Give different weights: SKU > name > category > warehouse
        const totalScore = (skuScore * 10) + (nameScore * 5) + (categoryScore * 2) + (warehouseScore * 1);
        
        if (totalScore > 0) {
          results.push({ product, warehouse, score: totalScore });
        }
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }, [searchTerm, warehouses, selectedCategory]);

  useEffect(() => {
    setShowAllResults(false);
  }, [searchTerm]);
  
  // Focus input when mobile search opens
  useEffect(() => {
      if (isMobileSearchOpen && mobileInputRef.current) {
          mobileInputRef.current.focus();
      }
  }, [isMobileSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // Only close if not in mobile mode or logic handled separately
        if (!isMobileSearchOpen) setShowResults(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSearchOpen]);

  const handleResultClick = (warehouseId: string, productId: string) => {
    onSearchResultClick(warehouseId, productId);
    setSearchTerm('');
    setShowResults(false);
    setIsMobileSearchOpen(false);
  };

  const handleNotificationClick = (warehouseId: string, productId: string) => {
    onSearchResultClick(warehouseId, productId);
    setShowNotifications(false);
  };
  
  const unreadNotifications = notifications.filter(n => !n.read);
  const displayedResults = showAllResults ? searchResults : searchResults.slice(0, 10);

  // Render the search results list (shared between desktop and mobile)
  const renderSearchResults = () => (
      <div className={`${isMobileSearchOpen ? 'fixed top-16 left-0 right-0 h-[calc(100vh-4rem)]' : 'absolute mt-1 w-full max-h-96 rounded-md border border-gray-200 dark:border-gray-700'} z-50 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto`}>
        {searchResults.length > 0 ? (
            <>
            <ul>
            {displayedResults.map(({ product, warehouse }) => (
                <li key={`${warehouse.id}-${product.id}`}
                    onClick={() => handleResultClick(warehouse.id, product.id)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            <ImageWithFallback src={product.imageUrls?.[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                <HighlightMatch text={product.name} highlight={searchTerm} />
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                SKU: <HighlightMatch text={product.sku} highlight={searchTerm} />
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {warehouse.name}
                            </p>
                        </div>
                        <div className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {product.quantity.toLocaleString()}개
                        </div>
                    </div>
                </li>
            ))}
            </ul>
            {!showAllResults && searchResults.length > 10 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                    <button
                        onClick={() => setShowAllResults(true)}
                        className="w-full text-center text-sm py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    >
                        모든 결과 보기 ({searchResults.length}개)
                    </button>
                </div>
            )}
            </>
        ) : (
            <div className="p-8 text-sm text-center text-gray-500 dark:text-gray-400">
                검색 결과가 없습니다.
            </div>
        )}
      </div>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md flex-shrink-0 z-20 relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
            
          {/* Mobile Search Overlay Header */}
          {isMobileSearchOpen ? (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-30 px-4 flex items-center animate-fade-in-up">
                  <button onClick={() => { setIsMobileSearchOpen(false); setSearchTerm(''); setShowResults(false); }} className="mr-3 p-2 text-gray-500 dark:text-gray-300">
                      <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <div className="flex-1 relative">
                      <input
                          ref={mobileInputRef}
                          type="search"
                          className="block w-full pl-3 pr-10 py-2 border-none rounded-md leading-5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="상품 검색..."
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
                      />
                      {searchTerm && (
                          <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                              <XMarkIcon className="w-5 h-5" />
                          </button>
                      )}
                  </div>
              </div>
          ) : (
              <>
                <div className="flex items-center">
                    <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none">
                    <span className="sr-only">메뉴 열기</span>
                    <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">{pageTitle}</h1>
                </div>
                
                <div className="flex items-center">
                    {/* Desktop Search */}
                    <div className="hidden md:flex justify-center px-2 lg:ml-6 lg:justify-end" ref={searchContainerRef}>
                        <div className="w-full max-w-lg lg:max-w-xs relative">
                        <label htmlFor="search" className="sr-only">상품 검색</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="search"
                                name="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="상품명 또는 SKU 검색"
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setShowResults(true)}
                            />
                        </div>
                        {showResults && searchTerm.length >= 2 && renderSearchResults()}
                        </div>
                    </div>

                    {/* Mobile Search Icon Trigger */}
                    <button 
                        onClick={() => setIsMobileSearchOpen(true)} 
                        className="md:hidden p-2 mr-1 text-gray-400 rounded-full hover:text-gray-500 dark:hover:text-white focus:outline-none"
                    >
                        <span className="sr-only">검색</span>
                        <SearchIcon className="h-6 w-6" />
                    </button>

                    <div className="flex items-center">
                        <div className="relative" ref={notificationContainerRef}>
                        <button onClick={() => setShowNotifications(s => !s)} className="p-2 text-gray-400 rounded-full hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="sr-only">알림 보기</span>
                            <BellIcon className="h-6 w-6" />
                            {unreadNotifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">알림</h3>
                                <button onClick={onDismissAllNotifications} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">모두 읽음</button>
                                </div>
                                <ul className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => {
                                    const isLowStock = n.type === NotificationType.LOW_STOCK;
                                    const isExpired = n.type === NotificationType.EXPIRED;
                                    const isExpiringSoon = n.type === NotificationType.EXPIRING_SOON;
                                    const iconColor = isExpired ? 'text-red-500' : 'text-yellow-500';
                                    const notif = n as LowStockNotification | ExpirationNotification;

                                    return (
                                    <li key={n.id} onClick={() => handleNotificationClick(n.warehouseId, n.productId)} className={`relative group p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${n.read ? 'opacity-60' : ''}`}>
                                        <div className="flex items-start">
                                            <div className={`flex-shrink-0 pt-0.5 ${iconColor}`}>
                                                <ExclamationTriangleIcon className="h-5 w-5" />
                                            </div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{n.productName}</p>
                                                {isLowStock && <p className="text-xs text-gray-500 dark:text-gray-400">재고 부족: {(notif as LowStockNotification).currentQuantity} / {(notif as LowStockNotification).minStockLevel}</p>}
                                                {isExpired && <p className="text-xs text-red-500 dark:text-red-400">만료됨: {(notif as ExpirationNotification).expirationDate}</p>}
                                                {isExpiringSoon && <p className="text-xs text-yellow-500 dark:text-yellow-400">만료 임박: {(notif as ExpirationNotification).expirationDate} ({(notif as ExpirationNotification).daysRemaining}일 남음)</p>}
                                                <p className="text-xs text-gray-400 mt-1">{n.warehouseName}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleNotificationRead(n.id);
                                            }}
                                            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                                            title={n.read ? "읽지 않음으로 표시" : "읽음으로 표시"}
                                        >
                                            {n.read 
                                                ? <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 border border-gray-400"></div>
                                                : <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            }
                                        </button>
                                    </li>
                                    )
                                }) : <li className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">새 알림이 없습니다.</li>}
                                </ul>
                            </div>
                        )}
                        </div>

                        <div className="ml-2 sm:ml-4 relative" ref={userMenuRef}>
                        <div>
                            <button onClick={() => setShowUserMenu(s => !s)} className="bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span className="sr-only">사용자 메뉴 열기</span>
                            <Avatar src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 sm:h-9 sm:w-9" />
                            </button>
                        </div>
                        {showUserMenu && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-800 dark:text-gray-100 font-bold">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                                </div>
                                {canAccessSettings && (
                                <button onClick={() => { onOpenSettings(); setShowUserMenu(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                                    설정
                                </button>
                                )}
                                <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <LogoutIcon className="w-5 h-5 mr-3 text-gray-500" />
                                    로그아웃
                                </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
              </>
          )}
          
          {/* Render Search Results in Mobile Overlay Mode if active */}
          {isMobileSearchOpen && showResults && searchTerm.length >= 2 && renderSearchResults()}
          
        </div>
      </div>
    </header>
  );
};

export default Header;
