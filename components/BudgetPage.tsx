import React, { useState, useMemo } from 'react';
import { Budget, Transaction, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES, formatVND, formatShortVND } from '../constants';

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
  onSaveBudget: (b: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
}

const BudgetPage: React.FC<Props> = ({ budgets, transactions, onSaveBudget, onDeleteBudget }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [editing, setEditing] = useState<Partial<Budget> | null>(null);

  const monthBudgets = useMemo(() => budgets.filter(b => b.month === selectedMonth), [budgets, selectedMonth]);

  const monthExpenses = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return map;
  }, [monthExpenses]);

  const totalBudget = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (spentByCategory[b.category] || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const unbudgetedCategories = (Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[])
    .filter(cat => !monthBudgets.some(b => b.category === cat));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.category || !editing?.amount) return;
    onSaveBudget({ category: editing.category as ExpenseCategory, amount: Number(editing.amount), month: selectedMonth });
    setEditing(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-700">Tháng:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Tổng ngân sách</p>
          <p className="text-lg font-bold text-indigo-600">{formatShortVND(totalBudget)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Đã chi tiêu</p>
          <p className="text-lg font-bold text-rose-600">{formatShortVND(totalSpent)}</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm border text-center ${totalRemaining >= 0 ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}>
          <p className="text-xs text-gray-500 font-medium mb-1">Còn lại</p>
          <p className={`text-lg font-bold ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatShortVND(Math.abs(totalRemaining))}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">Tổng tiến độ</span>
            <span className="font-bold text-gray-800">{Math.round((totalSpent / totalBudget) * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? 'bg-red-500' : totalSpent / totalBudget >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {monthBudgets.map(b => {
          const meta = EXPENSE_CATEGORIES[b.category];
          const spent = spentByCategory[b.category] || 0;
          const pct = Math.min((spent / b.amount) * 100, 100);
          const over = spent > b.amount;
          const remaining = b.amount - spent;

          return (
            <div key={b.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${over ? 'border-red-200' : 'border-gray-100'} relative`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${meta.bgColor}`}>
                    {meta.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{meta.label}</p>
                    <p className="text-xs text-gray-500">Ngân sách: {formatShortVND(b.amount)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteBudget(b.id)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${over ? 'text-red-600' : 'text-gray-700'}`}>
                    {over ? `⚠️ Vượt ${formatShortVND(Math.abs(remaining))}` : `Còn ${formatShortVND(remaining)}`}
                  </span>
                  <span className="text-gray-500">Đã chi: {formatShortVND(spent)} ({Math.round(pct)}%)</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add budget card */}
        {unbudgetedCategories.length > 0 && (
          <button
            onClick={() => setEditing({ category: unbudgetedCategories[0], amount: 0 })}
            className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[120px]"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Thêm ngân sách</span>
          </button>
        )}
      </div>

      {monthBudgets.length === 0 && unbudgetedCategories.length > 0 && (
        <div className="bg-indigo-50 rounded-2xl p-6 text-center border border-indigo-100">
          <p className="text-3xl mb-2">📊</p>
          <p className="font-semibold text-indigo-800 mb-1">Chưa có ngân sách nào</p>
          <p className="text-sm text-indigo-600 mb-4">Thiết lập ngân sách để kiểm soát chi tiêu hiệu quả hơn</p>
          <button
            onClick={() => setEditing({ category: unbudgetedCategories[0], amount: 0 })}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Thêm ngân sách đầu tiên
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {editing !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Thêm ngân sách</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                <select
                  value={editing.category ?? ''}
                  onChange={e => setEditing({ ...editing, category: e.target.value as ExpenseCategory })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {unbudgetedCategories.map(cat => (
                    <option key={cat} value={cat}>{EXPENSE_CATEGORIES[cat].icon} {EXPENSE_CATEGORIES[cat].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền ngân sách (VND)</label>
                <input
                  type="number"
                  min="1"
                  value={editing.amount || ''}
                  onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
