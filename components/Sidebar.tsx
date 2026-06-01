import React from 'react';
import { Page, UserProfile } from '../types';
import { THEMES } from '../constants';

interface NavItem {
  page: Page;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { page: 'dashboard', label: 'Tổng quan', icon: '🏠' },
  { page: 'transactions', label: 'Giao dịch', icon: '💸' },
  { page: 'budget', label: 'Ngân sách', icon: '📊' },
  { page: 'calendar', label: 'Lịch', icon: '📅' },
  { page: 'reports', label: 'Báo cáo', icon: '📈' },
  { page: 'goals', label: 'Mục tiêu', icon: '🎯' },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onShowProfile: () => void;
}

const Sidebar: React.FC<Props> = ({ currentPage, onNavigate, isOpen, onClose, profile, onShowProfile }) => {
  const theme = THEMES[profile.themeColor];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:shadow-none md:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl shadow-md"
            style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-secondary))` }}
          >
            💰
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">FinanceApp</p>
            <p className="text-xs text-gray-500">Quản lý tài chính</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { background: 'var(--primary)' } : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-100">
              {profile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: theme.primary }}
                />
                <span className="text-xs text-gray-400">{theme.name}</span>
              </div>
            </div>
            <button
              onClick={onShowProfile}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex-shrink-0"
              title="Cài đặt hồ sơ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="rounded-xl p-3 text-center" style={{ background: 'var(--primary-light)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Tài chính thông minh 🌟</p>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý chi tiêu hiệu quả</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
