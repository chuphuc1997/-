import React from 'react';
import { Page } from '../types';

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
}

const Sidebar: React.FC<Props> = ({ currentPage, onNavigate, isOpen, onClose }) => {
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
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-3 text-center">
            <p className="text-xs text-indigo-700 font-medium">Tài chính thông minh 🌟</p>
            <p className="text-xs text-gray-500 mt-0.5">Quản lý chi tiêu hiệu quả</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
