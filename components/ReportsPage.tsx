import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatVND, formatShortVND, MONTH_NAMES_VI } from '../constants';

interface Props {
  transactions: Transaction[];
}

const ReportsPage: React.FC<Props> = ({ transactions }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
      const txs = transactions.filter(t => t.date.startsWith(monthKey));
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { month: MONTH_NAMES_VI[i].replace('Tháng ', 'T'), income, expense, balance: income - expense };
    });
  }, [transactions, year]);

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentMonthTxs = transactions.filter(t => t.date.startsWith(currentMonthKey));

  const expenseByCat = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTxs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, amount]) => {
        const meta = EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES];
        return { cat, label: meta?.label ?? cat, icon: meta?.icon ?? '📦', color: meta?.color ?? '#999', amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTxs]);

  const incomeByCat = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthTxs.filter(t => t.type === 'income').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, amount]) => {
        const meta = INCOME_CATEGORIES[cat as keyof typeof INCOME_CATEGORIES];
        return { cat, label: meta?.label ?? cat, icon: meta?.icon ?? '💰', color: meta?.color ?? '#10b981', amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTxs]);

  const totalExpense = expenseByCat.reduce((s, c) => s + c.amount, 0);
  const totalIncome = incomeByCat.reduce((s, c) => s + c.amount, 0);

  const maxMonthly = Math.max(...monthlyData.flatMap(d => [d.income, d.expense]), 1);
  const yearIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const yearExpense = monthlyData.reduce((s, d) => s + d.expense, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Year selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-bold text-gray-900">Năm {year}</span>
          <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-right">
            <p className="text-xs text-gray-500">Tổng thu {year}</p>
            <p className="font-bold text-emerald-600">{formatShortVND(yearIncome)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Tổng chi {year}</p>
            <p className="font-bold text-rose-600">{formatShortVND(yearExpense)}</p>
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Thu chi theo tháng</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Thu</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" /> Chi</span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-48">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-36">
                <div
                  className="flex-1 rounded-t-md bg-emerald-400 min-h-0.5 transition-all hover:bg-emerald-500 cursor-default"
                  style={{ height: `${(d.income / maxMonthly) * 100}%` }}
                  title={`Thu tháng ${i + 1}: ${formatVND(d.income)}`}
                />
                <div
                  className="flex-1 rounded-t-md bg-rose-400 min-h-0.5 transition-all hover:bg-rose-500 cursor-default"
                  style={{ height: `${(d.expense / maxMonthly) * 100}%` }}
                  title={`Chi tháng ${i + 1}: ${formatVND(d.expense)}`}
                />
              </div>
              <span className="text-[10px] text-gray-500">{d.month}</span>
              <span className={`text-[10px] font-bold ${d.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {d.balance !== 0 ? formatShortVND(d.balance) : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Chi tiêu tháng này theo danh mục</h3>
          {expenseByCat.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Không có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {expenseByCat.map(c => {
                const pct = totalExpense > 0 ? (c.amount / totalExpense) * 100 : 0;
                return (
                  <div key={c.cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span>{c.icon}</span>{c.label}
                      </span>
                      <span className="text-xs text-gray-500">{formatShortVND(c.amount)} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                <span>Tổng chi tiêu</span>
                <span className="text-rose-600">{formatVND(totalExpense)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Income breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Thu nhập tháng này theo nguồn</h3>
          {incomeByCat.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Không có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {incomeByCat.map(c => {
                const pct = totalIncome > 0 ? (c.amount / totalIncome) * 100 : 0;
                return (
                  <div key={c.cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span>{c.icon}</span>{c.label}
                      </span>
                      <span className="text-xs text-gray-500">{formatShortVND(c.amount)} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                <span>Tổng thu nhập</span>
                <span className="text-emerald-600">{formatVND(totalIncome)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly summary table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="font-bold text-gray-900 mb-4">Bảng tổng hợp theo tháng</h3>
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left pb-2 font-semibold">Tháng</th>
              <th className="text-right pb-2 font-semibold text-emerald-600">Thu nhập</th>
              <th className="text-right pb-2 font-semibold text-rose-600">Chi tiêu</th>
              <th className="text-right pb-2 font-semibold text-indigo-600">Số dư</th>
              <th className="text-right pb-2 font-semibold text-gray-500">Tiết kiệm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {monthlyData.map((d, i) => {
              const savingsRate = d.income > 0 ? Math.round((d.balance / d.income) * 100) : 0;
              const hasData = d.income > 0 || d.expense > 0;
              return (
                <tr key={i} className={`${hasData ? '' : 'opacity-40'} hover:bg-gray-50/50 transition-colors`}>
                  <td className="py-2.5 font-medium text-gray-700">{MONTH_NAMES_VI[i]}</td>
                  <td className="text-right py-2.5 text-emerald-600 font-medium">{d.income > 0 ? formatShortVND(d.income) : '-'}</td>
                  <td className="text-right py-2.5 text-rose-600 font-medium">{d.expense > 0 ? formatShortVND(d.expense) : '-'}</td>
                  <td className={`text-right py-2.5 font-bold ${d.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {hasData ? (d.balance >= 0 ? '+' : '') + formatShortVND(d.balance) : '-'}
                  </td>
                  <td className="text-right py-2.5 text-gray-500">
                    {d.income > 0 ? `${savingsRate}%` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-bold">
              <td className="py-2.5 text-gray-800">Cả năm {year}</td>
              <td className="text-right py-2.5 text-emerald-600">{formatShortVND(yearIncome)}</td>
              <td className="text-right py-2.5 text-rose-600">{formatShortVND(yearExpense)}</td>
              <td className={`text-right py-2.5 ${yearIncome - yearExpense >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                {yearIncome > 0 || yearExpense > 0 ? (yearIncome - yearExpense >= 0 ? '+' : '') + formatShortVND(yearIncome - yearExpense) : '-'}
              </td>
              <td className="text-right py-2.5 text-gray-500">
                {yearIncome > 0 ? `${Math.round(((yearIncome - yearExpense) / yearIncome) * 100)}%` : '-'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ReportsPage;
