
import React, { useState, useMemo } from 'react';
import { Warehouse, Transaction, User, TransactionType } from '../types';
import { ChartPieIcon, CubeIcon, PackageIcon, ExclamationTriangleIcon, SearchIcon, ArrowDownTrayIcon, ClockIcon, CalendarDaysIcon, UserCircleIcon, CurrencyDollarIcon } from './Icons';
import TransactionTypeInfo, { getTransactionTypeName } from './TransactionTypeInfo';


const getExpirationStatus = (expirationDate?: string, expiringSoonThreshold: number = 30) => {
    if (!expirationDate) return { status: 'ok' as const, text: '유효', color: 'text-green-600 dark:text-green-400', daysRemaining: Infinity };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expDate = new Date(expirationDate);
    const timezoneOffset = expDate.getTimezoneOffset() * 60000;
    const localExpDate = new Date(expDate.getTime() + timezoneOffset);

    const diffTime = localExpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { status: 'expired' as const, text: `만료됨`, color: 'text-red-600 dark:text-red-400', daysRemaining: diffDays };
    }
    if (diffDays <= expiringSoonThreshold) {
        return { status: 'soon' as const, text: `만료 임박`, color: 'text-yellow-600 dark:text-yellow-400', daysRemaining: diffDays };
    }
    return { status: 'ok' as const, text: '유효', color: 'text-green-600 dark:text-green-400', daysRemaining: diffDays };
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; colorClass: string }> = ({ icon, title, value, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex items-center">
    <div className={`rounded-full p-3 ${colorClass}`}>{icon}</div>
    <div className="ml-4">
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

// Hex colors for conic-gradient
const CHART_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#6b7280'];

const CategoryPieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-32 text-sm text-gray-500">데이터 없음</div>;

    let cumulativePercent = 0;
    const gradientStops = data.map((item, index) => {
        const start = cumulativePercent;
        const percent = (item.value / total) * 100;
        cumulativePercent += percent;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        return `${color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center h-full gap-4 sm:gap-8">
             <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0">
                <div 
                    className="w-full h-full rounded-full shadow-inner"
                    style={{ background: `conic-gradient(${gradientStops})` }}
                ></div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">Total<br/>{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 w-full sm:w-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-40 sm:max-h-56 overflow-y-auto custom-scrollbar pr-2">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center text-xs sm:text-sm">
                            <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></span>
                            <span className="flex-1 truncate mr-2 text-gray-700 dark:text-gray-300" title={item.name}>{item.name}</span>
                            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{((item.value / total) * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DonutChart: React.FC<{ data: { name: string; value: number; color: string }[], centerLabel?: string }> = ({ data, centerLabel }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-32 text-sm text-gray-500">데이터 없음</div>;

    let cumulativePercent = 0;
    const gradientStops = data.map((item) => {
        const start = cumulativePercent;
        const percent = (item.value / total) * 100;
        cumulativePercent += percent;
        return `${item.color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4">
                <div 
                    className="w-full h-full rounded-full shadow-inner"
                    style={{ background: `conic-gradient(${gradientStops})` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 text-center">{centerLabel || 'Total'}<br/>{total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center text-xs sm:text-sm">
                        <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 dark:text-gray-400 mr-1">{item.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface StatisticsReportProps {
  warehouses: Warehouse[];
  transactions: Transaction[];
  users: User[];
  expiringSoonThreshold: number;
}

const StatisticsReport: React.FC<StatisticsReportProps> = ({ warehouses, transactions, users, expiringSoonThreshold }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'analysis'>('inventory');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  
  // Analysis Filters
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });
  const [analysisType, setAnalysisType] = useState<string>('all');
  const [analysisUser, setAnalysisUser] = useState<string>('all');
  const [analysisSearch, setAnalysisSearch] = useState('');


  // --- Inventory Dashboard Logic ---
  const inventoryStats = useMemo(() => {
      const targetWarehouses = selectedWarehouseId === 'all' ? warehouses : warehouses.filter(w => w.id === selectedWarehouseId);
      let totalProducts = 0;
      let totalQuantity = 0;
      let totalValue = 0;
      let lowStockCount = 0;
      const categoryCounts: Record<string, number> = {};
      const expirationCounts = { valid: 0, soon: 0, expired: 0 };
      const lowStockItems: { id: string; name: string; warehouse: string; quantity: number; min: number }[] = [];

      targetWarehouses.forEach(wh => {
          wh.products.forEach(p => {
              totalProducts++;
              totalQuantity += p.quantity;
              totalValue += p.quantity * p.price;
              
              if (p.category) {
                  categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.quantity;
              } else {
                  categoryCounts['미분류'] = (categoryCounts['미분류'] || 0) + p.quantity;
              }

              if (p.minStockLevel !== undefined && p.quantity < p.minStockLevel) {
                  lowStockCount++;
                  lowStockItems.push({
                      id: p.id,
                      name: p.name,
                      warehouse: wh.name,
                      quantity: p.quantity,
                      min: p.minStockLevel
                  });
              }

              const expStatus = getExpirationStatus(p.expirationDate, expiringSoonThreshold);
              if (expStatus.status === 'ok') expirationCounts.valid++;
              else if (expStatus.status === 'soon') expirationCounts.soon++;
              else if (expStatus.status === 'expired') expirationCounts.expired++;
          });
      });

      const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      return {
          totalProducts,
          totalQuantity,
          totalValue,
          lowStockCount,
          categoryData,
          expirationCounts,
          lowStockItems
      };
  }, [warehouses, selectedWarehouseId, expiringSoonThreshold]);


  // --- Transaction Analysis Logic ---
  const setQuickDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let from = new Date();

    switch (period) {
        case 'today': break;
        case 'week': from.setDate(today.getDate() - today.getDay()); break;
        case 'month': from.setDate(1); break;
        case 'year': from = new Date(today.getFullYear(), 0, 1); break;
    }
    setDateRange({ from: from.toISOString().split('T')[0], to: today.toISOString().split('T')[0] });
  };

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => {
          // Warehouse Filter
          if (selectedWarehouseId !== 'all') {
              if (t.warehouseId !== selectedWarehouseId && t.relatedWarehouseId !== selectedWarehouseId) return false;
          }
          // Date Filter
          const tDate = new Date(t.date);
          if (dateRange.from && tDate < new Date(dateRange.from)) return false;
          if (dateRange.to && tDate > new Date(dateRange.to + 'T23:59:59')) return false;
          // Type Filter
          if (analysisType !== 'all' && t.type !== analysisType) return false;
          // User Filter
          if (analysisUser !== 'all' && t.userId !== analysisUser) return false;
          // Search Filter
          if (analysisSearch && !t.productName.toLowerCase().includes(analysisSearch.toLowerCase()) && !t.productSku.toLowerCase().includes(analysisSearch.toLowerCase())) return false;

          return true;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedWarehouseId, dateRange, analysisType, analysisUser, analysisSearch]);

  const transactionSummary = useMemo(() => {
      let incoming = 0;
      let outgoing = 0;
      const incomingTypes = [TransactionType.IN, TransactionType.RECEIVE, TransactionType.CREATE, TransactionType.QUICK_RECEIVE];
      const outgoingTypes = [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP];

      filteredTransactions.forEach(t => {
          if (incomingTypes.includes(t.type)) incoming += t.quantity;
          else if (outgoingTypes.includes(t.type)) outgoing += t.quantity;
      });

      return { incoming, outgoing, net: incoming - outgoing };
  }, [filteredTransactions]);

  const productTransactionSummary = useMemo(() => {
      const summary: Record<string, { name: string; sku: string; in: number; out: number; currentStock: number }> = {};
      
      // Calculate IN/OUT from transactions
      filteredTransactions.forEach(t => {
          if (!summary[t.productId]) {
              // Find current stock for this product in the selected warehouse context
              // This is an approximation as historical stock is hard to calculate perfectly without snapshots
              // We will just show current stock from the warehouse state for context
              let currentStock = 0;
              if (selectedWarehouseId === 'all') {
                  // Sum across all warehouses
                  warehouses.forEach(w => {
                      const p = w.products.find(p => p.id === t.productId);
                      if (p) currentStock += p.quantity;
                  });
              } else {
                  const w = warehouses.find(w => w.id === selectedWarehouseId);
                  const p = w?.products.find(p => p.id === t.productId);
                  if (p) currentStock = p.quantity;
              }

              summary[t.productId] = { name: t.productName, sku: t.productSku, in: 0, out: 0, currentStock };
          }

          const incomingTypes = [TransactionType.IN, TransactionType.RECEIVE, TransactionType.CREATE, TransactionType.QUICK_RECEIVE];
          const outgoingTypes = [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP];
          
          if (incomingTypes.includes(t.type)) summary[t.productId].in += t.quantity;
          else if (outgoingTypes.includes(t.type)) summary[t.productId].out += t.quantity;
      });

      return Object.values(summary).sort((a, b) => (b.in + b.out) - (a.in + a.out));
  }, [filteredTransactions, warehouses, selectedWarehouseId]);

  const exportToCSV = () => {
      const headers = ['Date', 'Type', 'Warehouse', 'Product', 'SKU', 'Quantity', 'User'];
      const rows = filteredTransactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.type,
          warehouses.find(w => w.id === t.warehouseId)?.name || t.warehouseId,
          t.productName,
          t.productSku,
          t.quantity,
          users.find(u => u.id === t.userId)?.name || t.userId
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "transaction_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex space-x-2">
            <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
                <ChartPieIcon className="w-4 h-4 inline mr-2" />
                실시간 재고 현황
            </button>
            <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
                <ClockIcon className="w-4 h-4 inline mr-2" />
                거래 내역 분석
            </button>
        </div>
        <div className="w-full sm:w-auto">
            <select 
                value={selectedWarehouseId} 
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option value="all">모든 창고</option>
                {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
            </select>
        </div>
      </div>

      {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={<PackageIcon className="w-6 h-6 text-blue-600" />} title="총 품목 수" value={inventoryStats.totalProducts} colorClass="bg-blue-100 dark:bg-blue-900/30" />
                  <StatCard icon={<CubeIcon className="w-6 h-6 text-green-600" />} title="총 재고 수량" value={inventoryStats.totalQuantity} colorClass="bg-green-100 dark:bg-green-900/30" />
                  <StatCard icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />} title="재고 부족 품목" value={inventoryStats.lowStockCount} colorClass="bg-yellow-100 dark:bg-yellow-900/30" />
                  <StatCard icon={<CurrencyDollarIcon className="w-6 h-6 text-purple-600" />} title="총 재고 가치" value={`${inventoryStats.totalValue.toLocaleString()}원`} colorClass="bg-purple-100 dark:bg-purple-900/30" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Category Pie Chart - Takes 2 columns on large screens */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">재고 구성 비율 (카테고리)</h3>
                      <div className="h-64">
                          <CategoryPieChart data={inventoryStats.categoryData} />
                      </div>
                  </div>

                  {/* Expiration Status - Takes 1 column */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:col-span-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">유통기한 상태</h3>
                      <div className="h-64">
                          <DonutChart 
                              data={[
                                  { name: '유효', value: inventoryStats.expirationCounts.valid, color: '#22c55e' },
                                  { name: '임박', value: inventoryStats.expirationCounts.soon, color: '#eab308' },
                                  { name: '만료', value: inventoryStats.expirationCounts.expired, color: '#ef4444' }
                              ]} 
                              centerLabel="Products"
                          />
                      </div>
                  </div>
              </div>

              {/* Low Stock Table */}
              {inventoryStats.lowStockItems.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center">
                              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                              재고 부족 알림 ({inventoryStats.lowStockItems.length})
                          </h3>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품명</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">창고</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">현재고</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">최소 재고</th>
                                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">부족분</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                  {inventoryStats.lowStockItems.map((item, idx) => (
                                      <tr key={idx}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.warehouse}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-red-600 dark:text-red-400">{item.quantity.toLocaleString()}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{item.min.toLocaleString()}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{(item.min - item.quantity).toLocaleString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      )}

      {activeTab === 'analysis' && (
          <div className="space-y-6 animate-fade-in-up">
              {/* Filter Controls */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                       <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                           {['today', 'week', 'month', 'year'].map(p => (
                               <button 
                                key={p} 
                                onClick={() => setQuickDateRange(p as any)}
                                className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full whitespace-nowrap transition-colors text-gray-700 dark:text-gray-200"
                               >
                                   { {today: '오늘', week: '이번 주', month: '이번 달', year: '올해'}[p] }
                               </button>
                           ))}
                       </div>
                       <button onClick={exportToCSV} className="text-sm text-blue-600 dark:text-blue-400 flex items-center hover:underline">
                           <ArrowDownTrayIcon className="w-4 h-4 mr-1" /> CSV 다운로드
                       </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDaysIcon className="h-5 w-5 text-gray-400"/></div>
                          <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" placeholder="시작일" />
                      </div>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDaysIcon className="h-5 w-5 text-gray-400"/></div>
                          <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" placeholder="종료일" />
                      </div>
                      <select value={analysisType} onChange={e => setAnalysisType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
                          <option value="all">모든 거래 유형</option>
                          {Object.values(TransactionType).map(t => <option key={t} value={t}>{getTransactionTypeName(t)}</option>)}
                      </select>
                      <select value={analysisUser} onChange={e => setAnalysisUser(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm">
                          <option value="all">모든 사용자</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                       <div className="relative lg:col-span-4">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400"/></div>
                          <input type="text" value={analysisSearch} onChange={e => setAnalysisSearch(e.target.value)} className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm" placeholder="상품명 또는 SKU 검색..." />
                      </div>
                  </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-green-500">
                      <p className="text-sm text-gray-500 dark:text-gray-400">기간 내 총 입고</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">+{transactionSummary.incoming.toLocaleString()}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-red-500">
                      <p className="text-sm text-gray-500 dark:text-gray-400">기간 내 총 출고</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">-{transactionSummary.outgoing.toLocaleString()}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
                      <p className="text-sm text-gray-500 dark:text-gray-400">순 재고 변동</p>
                      <p className={`text-2xl font-bold ${transactionSummary.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {transactionSummary.net > 0 ? '+' : ''}{transactionSummary.net.toLocaleString()}
                      </p>
                  </div>
              </div>

              {/* Product Transaction Aggregation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">상품별 거래 내역 집계 (Top 10)</h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총 입고</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">총 출고</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">순 변동</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">현재 재고</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {productTransactionSummary.slice(0, 10).map((item, idx) => {
                                  const netChange = item.in - item.out;
                                  return (
                                      <tr key={idx}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.sku}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">+{item.in.toLocaleString()}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">-{item.out.toLocaleString()}</td>
                                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${netChange >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                              {netChange > 0 ? '+' : ''}{netChange.toLocaleString()}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-200">{item.currentStock.toLocaleString()}</td>
                                      </tr>
                                  );
                              })}
                              {productTransactionSummary.length === 0 && (
                                  <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">데이터가 없습니다.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Detailed List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">상세 거래 내역</h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">날짜</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">유형</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상품</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">수량</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">담당자</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {filteredTransactions.slice(0, 20).map(t => (
                                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm"><TransactionTypeInfo type={t.type} /></td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                          <div>{t.productName}</div>
                                          <div className="text-xs text-gray-500">{t.productSku}</div>
                                      </td>
                                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                                          [TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP].includes(t.type) 
                                          ? 'text-red-600 dark:text-red-400' 
                                          : 'text-green-600 dark:text-green-400'
                                      }`}>
                                          {[TransactionType.OUT, TransactionType.SHIP, TransactionType.DELETE, TransactionType.QUICK_SHIP].includes(t.type) ? '-' : '+'}{t.quantity.toLocaleString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                          <UserCircleIcon className="w-4 h-4 mr-1" />
                                          {users.find(u => u.id === t.userId)?.name || '알 수 없음'}
                                      </td>
                                  </tr>
                              ))}
                               {filteredTransactions.length === 0 && (
                                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">조건에 맞는 내역이 없습니다.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default StatisticsReport;
