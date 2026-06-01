import { CategoryMeta, ExpenseCategory, IncomeCategory, Transaction, Budget, SavingsGoal, ThemeColor, UserProfile, RecurringTransaction } from './types';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  food: { label: 'Ăn uống', icon: '🍜', color: '#f97316', bgColor: 'bg-orange-100', borderColor: 'border-orange-300', textColor: 'text-orange-700' },
  transport: { label: 'Di chuyển', icon: '🚗', color: '#3b82f6', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
  housing: { label: 'Nhà ở', icon: '🏠', color: '#8b5cf6', bgColor: 'bg-purple-100', borderColor: 'border-purple-300', textColor: 'text-purple-700' },
  health: { label: 'Sức khỏe', icon: '💊', color: '#ec4899', bgColor: 'bg-pink-100', borderColor: 'border-pink-300', textColor: 'text-pink-700' },
  entertainment: { label: 'Giải trí', icon: '🎮', color: '#06b6d4', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-300', textColor: 'text-cyan-700' },
  shopping: { label: 'Mua sắm', icon: '🛍️', color: '#f43f5e', bgColor: 'bg-rose-100', borderColor: 'border-rose-300', textColor: 'text-rose-700' },
  education: { label: 'Giáo dục', icon: '📚', color: '#0ea5e9', bgColor: 'bg-sky-100', borderColor: 'border-sky-300', textColor: 'text-sky-700' },
  utilities: { label: 'Tiện ích', icon: '🔌', color: '#eab308', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300', textColor: 'text-yellow-700' },
  work: { label: 'Công việc', icon: '💼', color: '#64748b', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', textColor: 'text-slate-700' },
  other_expense: { label: 'Chi khác', icon: '📦', color: '#6b7280', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', textColor: 'text-gray-700' },
};

export const INCOME_CATEGORIES: Record<IncomeCategory, CategoryMeta> = {
  salary: { label: 'Lương', icon: '💰', color: '#10b981', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300', textColor: 'text-emerald-700' },
  investment: { label: 'Đầu tư', icon: '📈', color: '#059669', bgColor: 'bg-green-100', borderColor: 'border-green-300', textColor: 'text-green-700' },
  gift: { label: 'Quà tặng', icon: '🎁', color: '#7c3aed', bgColor: 'bg-violet-100', borderColor: 'border-violet-300', textColor: 'text-violet-700' },
  bank_interest: { label: 'Lãi ngân hàng', icon: '🏦', color: '#0284c7', bgColor: 'bg-blue-100', borderColor: 'border-blue-300', textColor: 'text-blue-700' },
  side_income: { label: 'Thu nhập phụ', icon: '⚡', color: '#d97706', bgColor: 'bg-amber-100', borderColor: 'border-amber-300', textColor: 'text-amber-700' },
  other_income: { label: 'Thu khác', icon: '💡', color: '#16a34a', bgColor: 'bg-green-100', borderColor: 'border-green-300', textColor: 'text-green-700' },
};

const genId = () => Math.random().toString(36).slice(2);

const d = (offset: number) => {
  const date = new Date(2026, 4, 1); // May 2026
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: genId(), type: 'income', amount: 18000000, category: 'salary', description: 'Lương tháng 5', date: d(0), createdAt: new Date().toISOString() },
  { id: genId(), type: 'income', amount: 2500000, category: 'side_income', description: 'Freelance thiết kế', date: d(3), createdAt: new Date().toISOString() },
  { id: genId(), type: 'income', amount: 350000, category: 'bank_interest', description: 'Lãi tiết kiệm tháng 5', date: d(1), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 3500000, category: 'housing', description: 'Tiền thuê nhà', date: d(2), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 1200000, category: 'food', description: 'Đi chợ tuần 1', date: d(3), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 450000, category: 'transport', description: 'Xăng xe tháng 5', date: d(4), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 280000, category: 'food', description: 'Ăn sáng văn phòng', date: d(5), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 750000, category: 'entertainment', description: 'Netflix + Spotify', date: d(6), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 320000, category: 'utilities', description: 'Điện tháng 5', date: d(7), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 180000, category: 'utilities', description: 'Internet tháng 5', date: d(7), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 2100000, category: 'shopping', description: 'Quần áo mùa hè', date: d(8), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 600000, category: 'health', description: 'Khám sức khỏe', date: d(10), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 850000, category: 'food', description: 'Ăn ngoài cuối tuần', date: d(11), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 1500000, category: 'education', description: 'Khóa học tiếng Anh', date: d(12), createdAt: new Date().toISOString() },
  { id: genId(), type: 'income', amount: 500000, category: 'gift', description: 'Quà sinh nhật', date: d(13), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 420000, category: 'food', description: 'Đi chợ tuần 2', date: d(14), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 200000, category: 'transport', description: 'Grab tuần này', date: d(15), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 980000, category: 'work', description: 'Thiết bị văn phòng', date: d(16), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 350000, category: 'food', description: 'Cafe + trà sữa', date: d(17), createdAt: new Date().toISOString() },
  { id: genId(), type: 'income', amount: 800000, category: 'investment', description: 'Cổ tức cổ phiếu', date: d(18), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 1800000, category: 'shopping', description: 'Đồ gia dụng', date: d(19), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 430000, category: 'food', description: 'Đi chợ tuần 3', date: d(21), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 560000, category: 'entertainment', description: 'Xem phim + karaoke', date: d(22), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 250000, category: 'health', description: 'Vitamin + thuốc', date: d(23), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 400000, category: 'food', description: 'Đặt đồ ăn online', date: d(24), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 1200000, category: 'transport', description: 'Vé xe về quê', date: d(25), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 380000, category: 'food', description: 'Đi chợ tuần 4', date: d(28), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 200000, category: 'utilities', description: 'Nước tháng 5', date: d(28), createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 750000, category: 'entertainment', description: 'Du lịch cuối tuần', date: d(29), createdAt: new Date().toISOString() },
  { id: genId(), type: 'income', amount: 1200000, category: 'side_income', description: 'Bán đồ cũ online', date: d(29), createdAt: new Date().toISOString() },
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: genId(), category: 'food', amount: 3000000, month: '2026-05' },
  { id: genId(), category: 'transport', amount: 1500000, month: '2026-05' },
  { id: genId(), category: 'housing', amount: 4000000, month: '2026-05' },
  { id: genId(), category: 'health', amount: 500000, month: '2026-05' },
  { id: genId(), category: 'entertainment', amount: 1000000, month: '2026-05' },
  { id: genId(), category: 'shopping', amount: 2000000, month: '2026-05' },
  { id: genId(), category: 'education', amount: 1500000, month: '2026-05' },
  { id: genId(), category: 'utilities', amount: 800000, month: '2026-05' },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  { id: genId(), name: 'Mua xe máy', targetAmount: 30000000, currentAmount: 12000000, deadline: '2026-12-31', color: '#3b82f6', icon: '🏍️', createdAt: new Date().toISOString() },
  { id: genId(), name: 'Du lịch Đà Nẵng', targetAmount: 10000000, currentAmount: 4500000, deadline: '2026-09-01', color: '#10b981', icon: '✈️', createdAt: new Date().toISOString() },
  { id: genId(), name: 'Quỹ khẩn cấp', targetAmount: 50000000, currentAmount: 22000000, deadline: '2027-06-30', color: '#f97316', icon: '🛡️', createdAt: new Date().toISOString() },
  { id: genId(), name: 'Laptop mới', targetAmount: 25000000, currentAmount: 8000000, deadline: '2026-11-30', color: '#8b5cf6', icon: '💻', createdAt: new Date().toISOString() },
];

export const MONTH_NAMES_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
export const DAY_NAMES_VI = ['CN','T2','T3','T4','T5','T6','T7'];

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};

export const formatShortVND = (amount: number): string => {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return `${amount}`;
};

export const GOAL_ICONS = ['🏍️','🚗','🏠','✈️','💻','📱','💍','🎓','🛡️','💰','🎁','🏖️','📸','🎹','⚽'];
export const GOAL_COLORS = ['#3b82f6','#10b981','#f97316','#8b5cf6','#ec4899','#0ea5e9','#f59e0b','#14b8a6','#ef4444','#6366f1'];

export const THEMES: Record<ThemeColor, { name: string; primary: string; secondary: string; light: string; icon: string }> = {
  indigo: { name: 'Indigo', primary: '#4f46e5', secondary: '#7c3aed', light: '#eef2ff', icon: '💜' },
  emerald: { name: 'Emerald', primary: '#059669', secondary: '#0d9488', light: '#ecfdf5', icon: '💚' },
  rose: { name: 'Rose', primary: '#e11d48', secondary: '#db2777', light: '#fff1f2', icon: '🌹' },
  amber: { name: 'Amber', primary: '#d97706', secondary: '#ea580c', light: '#fffbeb', icon: '🌻' },
  violet: { name: 'Violet', primary: '#7c3aed', secondary: '#6d28d9', light: '#f5f3ff', icon: '🔮' },
  sky: { name: 'Sky', primary: '#0284c7', secondary: '#0369a1', light: '#f0f9ff', icon: '🌊' },
};

export const AVATARS = ['😊','😎','🤓','🦊','🐼','🦁','🐨','🦄','🐯','🐸','🎃','👑','🌟','💎','🍀'];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Người dùng',
  avatar: '😊',
  themeColor: 'indigo',
  monthlySalary: 0,
};

export const INITIAL_RECURRING: RecurringTransaction[] = [
  { id: genId(), type: 'income', amount: 18000000, category: 'salary', description: 'Lương tháng', dayOfMonth: 1, active: true, createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 3500000, category: 'housing', description: 'Tiền thuê nhà', dayOfMonth: 3, active: true, createdAt: new Date().toISOString() },
  { id: genId(), type: 'expense', amount: 180000, category: 'utilities', description: 'Internet tháng', dayOfMonth: 5, active: true, createdAt: new Date().toISOString() },
];
