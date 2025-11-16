import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Warehouse, Product, User, Role, LowStockNotification, Transaction, TransactionType, QuantityHistoryEntry } from './types';
import { MOCK_USERS, MOCK_WAREHOUSES } from './constants';
import Header from './components/Header';
import Login from './components/Login';
import ProductModal from './components/ProductModal';
import MoveProductModal from './components/MoveProductModal';
import ReceiveStockModal from './components/ReceiveStockModal';
import ProductHistoryModal from './components/ProductHistoryModal';
import WarehouseHistory from './components/WarehouseHistory';
import AuditTrail from './components/AuditTrail';
import DashboardStats from './components/DashboardStats';
import StatisticsReport from './components/StatisticsReport';
import {
  ChevronLeftIcon, EditIcon, DeleteIcon, PlusIcon, WarehouseIcon, MapPinIcon, PackageIcon,
  ExclamationTriangleIcon, ArrowRightLeftIcon, ReceiveIcon, CubeIcon, ClipboardDocumentListIcon, ArrowDownTrayIcon,
  QuickReceiveIcon, QuickShipIcon, ChartBarIcon
} from './components/Icons';

type View = 'dashboard' | 'detail' | 'audit' | 'statistics';
type QuantityUpdateInfo = { productId: string; type: 'increase' | 'decrease' };
const QUICK_ADJUST_AMOUNT = 10;

const App: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(MOCK_WAREHOUSES);
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const [view, setView] = useState<View>('dashboard');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingProduct, setMovingProduct] = useState<Product | null>(null);
  
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receivingProduct, setReceivingProduct] = useState<Product | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [viewingHistoryProduct, setViewingHistoryProduct] = useState<Product | null>(null);

  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<LowStockNotification[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quantityUpdateInfo, setQuantityUpdateInfo] = useState<QuantityUpdateInfo | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});

  const productRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Authentication
  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  };
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setView('dashboard');
    setSelectedWarehouseId(null);
  };
  
  // Navigation
  const handleSelectWarehouse = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setView('detail');
  };
  const handleBackToDashboard = () => {
    setSelectedWarehouseId(null);
    setView('dashboard');
    setHighlightedProductId(null);
  };
   const handleViewAuditTrail = () => setView('audit');
   const handleViewStatistics = () => setView('statistics');

  // Derived State
  const visibleWarehouses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.ADMIN) return warehouses;
    return warehouses.filter(wh => wh.id === currentUser.assignedWarehouseId);
  }, [warehouses, currentUser]);

  const selectedWarehouse = useMemo(() => {
    return warehouses.find(wh => wh.id === selectedWarehouseId) || null;
  }, [warehouses, selectedWarehouseId]);
  
  const dashboardStats = useMemo(() => {
    let totalStockQuantity = 0;
    let lowStockProductsCount = 0;
    const allProducts = warehouses.flatMap(w => w.products);
    const uniqueProductSKUs = new Set(allProducts.map(p => p.sku));

    warehouses.forEach(warehouse => {
      warehouse.products.forEach(product => {
        totalStockQuantity += product.quantity;
        if (product.minStockLevel && product.quantity < product.minStockLevel) {
          lowStockProductsCount++;
        }
      });
    });

    return {
      totalUniqueProducts: uniqueProductSKUs.size,
      totalStockQuantity,
      lowStockProductsCount,
    };
  }, [warehouses]);

  // Role-Based Access Control (RBAC)
  const canManageProducts = useCallback((warehouseId: string) => {
    if (!currentUser) return false;
    const { role, assignedWarehouseId } = currentUser;
    if (role === Role.ADMIN) return true;
    if (role === Role.MANAGER && assignedWarehouseId === warehouseId) return true;
    return false;
  }, [currentUser]);

  const canReceiveStock = useCallback((warehouseId: string) => {
    if (!currentUser) return false;
    const { role, assignedWarehouseId } = currentUser;
    if (role === Role.ADMIN) return true;
    if ((role === Role.MANAGER || role === Role.STAFF) && assignedWarehouseId === warehouseId) return true;
    return false;
  }, [currentUser]);

  const canMoveProducts = useCallback((warehouseId: string) => {
    return canManageProducts(warehouseId);
  }, [canManageProducts]);

  const canViewWarehouseHistory = useCallback((warehouseId: string) => {
    if (!currentUser) return false;
    const { role, assignedWarehouseId } = currentUser;
    if (role === Role.ADMIN) return true;
    if (role === Role.MANAGER && assignedWarehouseId === warehouseId) return true;
    return false;
  }, [currentUser]);

  const canViewAuditTrail = useMemo(() => currentUser?.role === Role.ADMIN, [currentUser]);
  const canViewStatistics = useMemo(() => currentUser?.role === Role.ADMIN, [currentUser]);

  // Transactions & History
  const addTransaction = useCallback((
    product: Product, 
    warehouseId: string, 
    quantity: number, 
    type: TransactionType, 
    relatedWarehouseId?: string
  ) => {
    if (!currentUser) return;
    const newTransaction: Transaction = {
      id: `trans-${new Date().getTime()}-${Math.random()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      warehouseId,
      quantity,
      type,
      date: new Date().toISOString(),
      userId: currentUser.id,
      relatedWarehouseId
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, [currentUser]);

  const addQuantityHistory = (
    product: Product, 
    type: TransactionType, 
    quantityChange: number, 
    relatedWarehouseId?: string
  ): QuantityHistoryEntry[] => {
      if (!currentUser) return product.quantityHistory || [];
      const oldQuantity = product.quantity;
      const newQuantity = oldQuantity + quantityChange;
      const historyEntry: QuantityHistoryEntry = {
        id: `hist-${new Date().getTime()}-${Math.random()}`,
        date: new Date().toISOString(),
        userId: currentUser.id,
        type,
        oldQuantity,
        newQuantity,
        quantityChange,
        relatedWarehouseId,
      };
      return [historyEntry, ...(product.quantityHistory || [])];
  };

  // Product Actions
  const handleOpenProductModal = (product: Product | null, warehouseId: string) => {
    setEditingProduct(product);
    setEditingWarehouseId(warehouseId);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: Product) => {
    if (!editingWarehouseId || !currentUser) return;

    setWarehouses(prevWarehouses => {
        const newWarehouses = [...prevWarehouses];
        const warehouseIndex = newWarehouses.findIndex(wh => wh.id === editingWarehouseId);
        if (warehouseIndex === -1) return prevWarehouses;
        
        const warehouse = { ...newWarehouses[warehouseIndex] };
        const productIndex = warehouse.products.findIndex(p => p.id === productData.id);

        if (productIndex !== -1) { // Editing existing product
            const oldProduct = warehouse.products[productIndex];
            const quantityChange = productData.quantity - oldProduct.quantity;
            
            const updatedProduct = { 
                ...productData, 
                lastUpdatedBy: currentUser.id,
                quantityHistory: oldProduct.quantityHistory || []
            };

            if (quantityChange !== 0) {
              updatedProduct.quantityHistory = addQuantityHistory(oldProduct, TransactionType.ADJUST, quantityChange);
              addTransaction(updatedProduct, editingWarehouseId, Math.abs(quantityChange), TransactionType.ADJUST);
            }
            
            warehouse.products[productIndex] = updatedProduct;
        } else { // Adding new product
            const newProduct = { 
              ...productData, 
              lastUpdatedBy: currentUser.id,
              quantityHistory: addQuantityHistory({ ...productData, quantity: 0 }, TransactionType.CREATE, productData.quantity)
            };
            warehouse.products.push(newProduct);
            addTransaction(newProduct, editingWarehouseId, newProduct.quantity, TransactionType.CREATE);
        }
        
        newWarehouses[warehouseIndex] = warehouse;
        return newWarehouses;
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
    setEditingWarehouseId(null);
  };
  
  const handleDeleteProduct = (productId: string, warehouseId: string) => {
    const warehouse = warehouses.find(wh => wh.id === warehouseId);
    const product = warehouse?.products.find(p => p.id === productId);
    if (!warehouse || !product || !window.confirm(`'${product.name}' 상품을 정말 삭제하시겠습니까?`)) return;

    addTransaction(product, warehouseId, product.quantity, TransactionType.DELETE);
    
    setWarehouses(prev => prev.map(wh => 
      wh.id === warehouseId
        ? { ...wh, products: wh.products.filter(p => p.id !== productId) }
        : wh
    ));
  };
  
  const handleBulkDelete = () => {
    if (!selectedWarehouse) return;
    const selectedIds = Object.keys(selectedProducts).filter(id => selectedProducts[id]);
    if (selectedIds.length === 0) return;
    
    if (!window.confirm(`${selectedIds.length}개의 상품을 정말 삭제하시겠습니까?`)) return;

    let updatedProducts = [...selectedWarehouse.products];
    selectedIds.forEach(productId => {
        const product = updatedProducts.find(p => p.id === productId);
        if (product) {
            addTransaction(product, selectedWarehouse.id, product.quantity, TransactionType.DELETE);
        }
        updatedProducts = updatedProducts.filter(p => p.id !== productId);
    });

    setWarehouses(prev => prev.map(wh =>
        wh.id === selectedWarehouse.id ? { ...wh, products: updatedProducts } : wh
    ));
    setSelectedProducts({});
  };

  const handleMoveProduct = (productId: string, sourceWarehouseId: string, destinationWarehouseId: string, quantity: number) => {
    const sourceWarehouse = warehouses.find(wh => wh.id === sourceWarehouseId);
    const productToMove = sourceWarehouse?.products.find(p => p.id === productId);
    if (!productToMove) return;

    setWarehouses(prev => {
        let movedProductCopy: Product | null = null;
        
        // Decrease from source
        const newWarehouses = prev.map(wh => {
            if (wh.id === sourceWarehouseId) {
                const updatedProducts = wh.products.map(p => {
                    if (p.id === productId) {
                        movedProductCopy = { ...p, quantity }; // copy for destination
                        const updatedProduct = { 
                          ...p, 
                          quantity: p.quantity - quantity,
                          lastUpdated: new Date().toISOString(),
                          lastUpdatedBy: currentUser?.id,
                          quantityHistory: addQuantityHistory(p, TransactionType.OUT, -quantity, destinationWarehouseId),
                        };
                        return updatedProduct;
                    }
                    return p;
                });
                return { ...wh, products: updatedProducts };
            }
            return wh;
        });

        // Increase/Add to destination
        return newWarehouses.map(wh => {
            if (wh.id === destinationWarehouseId && movedProductCopy) {
                const existingProductIndex = wh.products.findIndex(p => p.sku === movedProductCopy!.sku);
                const updatedProducts = [...wh.products];

                if (existingProductIndex !== -1) {
                    const existingProduct = updatedProducts[existingProductIndex];
                    updatedProducts[existingProductIndex] = {
                        ...existingProduct,
                        quantity: existingProduct.quantity + quantity,
                        lastUpdated: new Date().toISOString(),
                        lastUpdatedBy: currentUser?.id,
                        quantityHistory: addQuantityHistory(existingProduct, TransactionType.IN, quantity, sourceWarehouseId),
                    };
                } else {
                    updatedProducts.push({
                        ...movedProductCopy,
                        id: `prod-${new Date().getTime()}`,
                        lastUpdated: new Date().toISOString(),
                        lastUpdatedBy: currentUser?.id,
                        quantityHistory: addQuantityHistory({ ...movedProductCopy, quantity: 0 }, TransactionType.IN, quantity, sourceWarehouseId),
                    });
                }
                return { ...wh, products: updatedProducts };
            }
            return wh;
        });
    });

    addTransaction(productToMove, sourceWarehouseId, quantity, TransactionType.OUT, destinationWarehouseId);
    addTransaction(productToMove, destinationWarehouseId, quantity, TransactionType.IN, sourceWarehouseId);
    setIsMoveModalOpen(false);
    setMovingProduct(null);
  };
  
  const handleReceiveStock = (productId: string, quantity: number) => {
    if (!selectedWarehouseId) return;
    let receivedProduct: Product | null = null;

    setWarehouses(prev => prev.map(wh => {
      if (wh.id === selectedWarehouseId) {
        const updatedProducts = wh.products.map(p => {
          if (p.id === productId) {
            receivedProduct = p;
            return {
              ...p,
              quantity: p.quantity + quantity,
              lastUpdated: new Date().toISOString(),
              lastUpdatedBy: currentUser?.id,
              quantityHistory: addQuantityHistory(p, TransactionType.RECEIVE, quantity)
            }
          }
          return p;
        });
        return { ...wh, products: updatedProducts };
      }
      return wh;
    }));

    if (receivedProduct) {
        addTransaction(receivedProduct, selectedWarehouseId, quantity, TransactionType.RECEIVE);
        setQuantityUpdateInfo({ productId, type: 'increase' });
    }
    setIsReceiveModalOpen(false);
    setReceivingProduct(null);
  };
  
  const handleQuickAdjust = (product: Product, warehouseId: string, type: 'receive' | 'ship') => {
    if (!currentUser) return;
    const amount = type === 'receive' ? QUICK_ADJUST_AMOUNT : -QUICK_ADJUST_AMOUNT;
    const transactionType = type === 'receive' ? TransactionType.QUICK_RECEIVE : TransactionType.QUICK_SHIP;

    setWarehouses(prev => prev.map(wh => {
        if (wh.id === warehouseId) {
            return {
                ...wh,
                products: wh.products.map(p => {
                    if (p.id === product.id) {
                        return {
                            ...p,
                            quantity: p.quantity + amount,
                            lastUpdated: new Date().toISOString(),
                            lastUpdatedBy: currentUser.id,
                            quantityHistory: addQuantityHistory(p, transactionType, amount)
                        };
                    }
                    return p;
                })
            };
        }
        return wh;
    }));

    addTransaction(product, warehouseId, QUICK_ADJUST_AMOUNT, transactionType);
    setQuantityUpdateInfo({ productId: product.id, type: type === 'receive' ? 'increase' : 'decrease' });
  };


  // Notifications
  useEffect(() => {
    const lowStock: LowStockNotification[] = [];
    warehouses.forEach(warehouse => {
      warehouse.products.forEach(product => {
        if (product.minStockLevel && product.quantity < product.minStockLevel) {
          lowStock.push({
            id: `${warehouse.id}-${product.id}`,
            productId: product.id,
            productName: product.name,
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            currentQuantity: product.quantity,
            minStockLevel: product.minStockLevel,
            read: notifications.find(n => n.id === `${warehouse.id}-${product.id}`)?.read || false
          });
        }
      });
    });
    setNotifications(lowStock);
  }, [warehouses, notifications]);

  const handleDismissAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSearchResultClick = (warehouseId: string, productId: string) => {
    handleSelectWarehouse(warehouseId);
    setHighlightedProductId(productId);
  };
  
  useEffect(() => {
      if (highlightedProductId && selectedWarehouse) {
          const ref = productRefs.current.get(highlightedProductId);
          ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const timer = setTimeout(() => setHighlightedProductId(null), 2000);
          return () => clearTimeout(timer);
      }
  }, [highlightedProductId, selectedWarehouse]);
  
  useEffect(() => {
    if (quantityUpdateInfo) {
      const timer = setTimeout(() => setQuantityUpdateInfo(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [quantityUpdateInfo]);
  
  // CSV Export
  const downloadCSV = (data: Product[], filename: string) => {
    const csvRows = [];
    // Headers
    const headers = ['Warehouse Name', 'Product Name', 'SKU', 'Quantity', 'Price', 'Min Stock Level', 'Last Updated'];
    csvRows.push(headers.join(','));

    // Data
    const productWarehouseMap = new Map<string, string>();
    warehouses.forEach(w => w.products.forEach(p => productWarehouseMap.set(p.id, w.name)));
    
    for (const product of data) {
        const values = [
            `"${productWarehouseMap.get(product.id) || ''}"`,
            `"${product.name}"`,
            `"${product.sku}"`,
            product.quantity,
            product.price,
            product.minStockLevel || 0,
            `"${product.lastUpdated}"`
        ];
        csvRows.push(values.join(','));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


  const handleDownloadGlobalReport = () => {
      const allProducts = warehouses.flatMap(wh => wh.products);
      downloadCSV(allProducts, "global_inventory_report.csv");
  };

  const handleDownloadWarehouseReport = (warehouse: Warehouse) => {
      downloadCSV(warehouse.products, `${warehouse.name.replace(/ /g, '_')}_inventory_report.csv`);
  };
  
  const handleSelectProduct = (productId: string, isSelected: boolean) => {
    setSelectedProducts(prev => ({...prev, [productId]: isSelected }));
  };
  
  const selectedProductCount = Object.values(selectedProducts).filter(Boolean).length;


  if (!isAuthenticated || !currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        warehouses={warehouses}
        onSearchResultClick={handleSearchResultClick}
        notifications={notifications}
        onDismissAllNotifications={handleDismissAllNotifications}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">대시보드</h2>
            <DashboardStats stats={dashboardStats} />
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">창고 목록</h3>
                <div>
                   {canViewStatistics && (
                    <button onClick={handleViewStatistics} className="mr-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                       <ChartBarIcon className="w-5 h-5 mr-2" />
                       통계 보고서
                    </button>
                    )}
                   {canViewAuditTrail && (
                    <button onClick={handleViewAuditTrail} className="mr-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700">
                      <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                      감사 기록 보기
                    </button>
                    )}
                    {currentUser.role === Role.ADMIN && (
                        <button onClick={handleDownloadGlobalReport} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                           <ArrowDownTrayIcon className="w-5 h-5 mr-2"/>
                           전체 보고서 다운로드
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleWarehouses.map(wh => (
                <div key={wh.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{wh.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                      <MapPinIcon className="mr-1.5" />{wh.location}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                       <PackageIcon className="mr-1.5 w-4 h-4" />상품 {wh.products.length}종
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectWarehouse(wh.id)}
                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    상세 보기
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'detail' && selectedWarehouse && (
          <div className="space-y-4">
            <button onClick={handleBackToDashboard} className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
              <ChevronLeftIcon className="w-5 h-5 mr-1" />
              대시보드로 돌아가기
            </button>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedWarehouse.name} 상품 목록</h2>
              <div>
                {canManageProducts(selectedWarehouse.id) && (
                  <button onClick={() => handleDownloadWarehouseReport(selectedWarehouse)} className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                     보고서 다운로드
                  </button>
                )}
                {canManageProducts(selectedWarehouse.id) && (
                  <button onClick={() => handleOpenProductModal(null, selectedWarehouse.id)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    새 상품 추가
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {canManageProducts(selectedWarehouse.id) && (
                      <th scope="col" className="px-6 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onChange={e => {
                            const isChecked = e.target.checked;
                            const newSelected: Record<string, boolean> = {};
                            if (isChecked) {
                              selectedWarehouse.products.forEach(p => newSelected[p.id] = true);
                            }
                            setSelectedProducts(newSelected);
                          }}
                          checked={selectedWarehouse.products.length > 0 && selectedProductCount === selectedWarehouse.products.length}
                          ref={el => {
                              if (el) {
                                  el.indeterminate = selectedProductCount > 0 && selectedProductCount < selectedWarehouse.products.length;
                              }
                          }}
                        />
                      </th>
                    )}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">재고</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">가격</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">최종 수정</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedWarehouse.products.map(p => {
                    const isLowStock = p.minStockLevel && p.quantity < p.minStockLevel;
                    const quantityClassName = quantityUpdateInfo?.productId === p.id 
                        ? (quantityUpdateInfo.type === 'increase' ? 'animate-increase' : 'animate-decrease')
                        : '';
                    return (
                        <tr 
                          key={p.id}
                          ref={node => {
                              if (node) productRefs.current.set(p.id, node);
                              else productRefs.current.delete(p.id);
                          }}
                          className={highlightedProductId === p.id ? 'highlight' : ''}
                        >
                          {canManageProducts(selectedWarehouse.id) && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      checked={!!selectedProducts[p.id]}
                                      onChange={(e) => handleSelectProduct(p.id, e.target.checked)}
                                  />
                              </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {isLowStock && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" title="재고 부족 경고" />}
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {p.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-bold ${quantityClassName} ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                {p.quantity.toLocaleString()}
                              </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{p.price.toLocaleString()}원</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(p.lastUpdated).toLocaleString()}
                            {p.lastUpdatedBy && <div className="text-xs">by {users.find(u => u.id === p.lastUpdatedBy)?.name || 'Unknown'}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center space-x-1">
                              {canReceiveStock(selectedWarehouse.id) && (
                                  <button onClick={() => handleQuickAdjust(p, selectedWarehouse.id, 'receive')} className="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-200 p-1" title="빠른 입고 (+10)"><QuickReceiveIcon /></button>
                              )}
                              {canManageProducts(selectedWarehouse.id) && (
                                <button onClick={() => handleQuickAdjust(p, selectedWarehouse.id, 'ship')} disabled={p.quantity < QUICK_ADJUST_AMOUNT} className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200 p-1 disabled:text-gray-300 dark:disabled:text-gray-600 disabled:cursor-not-allowed" title="빠른 출고 (-10)"><QuickShipIcon /></button>
                              )}
                              <button onClick={() => { setViewingHistoryProduct(p); setIsHistoryModalOpen(true); }} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1" title="수량 변경 내역"><ClipboardDocumentListIcon className="w-5 h-5" /></button>
                              {canReceiveStock(selectedWarehouse.id) && (
                                <button onClick={() => { setReceivingProduct(p); setIsReceiveModalOpen(true); }} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-1" title="재고 입고"><ReceiveIcon /></button>
                              )}
                              {canMoveProducts(selectedWarehouse.id) && (
                                <button onClick={() => { setMovingProduct(p); setIsMoveModalOpen(true); }} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 p-1" title="상품 이동"><ArrowRightLeftIcon /></button>
                              )}
                              {canManageProducts(selectedWarehouse.id) && (
                                <button onClick={() => handleOpenProductModal(p, selectedWarehouse.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-1" title="상품 수정"><EditIcon /></button>
                              )}
                              {canManageProducts(selectedWarehouse.id) && (
                                <button onClick={() => handleDeleteProduct(p.id, selectedWarehouse.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1" title="상품 삭제"><DeleteIcon /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            {canViewWarehouseHistory(selectedWarehouse.id) && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{selectedWarehouse.name} 거래 내역</h3>
                    <WarehouseHistory 
                        warehouseId={selectedWarehouse.id}
                        transactions={transactions.filter(t => t.warehouseId === selectedWarehouse.id || t.relatedWarehouseId === selectedWarehouse.id)}
                        users={users}
                        warehouses={warehouses}
                    />
                </div>
            )}
            {selectedProductCount > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl mb-4 z-40">
                    <div className="bg-gray-800 text-white rounded-lg shadow-lg px-6 py-4 flex items-center justify-between">
                        <p className="font-semibold">{selectedProductCount}개 상품 선택됨</p>
                        <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center font-bold">
                            <DeleteIcon className="mr-2" />
                            선택 삭제
                        </button>
                    </div>
                </div>
            )}
          </div>
        )}

        {view === 'audit' && canViewAuditTrail && (
            <AuditTrail transactions={transactions} users={users} warehouses={warehouses} onBack={handleBackToDashboard} />
        )}
        
        {view === 'statistics' && canViewStatistics && (
            <StatisticsReport transactions={transactions} warehouses={warehouses} onBack={handleBackToDashboard} />
        )}

      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
      
      <MoveProductModal 
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        onMove={handleMoveProduct}
        product={movingProduct}
        sourceWarehouse={selectedWarehouse}
        warehouses={warehouses}
      />
      
      <ReceiveStockModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onReceive={handleReceiveStock}
        product={receivingProduct}
      />
      
      <ProductHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        product={viewingHistoryProduct}
        users={users}
        warehouses={warehouses}
      />

    </div>
  );
};

export default App;
