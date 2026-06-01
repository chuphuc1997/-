import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { formatVND, formatShortVND, GOAL_ICONS, GOAL_COLORS } from '../constants';

interface Props {
  goals: SavingsGoal[];
  onSave: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdateAmount: (id: string, amount: number) => void;
}

interface GoalForm {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  color: string;
  icon: string;
}

const GoalsPage: React.FC<Props> = ({ goals, onSave, onDelete, onUpdateAmount }) => {
  const [showModal, setShowModal] = useState(false);
  const [addFunds, setAddFunds] = useState<{ id: string; name: string } | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<GoalForm>({
    name: '', targetAmount: '', currentAmount: '0',
    deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    color: GOAL_COLORS[0], icon: GOAL_ICONS[0],
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    onSave({
      name: form.name,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadline: form.deadline,
      color: form.color,
      icon: form.icon,
    });
    setShowModal(false);
    setForm({ name: '', targetAmount: '', currentAmount: '0', deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0], color: GOAL_COLORS[0], icon: GOAL_ICONS[0] });
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFunds || !fundAmount || Number(fundAmount) <= 0) return;
    const goal = goals.find(g => g.id === addFunds.id);
    if (!goal) return;
    onUpdateAmount(addFunds.id, goal.currentAmount + Number(fundAmount));
    setAddFunds(null);
    setFundAmount('');
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Đã tiết kiệm</p>
          <p className="text-base font-bold text-indigo-600">{formatShortVND(totalSaved)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Mục tiêu</p>
          <p className="text-base font-bold text-gray-800">{formatShortVND(totalTarget)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-medium mb-1">Đã hoàn thành</p>
          <p className="text-base font-bold text-emerald-600">{completed}/{goals.length}</p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <p className="text-5xl mb-3">🎯</p>
          <p className="font-bold text-gray-900 text-lg mb-1">Chưa có mục tiêu nào</p>
          <p className="text-gray-500 text-sm mb-5">Đặt mục tiêu tiết kiệm để định hướng tài chính</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 text-white rounded-xl font-semibold transition-all hover:opacity-90" style={{ background: 'var(--primary)' }}>
            + Thêm mục tiêu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {goals.map(g => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            const done = g.currentAmount >= g.targetAmount;
            const daysLeft = getDaysLeft(g.deadline);
            const remaining = g.targetAmount - g.currentAmount;

            return (
              <div key={g.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                {done && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    ✓ Hoàn thành!
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: `${g.color}20`, border: `2px solid ${g.color}40` }}
                  >
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{g.name}</p>
                    <p className="text-xs text-gray-500">
                      Hạn: {new Date(g.deadline).toLocaleDateString('vi-VN')}
                      {daysLeft > 0 && !done && (
                        <span className={`ml-1 font-semibold ${daysLeft <= 30 ? 'text-rose-500' : daysLeft <= 90 ? 'text-amber-500' : 'text-gray-500'}`}>
                          ({daysLeft} ngày)
                        </span>
                      )}
                    </p>
                  </div>
                  {!done && (
                    <button
                      onClick={() => setDeleteConfirm(g.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-800">{formatShortVND(g.currentAmount)}</span>
                    <span className="text-gray-500">{formatShortVND(g.targetAmount)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: done ? '#10b981' : g.color }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs font-bold" style={{ color: done ? '#10b981' : g.color }}>
                      {Math.round(pct)}%
                    </span>
                    {!done && (
                      <span className="text-xs text-gray-400">Còn {formatShortVND(remaining)}</span>
                    )}
                  </div>
                </div>

                {!done && (
                  <button
                    onClick={() => { setAddFunds({ id: g.id, name: g.name }); setFundAmount(''); }}
                    className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: `${g.color}15`, color: g.color, border: `1.5px solid ${g.color}30` }}
                  >
                    + Thêm tiền
                  </button>
                )}
              </div>
            );
          })}

          {/* Add goal card */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all min-h-[180px]"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold">Thêm mục tiêu mới</span>
          </button>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Thêm mục tiêu tiết kiệm</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biểu tượng</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                        form.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={`w-7 h-7 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên mục tiêu</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Mua xe máy, Du lịch..."
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền mục tiêu (VND)</label>
                <input
                  type="number"
                  min="1"
                  value={form.targetAmount}
                  onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                  placeholder="0"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đã tiết kiệm được (VND)</label>
                <input
                  type="number"
                  min="0"
                  value={form.currentAmount}
                  onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hạn chót</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all" style={{ background: 'var(--primary)' }}>Tạo mục tiêu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {addFunds && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Thêm tiền: {addFunds.name}</h2>
              <button onClick={() => setAddFunds(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddFunds} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền muốn thêm (VND)</label>
                <input
                  type="number"
                  min="1"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddFunds(null)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600">Thêm tiền</button>
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
            <p className="font-bold text-gray-900 mb-1">Xóa mục tiêu?</p>
            <p className="text-sm text-gray-500 mb-5">Hành động này không thể hoàn tác</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold">Hủy</button>
              <button onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-semibold">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
