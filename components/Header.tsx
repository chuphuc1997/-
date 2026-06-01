import React from 'react';
import { Page, UserProfile } from '../types';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Tổng quan',
  transactions: 'Giao dịch',
  budget: 'Ngân sách',
  calendar: 'Lịch tài chính',
  reports: 'Báo cáo',
  goals: 'Mục tiêu tiết kiệm',
};

interface Props {
  currentPage: Page;
  onMenuClick: () => void;
  onAddTransaction: () => void;
  profile: UserProfile;
}

const Header: React.FC<Props> = ({ currentPage, onMenuClick, onAddTransaction, profile }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{PAGE_TITLES[currentPage]}</h1>
          <p className="text-xs text-gray-400 hidden sm:block capitalize">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar display */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xl">{profile.avatar}</span>
          <span className="text-sm font-medium text-gray-700">{profile.name}</span>
        </div>

        <button
          onClick={onAddTransaction}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: 'var(--primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Thêm giao dịch</span>
          <span className="sm:hidden">Thêm</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
