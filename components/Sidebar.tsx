
import React from 'react';
import { HomeIcon, ChartBarIcon, ClipboardDocumentListIcon, UsersIcon, WarehouseIcon, CurrencyDollarIcon, PresentationChartLineIcon } from './Icons';

type View = 'dashboard' | 'detail' | 'audit' | 'statistics' | 'users' | 'audit_warehouse' | 'transactions' | 'financial_report';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  canViewStatistics: boolean;
  canViewAuditTrail: boolean;
  canManageUsers: boolean;
  canViewFinancials: boolean;
  companyInfo: {
      name: string;
      logoUrl: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const NavLink: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li>
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={`flex items-center p-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            <span className={`flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`}>
                {icon}
            </span>
            <span className="ml-3">{label}</span>
        </a>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, canViewStatistics, canViewAuditTrail, canManageUsers, canViewFinancials, companyInfo, isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform md:translate-x-0 md:static md:inset-auto flex flex-col shadow-xl md:shadow-none ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Sidebar"
            >
                <div className="flex items-center justify-center h-20 flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4">
                     {companyInfo.logoUrl ? (
                        <img src={companyInfo.logoUrl} alt={`${companyInfo.name} 로고`} className="h-14 w-auto max-w-full object-contain" />
                    ) : (
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                            <WarehouseIcon className="h-8 w-8" />
                            <span className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">IMS</span>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto py-4 px-3 custom-scrollbar">
                    <ul className="space-y-1.5">
                        <NavLink
                            icon={<HomeIcon className="w-6 h-6" />}
                            label="대시보드"
                            isActive={currentView === 'dashboard' || currentView === 'detail' || currentView === 'audit_warehouse'}
                            onClick={() => { onNavigate('dashboard'); onClose(); }}
                        />
                        {canManageUsers && (
                            <NavLink
                                icon={<UsersIcon className="w-6 h-6" />}
                                label="사용자 관리"
                                isActive={currentView === 'users'}
                                onClick={() => { onNavigate('users'); onClose(); }}
                            />
                        )}
                        {canViewFinancials && (
                            <>
                                <NavLink
                                    icon={<CurrencyDollarIcon className="w-6 h-6" />}
                                    label="거래 관리"
                                    isActive={currentView === 'transactions'}
                                    onClick={() => { onNavigate('transactions'); onClose(); }}
                                />
                                <NavLink
                                    icon={<PresentationChartLineIcon className="w-6 h-6" />}
                                    label="재무 보고서"
                                    isActive={currentView === 'financial_report'}
                                    onClick={() => { onNavigate('financial_report'); onClose(); }}
                                />
                            </>
                        )}
                        {canViewStatistics && (
                            <NavLink
                                icon={<ChartBarIcon className="w-6 h-6" />}
                                label="통계 보고서"
                                isActive={currentView === 'statistics'}
                                onClick={() => { onNavigate('statistics'); onClose(); }}
                            />
                        )}
                        {canViewAuditTrail && (
                            <NavLink
                                icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                                label="감사 기록"
                                isActive={currentView === 'audit'}
                                onClick={() => { onNavigate('audit'); onClose(); }}
                            />
                        )}
                    </ul>
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center md:hidden">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        메뉴 닫기
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
