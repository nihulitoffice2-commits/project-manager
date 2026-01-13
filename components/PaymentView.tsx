
import React from 'react';
import { useProjectSystem } from '../store/ProjectStore';
import { UserRole } from '../types';

export const PaymentView: React.FC = () => {
  const { state } = useProjectSystem();

  if (state.currentUser?.role === UserRole.WORKER) {
    return (
      <div className="p-20 text-center bg-white rounded-2xl border border-slate-200">
        <div className="text-6xl mb-6">🔒</div>
        <h3 className="text-xl font-black text-slate-800">גישה מוגבלת</h3>
        <p className="text-slate-500 mt-2">אין לך הרשאות לצפות בנתונים כספיים. פנה למנהל המערכת.</p>
      </div>
    );
  }

  const income = state.payments.filter(p => p.type === 'INCOME').reduce((s, p) => s + p.actualAmount, 0);
  const expense = state.payments.filter(p => p.type === 'EXPENSE').reduce((s, p) => s + p.actualAmount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
           <p className="text-xs font-bold text-emerald-600 uppercase">סה"כ הכנסות</p>
           <p className="text-3xl font-black text-emerald-800 mt-1">₪{income.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
           <p className="text-xs font-bold text-red-600 uppercase">סה"כ הוצאות</p>
           <p className="text-3xl font-black text-red-800 mt-1">₪{expense.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
           <p className="text-xs font-bold text-blue-600 uppercase">יתרה נוכחית</p>
           <p className="text-3xl font-black text-blue-800 mt-1">₪{(income - expense).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">פירוט תשלומים ותקציבים</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 border-b border-slate-100 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">פרויקט</th>
                <th className="px-6 py-4">סוג</th>
                <th className="px-6 py-4">סכום</th>
                <th className="px-6 py-4">תאריך</th>
                <th className="px-6 py-4">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">אין תנועות כספיות רשומות</td>
                </tr>
              ) : (
                state.payments.map(p => {
                  const project = state.projects.find(proj => proj.id === p.projectId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{project?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                           p.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.type === 'INCOME' ? 'הכנסה' : 'הוצאה'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black">₪{p.actualAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{p.paymentDate || p.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{p.status}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
