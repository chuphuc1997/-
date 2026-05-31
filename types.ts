export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'education'
  | 'utilities'
  | 'work'
  | 'other_expense';

export type IncomeCategory =
  | 'salary'
  | 'investment'
  | 'gift'
  | 'bank_interest'
  | 'side_income'
  | 'other_income';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  amount: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  createdAt: string;
  icon: string;
}

export type Page = 'dashboard' | 'transactions' | 'budget' | 'calendar' | 'reports' | 'goals';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}
