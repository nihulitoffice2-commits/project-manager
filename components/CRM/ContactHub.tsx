import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Phone, Mail, User, ShieldCheck, Search, Edit2 } from 'lucide-react';
import { Contact } from '../../types';
import Modal from '../UI/Modal';
import ContactForm from '../Forms/ContactForm';

const ContactHub: React.FC = () => {
  const { contacts, projects } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'פרויקט הוסר';

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">ספר כתובות ו-CRM</h2>
          <p className="text-slate-500 font-medium">ניהול ספקים, לקוחות ואנשי קשר משויכים</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all whitespace-nowrap"
        >
          איש קשר חדש +
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="חפש לפי שם, תפקיד או טלפון..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingContact ? `עריכת איש קשר: ${editingContact.name}` : "הוספת איש קשר חדש"}
      >
        <ContactForm 
          onSuccess={handleCloseModal} 
          initialData={editingContact || undefined} 
        />
      </Modal>

      {filteredContacts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">לא נמצאו אנשי קשר התואמים לחיפוש.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <div key={contact.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-xl transition-all group relative">
              <button 
                onClick={() => handleEdit(contact)}
                className="absolute left-6 top-6 p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="ערוך איש קשר"
              >
                <Edit2 size={16} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{contact.name}</h3>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{contact.role}</p>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <a 
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-sm font-bold" dir="ltr">{contact.phone}</span>
                </a>
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                >
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm font-bold truncate" dir="ltr">{contact.email}</span>
                </a>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-3">פרויקטים משויכים</p>
                <div className="flex flex-wrap gap-2">
                  {contact.associatedProjects && contact.associatedProjects.length > 0 ? (
                    contact.associatedProjects.map(pid => (
                      <span key={pid} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black transition-all hover:bg-blue-100 cursor-default">
                        <ShieldCheck size={10} />
                        {getProjectName(pid)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold italic">אין שיוך פרויקטים</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactHub;
