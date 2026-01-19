import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Contact } from '../../types';

interface ContactFormProps {
  onSuccess: () => void;
  initialData?: Contact;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, initialData }) => {
  const { projects, addContact, updateContact } = useData();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
    associatedProjects: [] as string[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        role: initialData.role || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        associatedProjects: initialData.associatedProjects || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      await updateContact(initialData.id, formData);
    } else {
      await addContact(formData);
    }
    onSuccess();
  };

  const toggleProject = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      associatedProjects: prev.associatedProjects.includes(projectId)
        ? prev.associatedProjects.filter(id => id !== projectId)
        : [...prev.associatedProjects, projectId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">שם מלא</label>
          <input 
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">תפקיד / חברה</label>
          <input 
            required
            placeholder="למשל: ספק דיגיטל, תורם, מנהל שטח"
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20"
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">טלפון</label>
          <input 
            type="tel"
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 text-left"
            dir="ltr"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase">אימייל</label>
          <input 
            type="email"
            required
            className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 text-left"
            dir="ltr"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase">שיוך לפרויקטים</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl custom-scrollbar">
          {projects.map(project => (
            <button
              key={project.id}
              type="button"
              onClick={() => toggleProject(project.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                formData.associatedProjects.includes(project.id)
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {project.name}
            </button>
          ))}
          {projects.length === 0 && <p className="text-[10px] text-slate-400 p-2">אין פרויקטים זמינים לשיוך</p>}
        </div>
      </div>

      <button className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
        {initialData ? 'עדכן איש קשר' : 'שמור איש קשר'}
      </button>
    </form>
  );
};

export default ContactForm;
