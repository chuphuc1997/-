import React, { useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, SavingsGoal, Page, Toast } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_GOALS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionsPage from './components/TransactionsPage';
import BudgetPage from './components/BudgetPage';
import CalendarPage from './components/CalendarPage';
import ReportsPage from './components/ReportsPage';
import GoalsPage from './components/GoalsPage';
import TransactionModal from './components/TransactionModal';
import ToastContainer from './components/Toast';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage('finance_transactions', INITIAL_TRANSACTIONS)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    loadFromStorage('finance_budgets', INITIAL_BUDGETS)
  );
  const [goals, setGoals] = useState<SavingsGoal[]>(() =>
    loadFromStorage('finance_goals', INITIAL_GOALS)
  );
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => { localStorage.setItem('finance_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance_goals', JSON.stringify(goals)); }, [goals]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = genId();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSaveTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t =>
        t.id === editingTransaction.id ? { ...t, ...data } : t
      ));
      addToast('Đã cập nhật giao dịch ✓');
    } else {
      const newTx: Transaction = { ...data, id: genId(), createdAt: new Date().toISOString() };
      setTransactions(prev => [newTx, ...prev]);
      addToast(`Đã thêm ${data.type === 'income' ? 'thu nhập' : 'chi tiêu'} mới ✓`);
    }
    setShowTransactionModal(false);
    setEditingTransaction(null);
  }, [editingTransaction, addToast]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast('Đã xóa giao dịch', 'info');
  }, [addToast]);

  const handleEditTransaction = useCallback((t: Transaction) => {
    setEditingTransaction(t);
    setShowTransactionModal(true);
  }, []);

  const handleSaveBudget = useCallback((data: Omit<Budget, 'id'>) => {
    const existing = budgets.find(b => b.category === data.category && b.month === data.month);
    if (existing) {
      setBudgets(prev => prev.map(b => b.id === existing.id ? { ...b, ...data } : b));
      addToast('Đã cập nhật ngân sách ✓');
    } else {
      setBudgets(prev => [...prev, { ...data, id: genId() }]);
      addToast('Đã thêm ngân sách ✓');
    }
  }, [budgets, addToast]);

  const handleDeleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    addToast('Đã xóa ngân sách', 'info');
  }, [addToast]);

  const handleSaveGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    const newGoal: SavingsGoal = { ...data, id: genId(), createdAt: new Date().toISOString() };
    setGoals(prev => [...prev, newGoal]);
    addToast(`Đã tạo mục tiêu "${data.name}" 🎯`);
  }, [addToast]);

  const handleDeleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    addToast('Đã xóa mục tiêu', 'info');
  }, [addToast]);

  const handleUpdateGoalAmount = useCallback((id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const updated = { ...g, currentAmount: amount };
      if (amount >= g.targetAmount) addToast(`🎉 Chúc mừng! Bạn đã đạt mục tiêu "${g.name}"!`);
      return updated;
    }));
  }, [addToast]);

  const openAddTransaction = useCallback(() => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} onNavigate={p => setPage(p as Page)} />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} onAdd={openAddTransaction} />;
      case 'budget':
        return <BudgetPage budgets={budgets} transactions={transactions} onSaveBudget={handleSaveBudget} onDeleteBudget={handleDeleteBudget} />;
      case 'calendar':
        return <CalendarPage transactions={transactions} />;
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      case 'goals':
        return <GoalsPage goals={goals} onSave={handleSaveGoal} onDelete={handleDeleteGoal} onUpdateAmount={handleUpdateGoalAmount} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentPage={page} onNavigate={setPage} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentPage={page}
          onMenuClick={() => setSidebarOpen(true)}
          onAddTransaction={openAddTransaction}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {showTransactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          onSave={handleSaveTransaction}
          onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
