import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category, RecurringTransaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatVND, formatShortVND } from '../constants';
import RecurringSection from './RecurringSection';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  recurringTransactions: RecurringTransaction[];
  onAddRecurring: (r: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  onToggleRecurring: (id: string) => void;
  onDeleteRecurring: (id: string) => void;
}

const TransactionsPage: React.FC<Props> = ({
  transactions, onEdit, onDelete, onAdd,
  recurringTransactions, onAddRecurring, onToggleRecurring, onDeleteRecurring,
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'recurring'>('transactions');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allCategories = useMemo(() => ({
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
  }), []);

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false;
        if (filterCategory !== 'all' && t.category !== filterCategory) return false;
        if (filterMonth && !t.date.startsWith(filterMonth)) return false;
        if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterCategory, filterMonth, search]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach(t => {
      const key = t.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-2xl bg-white border border-gray-100 shadow-sm p-1 gap-1">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'transactions' ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'transactions' ? { background: 'var(--primary)' } : undefined}
        >
          <span>💸</span>
          <span>Giao dịch</span>
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'recurring' ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
          style={activeTab === 'recurring' ? { background: 'var(--primary)' } : undefined}
        >
          <span>🔄</span>
          <span>Định kỳ</span>
          {recurringTransactions.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === 'recurring' ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
            }`}>
              {recurringTransactions.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'recurring' ? (
        <RecurringSection
          recurring={recurringTransactions}
          onAdd={onAddRecurring}
          onToggle={onToggleRecurring}
          onDelete={onDeleteRecurring}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex flex-wrap gap-2">
              {/* Type filter */}
              {(['all', 'income', 'expense'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === t
                      ? t === 'income' ? 'bg-emerald-500 text-white' : t === 'expense' ? 'bg-rose-500 text-white' : 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={filterType === t && t === 'all' ? { background: 'var(--primary)' } : undefined}
                >
                  {t === 'all' ? '🔍 Tất cả' : t === 'income' ? '💰 Thu nhập' : '💸 Chi tiêu'}
                </button>
              ))}

              <input
                type="month"
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm giao dịch..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="all">Tất cả danh mục</option>
                <optgroup label="Chi tiêu">
                  {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Thu nhập">
                  {Object.entries(INCOME_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-1">Thu nhập</p>
              <p className="text-sm font-bold text-emerald-700">+{formatShortVND(totalIncome)}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center border border-rose-100">
              <p className="text-xs text-rose-600 font-medium mb-1">Chi tiêu</p>
              <p className="text-sm font-bold text-rose-700">-{formatShortVND(totalExpense)}</p>
            </div>
            <div className={`rounded-2xl p-3 text-center border ${totalIncome - totalExpense >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
              <p className="text-xs font-medium mb-1 text-indigo-600">Số dư</p>
              <p className={`text-sm font-bold ${totalIncome - totalExpense >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>
                {formatShortVND(Math.abs(totalIncome - totalExpense))}
              </p>
            </div>
          </div>

          {/* Transaction List */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 font-medium">Không có giao dịch nào</p>
              <p className="text-gray-400 text-sm mt-1">Thêm giao dịch mới để bắt đầu</p>
              <button
                onClick={onAdd}
                className="mt-4 px-6 py-2.5 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                style={{ background: 'var(--primary)' }}
              >
                + Thêm giao dịch
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {grouped.map(([date, txs]) => (
                <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 capitalize">{formatDate(date)}</p>
                    <div className="flex gap-3 text-xs">
                      {txs.some(t => t.type === 'income') && (
                        <span className="text-emerald-600 font-semibold">
                          +{formatShortVND(txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
                        </span>
                      )}
                      {txs.some(t => t.type === 'expense') && (
                        <span className="text-rose-600 font-semibold">
                          -{formatShortVND(txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {txs.map(t => {
                      const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                      const meta = cats[t.category as keyof typeof cats];
                      return (
                        <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 group transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${meta?.bgColor ?? 'bg-gray-100'}`}>
                            {meta?.icon ?? '💰'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{t.description}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${meta?.bgColor ?? 'bg-gray-100'} ${meta?.textColor ?? 'text-gray-600'} font-medium`}>
                                {meta?.label ?? t.category}
                              </span>
                              {t.note && <span className="text-xs text-gray-400 truncate">{t.note}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatVND(t.amount)}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEdit(t)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(t.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xs text-center animate-fade-in-up">
            <p className="text-4xl mb-3">🗑️</p>
            <p className="font-bold text-gray-900 mb-1">Xóa giao dịch?</p>
            <p className="text-sm text-gray-500 mb-5">Hành động này không thể hoàn tác</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
