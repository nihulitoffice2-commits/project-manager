
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../services/logic';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Plus } from 'lucide-react';
import Modal from '../UI/Modal';
import TransactionForm from '../Forms/TransactionForm';

const FinanceModule: React.FC = () => {
  const { transactions, projects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE' && (t.status === 'PAID' || t.status === 'INVOICE'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPlannedIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status !== 'PAID')
    .reduce((sum, t) => sum + t.amount, 0);

  const grossProfit = totalIncome - totalExpenses;

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'פרויקט כללי';

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'PLANNED': return 'מתוכנן';
          case 'INVOICE': return 'חשבונית';
          case 'PAID': return 'שולם';
          case 'OVERDUE': return 'בפיגור';
          default: return status;
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">ניהול פיננסי</h2>
          <p className="text-slate-500 font-medium">מעקב הכנסות, הוצאות ותזרים מזומנים פרויקטלי</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          תנועה חדשה <Plus size={20} />
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="הוספת תנועה כספית">
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mb-1">סה"כ הכנסות (שולם)</p>
          <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingDown size={24} />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mb-1">סה"כ הוצאות</p>
          <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalExpenses)}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <PieIcon size={24} />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mb-1">רווח גולמי</p>
          <h3 className={`text-2xl font-black ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(grossProfit)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mb-1">צפי הכנסות (לא שולם)</p>
          <h3 className="text-2xl font-black text-slate-800">{formatCurrency(totalPlannedIncome)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">תנועות אחרונות</h3>
          <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">מסונן לפי: הכל</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-4">תאריך</th>
                <th className="px-8 py-4">תיאור</th>
                <th className="px-8 py-4">פרויקט</th>
                <th className="px-8 py-4">סוג</th>
                <th className="px-8 py-4">סטטוס</th>
                <th className="px-8 py-4">סכום</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {transactions.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">אין תנועות כספיות להצגה</td>
                  </tr>
              ) : transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-medium text-slate-500">{formatDate(t.date)}</td>
                  <td className="px-8 py-5 font-bold text-slate-800">{t.description}</td>
                  <td className="px-8 py-5 text-slate-600">{getProjectName(t.projectId)}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      t.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type === 'INCOME' ? 'הכנסה' : 'הוצאה'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                      <span className={`text-xs font-bold ${
                          t.status === 'PAID' ? 'text-green-600' : 
                          t.status === 'OVERDUE' ? 'text-red-600 animate-pulse' : 'text-slate-400'
                      }`}>
                        {getStatusLabel(t.status)}
                      </span>
                  </td>
                  <td className={`px-8 py-5 font-black text-lg ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;
