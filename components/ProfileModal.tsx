import React, { useState } from 'react';
import { UserProfile, ThemeColor } from '../types';
import { AVATARS, THEMES, formatVND } from '../constants';

interface Props {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
}

const ProfileModal: React.FC<Props> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [themeColor, setThemeColor] = useState<ThemeColor>(profile.themeColor);
  const [monthlySalary, setMonthlySalary] = useState(String(profile.monthlySalary || ''));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim() || 'Người dùng', avatar, themeColor, monthlySalary: Number(monthlySalary) || 0 });
    onClose();
  };

  const displaySalary = monthlySalary ? Number(monthlySalary).toLocaleString('vi-VN') : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Hồ sơ cá nhân</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Avatar picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn avatar</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border-2 ${
                    avatar === a
                      ? 'border-[var(--primary)] bg-[var(--primary-light)] scale-110 shadow-md'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên hiển thị</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Monthly salary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lương tháng (VND)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={displaySalary}
                onChange={e => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  setMonthlySalary(cleaned);
                }}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₫</span>
            </div>
            {Number(monthlySalary) > 0 && (
              <p className="text-xs text-gray-400 mt-1">{formatVND(Number(monthlySalary))}</p>
            )}
          </div>

          {/* Theme color picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề màu sắc</label>
            <div className="flex flex-wrap gap-3">
              {(Object.entries(THEMES) as [ThemeColor, typeof THEMES[ThemeColor]][]).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setThemeColor(key)}
                  title={theme.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    themeColor === key
                      ? 'border-gray-400 bg-gray-50 shadow-md scale-105'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ background: theme.primary }}
                  />
                  <span className="text-gray-700">{theme.name}</span>
                  {themeColor === key && <span className="text-base">{theme.icon}</span>}
                </button>
              ))}
            </div>
          </div>

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
              className="flex-1 py-3 rounded-xl text-white font-semibold shadow-md transition-all hover:opacity-90"
              style={{ background: 'var(--primary)' }}
            >
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
