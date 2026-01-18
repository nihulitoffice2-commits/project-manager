
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface TransactionFormProps {
  onSuccess: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { projects, addTransaction } = useData();
  const [formData, setFormData] = useState({
    projectId: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'PLANNED' as 'PLANNED' | 'INVOICE' | 'PAID' | 'OVERDUE',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId) {
        alert("נא לבחור פרויקט לשיוך התנועה");
        return;
    }
    await addTransaction(formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">סוג תנועה</label>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'INCOME' })}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                formData.type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              הכנסה
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                formData.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              הוצאה
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">שיוך לפרויקט</label>
          <select
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-700"
            value={formData.projectId}
            onChange={e => setFormData({ ...formData, projectId: e.target.value })}
          >
            <option value="">בחר פרויקט...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">סכום (₪)</label>
          <input
            type="number"
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 font-black text-lg"
            value={formData.amount || ''}
            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">סטטוס</label>
          <select
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 font-bold"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="PLANNED">מתוכנן / צפי</option>
            <option value="INVOICE">הופקה חשבונית</option>
            <option value="PAID">שולם</option>
            <option value="OVERDUE">בפיגור</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase">תיאור התנועה</label>
        <input
          required
          placeholder="למשל: תשלום מקדמה לספק דיגיטל"
          className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase">תאריך</label>
        <input
          type="date"
          required
          className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <button className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all mt-4 ${
        formData.type === 'INCOME' ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'
      }`}>
        הוסף תנועה למערכת
      </button>
    </form>
  );
};

export default TransactionForm;
