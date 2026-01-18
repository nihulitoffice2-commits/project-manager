
import React, { useState } from 'react';
import { TaskPriority, TaskStatus } from '../../types';
import { useData } from '../../context/DataContext';

interface TaskFormProps {
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSuccess }) => {
  // Fix: Destructure addTask directly from useData context and remove invalid string destructuring
  const { projects, addTask } = useData();
  
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    phase: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: new Date().toISOString().split('T')[0],
    isRedFlag: false,
    redFlagReason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Call addTask from the context
    await addTask(formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase">שיוך לפרויקט</label>
        <select 
          required
          className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
          value={formData.projectId}
          onChange={e => setFormData({...formData, projectId: e.target.value})}
        >
          <option value="">בחר פרויקט...</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase">כותרת המשימה</label>
        <input 
          required
          className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
          value={formData.title}
          onChange={e => setFormData({...formData, title: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">עדיפות</label>
          <select 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.priority}
            onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
          >
            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">תאריך יעד</label>
          <input 
            type="date"
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
        <input 
          type="checkbox" 
          id="redflag"
          className="w-5 h-5 rounded-lg border-red-300 text-red-600 focus:ring-red-500"
          checked={formData.isRedFlag}
          onChange={e => setFormData({...formData, isRedFlag: e.target.checked})}
        />
        <label htmlFor="redflag" className="text-sm font-bold text-red-800">האם יש דגל אדום / בעיה קריטית? (🚩)</label>
      </div>

      {formData.isRedFlag && (
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">סיבת הדגל האדום</label>
          <textarea 
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 h-24"
            placeholder="למה המשימה הזו תקועה?"
            value={formData.redFlagReason}
            onChange={e => setFormData({...formData, redFlagReason: e.target.value})}
          />
        </div>
      )}

      <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
        צור משימה חדשה
      </button>
    </form>
  );
};

export default TaskForm;
