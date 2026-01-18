
import React, { useState } from 'react';
import { ProjectStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface ProjectFormProps {
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const { addProject } = useData();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: ProjectStatus.PLANNING,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    financialTarget: 0,
    projectCost: 0,
    managerName: '',
    managerPhone: '',
    managerEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProject(formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">שם הפרויקט</label>
          <input 
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">סוג פעילות</label>
          <input 
            required
            placeholder="למשל: גיוס, דיגיטל, תפעול"
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">יעד גיוס (₪)</label>
          <input 
            type="number"
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.financialTarget}
            onChange={e => setFormData({...formData, financialTarget: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">תקציב הוצאות (₪)</label>
          <input 
            type="number"
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.projectCost}
            onChange={e => setFormData({...formData, projectCost: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-50 pt-6">
        <h4 className="text-sm font-bold text-slate-700 mb-4">פרטי קשר (מנהל עמותה)</h4>
        <div className="grid grid-cols-3 gap-4">
          <input 
            placeholder="שם מלא"
            className="bg-slate-50 border-none rounded-xl p-3 text-sm"
            value={formData.managerName}
            onChange={e => setFormData({...formData, managerName: e.target.value})}
          />
          <input 
            placeholder="טלפון"
            className="bg-slate-50 border-none rounded-xl p-3 text-sm"
            value={formData.managerPhone}
            onChange={e => setFormData({...formData, managerPhone: e.target.value})}
          />
          <input 
            placeholder="אימייל"
            className="bg-slate-50 border-none rounded-xl p-3 text-sm"
            value={formData.managerEmail}
            onChange={e => setFormData({...formData, managerEmail: e.target.value})}
          />
        </div>
      </div>

      <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
        צור פרויקט חדש
      </button>
    </form>
  );
};

export default ProjectForm;
