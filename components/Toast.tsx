import React, { useEffect } from 'react';
import { Toast as ToastType } from '../types';

interface Props {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={onRemove} />)}
  </div>
);

const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles: Record<string, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };
  const icons: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ' };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-64 max-w-sm text-white animate-fade-in-up ${styles[toast.type]}`}>
      <span className="text-base font-bold w-5 text-center">{icons[toast.type]}</span>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="opacity-70 hover:opacity-100 text-lg leading-none ml-1">×</button>
    </div>
  );
};

export default ToastContainer;
