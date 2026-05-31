import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatShortVND, DAY_NAMES_VI, MONTH_NAMES_VI } from '../constants';

interface Props {
  transactions: Transaction[];
}

const CalendarPage: React.FC<Props> = ({ transactions }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const txByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.filter(t => t.date.startsWith(monthKey)).forEach(t => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [transactions, monthKey]);

  const selectedTxs = selectedDate ? (txByDate[selectedDate] ?? []) : [];

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const todayStr = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const monthIncome = transactions.filter(t => t.type === 'income' && t.date.startsWith(monthKey)).reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions.filter(t => t.type === 'expense' && t.date.startsWith(monthKey)).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {/* Month Navigation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">{MONTH_NAMES_VI[month]} {year}</h2>
            <div className="flex gap-4 text-xs justify-center mt-0.5">
              <span className="text-emerald-600 font-semibold">+{formatShortVND(monthIncome)}</span>
              <span className="text-rose-600 font-semibold">-{formatShortVND(monthExpense)}</span>
            </div>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES_VI.map(d => (
            <div key={d} className={`text-center text-xs font-semibold py-1 ${d === 'CN' ? 'text-rose-500' : 'text-gray-500'}`}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for first week */}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTxs = txByDate[dateStr] ?? [];
            const income = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const expense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isWeekend = new Date(year, month, day).getDay() === 0;
            const hasTxs = dayTxs.length > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative rounded-xl p-1 min-h-[52px] flex flex-col items-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1'
                    : isToday
                    ? 'bg-indigo-50 ring-2 ring-indigo-300'
                    : hasTxs
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : isWeekend ? 'text-rose-500' : isToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {day}
                </span>
                {hasTxs && (
                  <div className="flex flex-col gap-0.5 mt-0.5 w-full px-0.5">
                    {income > 0 && (
                      <div className={`w-full h-1 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                    )}
                    {expense > 0 && (
                      <div className={`w-full h-1 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`} />
                    )}
                    {!isSelected && (
                      <span className="text-[9px] font-semibold text-gray-500 leading-tight">
                        {dayTxs.length}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-emerald-500 rounded-full inline-block" /> Thu nhập</span>
          <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-rose-500 rounded-full inline-block" /> Chi tiêu</span>
        </div>
      </div>

      {/* Selected date transactions */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
          <div className="px-5 py-3.5 bg-indigo-50 border-b border-indigo-100">
            <p className="font-semibold text-indigo-900 capitalize">{formatDate(selectedDate)}</p>
            <div className="flex gap-4 text-xs mt-0.5">
              {selectedTxs.filter(t => t.type === 'income').length > 0 && (
                <span className="text-emerald-600 font-semibold">
                  +{formatShortVND(selectedTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
                </span>
              )}
              {selectedTxs.filter(t => t.type === 'expense').length > 0 && (
                <span className="text-rose-600 font-semibold">
                  -{formatShortVND(selectedTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                </span>
              )}
            </div>
          </div>

          {selectedTxs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">Không có giao dịch ngày này</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedTxs.map(t => {
                const cats = t.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
                const meta = cats[t.category as keyof typeof cats];
                return (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${meta?.bgColor ?? 'bg-gray-100'}`}>
                      {meta?.icon ?? '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{t.description}</p>
                      <p className="text-xs text-gray-400">{meta?.label}</p>
                    </div>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatShortVND(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
