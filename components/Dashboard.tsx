import React, { useMemo } from 'react';
import { Transaction, Budget, RecurringTransaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatVND, formatShortVND } from '../constants';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  onNavigate: (page: string) => void;
  recurringTransactions: RecurringTransaction[];
  onApplyRecurring: () => void;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  gradient: string;
  pctChange?: number | null; // null means no previous data
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, gradient, pctChange }) => (
  <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient} relative overflow-hidden`}>
    <div className="absolute top-3 right-4 text-3xl opacity-20">{icon}</div>
    <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
    <p className="text-2xl font-bold truncate">{value}</p>
    {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    {pctChange !== undefined && (
      <div className="mt-2">
        {pctChange === null ? (
          <span className="text-xs opacity-60">– vs tháng trước</span>
        ) : pctChange === 0 ? (
          <span className="text-xs opacity-70">= vs tháng trước</span>
        ) : pctChange > 0 ? (
          <span className="text-xs font-semibold" style={{ color: '#86efac' }}>↑ {Math.abs(pctChange)}% vs tháng trước</span>
        ) : (
          <span className="text-xs font-semibold" style={{ color: '#fca5a5' }}>↓ {Math.abs(pctChange)}% vs tháng trước</span>
        )}
      </div>
    )}
  </div>
);

const DonutChart: React.FC<{ data: { label: string; value: number; color: string; icon: string }[]; total: number }> = ({ data, total }) => {
  if (total === 0) return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có dữ liệu</div>;

  const size = 140;
  const r = 50;
  const cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const seg = { ...d, pct, dasharray: pct * circ, offset };
    offset += pct * circ;
    return seg;
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${seg.dasharray} ${circ}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 font-medium">Tổng</p>
          <p className="text-sm font-bold text-gray-800">{formatShortVND(total)}</p>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 min-w-0">
        {data.slice(0, 5).map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-gray-600 truncate flex-1">{d.icon} {d.label}</span>
            <span className="text-xs font-semibold text-gray-800">{Math.round(d.pct * 100)}%</span>
          </div>
        ))}
        {data.length > 5 && <p className="text-xs text-gray-400">+{data.length - 5} mục khác</p>}
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: { label: string; income: number; expense: number }[] }> = ({ data }) => {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex items-end gap-0.5 h-20">
            <div
              className="flex-1 rounded-t-md bg-emerald-400 min-h-1 transition-all"
              style={{ height: `${(d.income / max) * 100}%` }}
              title={`Thu: ${formatVND(d.income)}`}
            />
            <div
              className="flex-1 rounded-t-md bg-rose-400 min-h-1 transition-all"
              style={{ height: `${(d.expense / max) * 100}%` }}
              title={`Chi: ${formatVND(d.expense)}`}
            />
          </div>
          <span className="text-[10px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const calcPctChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct;
};

const Dashboard: React.FC<Props> = ({ transactions, budgets, onNavigate, recurringTransactions, onApplyRecurring }) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Previous month
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const prevMonthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(prevMonth)),
    [transactions, prevMonth]
  );

  const totalIncome = useMemo(() => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const totalExpense = useMemo(() => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : '0';

  const prevIncome = useMemo(() => prevMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [prevMonthTxs]);
  const prevExpense = useMemo(() => prevMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [prevMonthTxs]);
  const prevBalance = prevIncome - prevExpense;
  const prevSavingsRate = prevIncome > 0 ? (prevBalance / prevIncome) * 100 : 0;

  const hasPrevData = prevIncome > 0 || prevExpense > 0;

  const balancePct = hasPrevData ? calcPctChange(balance, prevBalance) : null;
  const incomePct = hasPrevData ? calcPctChange(totalIncome, prevIncome) : null;
  const expensePct = hasPrevData ? calcPctChange(totalExpense, prevExpense) : null;
  const savingsRatePct = hasPrevData && prevSavingsRate !== 0
    ? calcPctChange(Number(savingsRate), Math.round(prevSavingsRate))
    : null;

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, val]) => {
        const meta = EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES];
        return { label: meta?.label ?? cat, value: val, color: meta?.color ?? '#999', icon: meta?.icon ?? '📦' };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthTxs]);

  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 4 }, (_, i) => ({ label: `T${i + 1}`, income: 0, expense: 0 }));
    monthTxs.forEach(t => {
      const day = new Date(t.date).getDate();
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      if (t.type === 'income') weeks[weekIdx].income += t.amount;
      else weeks[weekIdx].expense += t.amount;
    });
    return weeks;
  }, [monthTxs]);

  const currentBudgets = budgets.filter(b => b.month === currentMonth);
  const budgetAlerts = currentBudgets.filter(b => {
    const spent = monthTxs.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
    return spent / b.amount >= 0.8;
  });

  const recentTxs = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [transactions]
  );

  // Pending recurring
  const pendingRecurring = recurringTransactions.filter(r => r.active && r.lastApplied !== currentMonth);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Recurring banner */}
      {pendingRecurring.length > 0 && (
        <div className="rounded-2xl p-4 flex items-center gap-3 text-white shadow-md" style={{ background: 'var(--primary)' }}>
          <span className="text-2xl flex-shrink-0">🔄</span>
          <div className="flex-1">
            <p className="font-semibold text-sm">Giao dịch định kỳ chờ áp dụng</p>
            <p className="text-xs opacity-80 mt-0.5">
              Bạn có {pendingRecurring.length} giao dịch định kỳ chưa được áp dụng tháng này
            </p>
          </div>
          <button
            onClick={onApplyRecurring}
            className="px-4 py-2 rounded-xl bg-white font-semibold text-sm transition-all hover:opacity-90 flex-shrink-0"
            style={{ color: 'var(--primary)' }}
          >
            Áp dụng tất cả
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Số dư tháng này"
          value={formatShortVND(Math.abs(balance))}
          sub={balance >= 0 ? 'Dương 😊' : 'Âm ⚠️'}
          icon="💳"
          gradient={balance >= 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}
          pctChange={balancePct}
        />
        <StatCard
          label="Thu nhập"
          value={formatShortVND(totalIncome)}
          sub={`${monthTxs.filter(t => t.type === 'income').length} giao dịch`}
          icon="💰"
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
          pctChange={incomePct}
        />
        <StatCard
          label="Chi tiêu"
          value={formatShortVND(totalExpense)}
          sub={`${monthTxs.filter(t => t.type === 'expense').length} giao dịch`}
          icon="💸"
          gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          pctChange={expensePct}
        />
        <StatCard
          label="Tỷ lệ tiết kiệm"
          value={`${savingsRate}%`}
          sub={balance >= 0 ? formatShortVND(balance) + ' tiết kiệm' : 'Vượt ngân sách!'}
          icon="🎯"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          pctChange={savingsRatePct}
        />
      </div>

      {/* Budget Alert */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Cảnh báo ngân sách</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {budgetAlerts.map(b => {
                const meta = EXPENSE_CATEGORIES[b.category as keyof typeof EXPENSE_CATEGORIES];
                const spent = monthTxs.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
                const pct = Math.round((spent / b.amount) * 100);
                return `${meta?.icon} ${meta?.label} (${pct}%)`;
              }).join(' · ')}
            </p>
          </div>
          <button onClick={() => onNavigate('budget')} className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 flex-shrink-0">
            Xem →
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Chi tiêu theo danh mục</h3>
            <span className="text-xs text-gray-400">Tháng này</span>
          </div>
          <DonutChart data={expenseByCategory} total={totalExpense} />
        </div>

        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Thu chi theo tuần</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Thu</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" /> Chi</span>
            </div>
          </div>
          <BarChart data={weeklyData} />
          <div className="flex justify-between mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <span>Tổng thu: <span className="font-semibold text-emerald-600">{formatShortVND(totalIncome)}</span></span>
            <span>Tổng chi: <span className="font-semibold text-rose-600">{formatShortVND(totalExpense)}</span></span>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      {currentBudgets.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Tiến độ ngân sách</h3>
            <button onClick={() => onNavigate('budget')} className="text-xs font-semibold hover:opacity-70" style={{ color: 'var(--primary)' }}>Xem tất cả →</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {currentBudgets.slice(0, 6).map(b => {
              const meta = EXPENSE_CATEGORIES[b.category as keyof typeof EXPENSE_CATEGORIES];
              const spent = monthTxs.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
              const pct = Math.min((spent / b.amount) * 100, 100);
              const over = spent > b.amount;
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{meta?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate">{meta?.label}</span>
                      <span className={`font-semibold ${over ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatShortVND(spent)}/{formatShortVND(b.amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Giao dịch gần đây</h3>
          <button onClick={() => onNavigate('transactions')} className="text-xs font-semibold hover:opacity-70" style={{ color: 'var(--primary)' }}>Xem tất cả →</button>
        </div>
        <div className="space-y-3">
          {recentTxs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Chưa có giao dịch nào</p>
          ) : recentTxs.map(t => {
            const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const meta = cats[t.category as keyof typeof cats];
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${meta?.bgColor ?? 'bg-gray-100'}`}>
                  {meta?.icon ?? '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{meta?.label ?? t.category} · {new Date(t.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatShortVND(t.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
