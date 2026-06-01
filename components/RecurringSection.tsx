import React, { useState } from 'react';
import { RecurringTransaction, TransactionType, Category, ExpenseCategory, IncomeCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatVND, formatShortVND } from '../constants';

interface Props {
  recurring: RecurringTransaction[];
  onAdd: (r: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const emptyForm = (): Omit<RecurringTransaction, 'id' | 'createdAt'> => ({
  type: 'expense',
  amount: 0,
  category: 'food',
  description: '',
  dayOfMonth: 1,
  active: true,
});

const RecurringSection: React.FC<Props> = ({ recurring, onAdd, onToggle, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<RecurringTransaction, 'id' | 'createdAt'>>(emptyForm());
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (t: TransactionType) => {
    setForm(f => ({
      ...f,
      type: t,
      category: t === 'income' ? 'salary' : 'food',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0) { setError('Vui lòng nhập số tiền hợp lệ'); return; }
    if (!form.description.trim()) { setError('Vui lòng nhập mô tả'); return; }
    onAdd({ ...form, amount, description: form.description.trim() });
    setForm(emptyForm());
    setAmountStr('');
    setError('');
    setShowForm(false);
  };

  const displayAmount = amountStr ? Number(amountStr).toLocaleString('vi-VN') : '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Giao dịch định kỳ</h3>
          <p className="text-xs text-gray-500 mt-0.5">Tự động nhắc nhở hàng tháng</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm()); setAmountStr(''); setError(''); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Thêm định kỳ
        </button>
      </div>

      {/* List */}
      {recurring.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-gray-500 font-medium">Chưa có giao dịch định kỳ</p>
          <p className="text-gray-400 text-sm mt-1">Thêm giao dịch lặp lại hàng tháng</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            + Thêm mới
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map(r => {
            const catMap = r.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const meta = catMap[r.category as keyof typeof catMap];
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  r.active ? 'border-gray-100' : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${meta?.bgColor ?? 'bg-gray-100'}`}>
                    {meta?.icon ?? '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta?.bgColor ?? 'bg-gray-100'} ${meta?.textColor ?? 'text-gray-600'}`}>
                        {meta?.label ?? r.category}
                      </span>
                      <span className="text-xs text-gray-400">Ngày {r.dayOfMonth} hàng tháng</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.type === 'income' ? '+' : '-'}{formatShortVND(r.amount)}
                    </span>
                    {/* Toggle */}
                    <button
                      onClick={() => onToggle(r.id)}
                      className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${r.active ? 'justify-end' : 'justify-start'}`}
                      style={{ background: r.active ? 'var(--primary)' : '#d1d5db' }}
                      title={r.active ? 'Đang hoạt động' : 'Đã tắt'}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(r.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {r.lastApplied && (
                  <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Đã áp dụng: {r.lastApplied}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Thêm giao dịch định kỳ</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-xl bg-gray-100 p-1">
                {(['expense', 'income'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      form.type === t
                        ? t === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t === 'expense' ? '💸 Chi tiêu' : '💰 Thu nhập'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền (VND)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayAmount}
                    onChange={e => setAmountStr(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₫</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Danh mục</label>
                <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                  {Object.entries(cats).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, category: key as Category }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                        form.category === key
                          ? 'border-[var(--primary)] bg-[var(--primary-light)] text-gray-700'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <span className="text-center leading-tight">{meta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Nhập mô tả giao dịch..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Day of month */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày trong tháng (1–28)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={form.dayOfMonth}
                  onChange={e => setForm(f => ({ ...f, dayOfMonth: Math.min(28, Math.max(1, Number(e.target.value))) }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-white font-semibold shadow-md transition-all hover:opacity-90"
                  style={{ background: 'var(--primary)' }}
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xs text-center animate-fade-in-up">
            <p className="text-4xl mb-3">🗑️</p>
            <p className="font-bold text-gray-900 mb-1">Xóa giao dịch định kỳ?</p>
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

export default RecurringSection;
