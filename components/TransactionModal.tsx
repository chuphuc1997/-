import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, ExpenseCategory, IncomeCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

interface Props {
  transaction?: Transaction | null;
  onSave: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

const TransactionModal: React.FC<Props> = ({ transaction, onSave, onClose }) => {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [category, setCategory] = useState<Category>(transaction?.category ?? 'food');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [date, setDate] = useState(transaction?.date ?? today());
  const [note, setNote] = useState(transaction?.note ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (type === 'income' && category in EXPENSE_CATEGORIES) setCategory('salary');
    if (type === 'expense' && category in INCOME_CATEGORIES) setCategory('food');
  }, [type]);

  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setAmount(cleaned);
  };

  const displayAmount = amount ? Number(amount).toLocaleString('vi-VN') : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError('Vui lòng nhập số tiền hợp lệ'); return; }
    if (!description.trim()) { setError('Vui lòng nhập mô tả'); return; }
    if (!date) { setError('Vui lòng chọn ngày'); return; }
    onSave({ type, amount: Number(amount), category, description: description.trim(), date, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {transaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
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
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-emerald-500 text-white shadow-md'
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
                onChange={e => handleAmountChange(e.target.value.replace(/\./g, '').replace(/,/g, ''))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent pr-12"
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
                  onClick={() => setCategory(key as Category)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    category === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
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
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Nhập mô tả giao dịch..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú (tùy chọn)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 transition-all"
            >
              {transaction ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
