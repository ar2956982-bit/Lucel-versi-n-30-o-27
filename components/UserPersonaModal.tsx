import React, { useState } from 'react';
import { X, Fingerprint, User, Heart, Lock, BookOpen, Activity, FileText, Plus, Trash, Camera, Briefcase, Clock, Compass, Save, Edit2 } from 'lucide-react';
import { UserPersona, CustomArchive } from '../types';

interface UserPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: UserPersona;
  onSave: (persona: UserPersona) => void;
  t: any;
}

const UserPersonaModal: React.FC<UserPersonaModalProps> = ({ isOpen, onClose, persona, onSave, t }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState<UserPersona>(persona);
  const [newArchiveTitle, setNewArchiveTitle] = useState('');
  const [newArchiveContent, setNewArchiveContent] = useState('');
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof UserPersona, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleChange('avatar', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const saveArchive = () => {
      if (!newArchiveTitle || !newArchiveContent) return;
      
      if (editingArchiveId) {
          // Update
          setData(prev => ({
              ...prev,
              customArchives: prev.customArchives?.map(a => 
                  a.id === editingArchiveId
                  ? { ...a, title: newArchiveTitle, content: newArchiveContent, date: Date.now() }
                  : a
              )
          }));
          setEditingArchiveId(null);
      } else {
          // Add
          const newArchive: CustomArchive = {
              id: Date.now().toString(),
              title: newArchiveTitle,
              content: newArchiveContent,
              date: Date.now()
          };
          setData(prev => ({
              ...prev,
              customArchives: [...(prev.customArchives || []), newArchive]
          }));
      }
      
      setNewArchiveTitle('');
      setNewArchiveContent('');
  };

  const handleEditArchive = (archive: CustomArchive) => {
      setNewArchiveTitle(archive.title);
      setNewArchiveContent(archive.content);
      setEditingArchiveId(archive.id);
  };

  const deleteArchive = (id: string) => {
      setData(prev => ({
          ...prev,
          customArchives: prev.customArchives?.filter(a => a.id !== id)
      }));
      if (editingArchiveId === id) {
          setEditingArchiveId(null);
          setNewArchiveTitle('');
          setNewArchiveContent('');
      }
  };

  const tabs = [
    { id: 'general', icon: <User size={16} />, label: t.identity || 'Identity' },
    { id: 'appearance', icon: <Fingerprint size={16} />, label: t.appearance || 'Appearance' },
    { id: 'psych', icon: <Heart size={16} />, label: t.psych || 'Psyche' },
    { id: 'philosophy', icon: <Compass size={16} />, label: t.philosophy || 'Philosophy' }, // NEW
    { id: 'routine', icon: <Clock size={16} />, label: t.routine || 'Routine' }, // NEW
    { id: 'inventory', icon: <Briefcase size={16} />, label: t.userInventory || 'Inventory' }, // NEW
    { id: 'background', icon: <BookOpen size={16} />, label: t.background || 'History' },
    { id: 'skills', icon: <Activity size={16} />, label: t.powers || 'Skills' },
    { id: 'secrets', icon: <Lock size={16} />, label: t.secrets || 'Secrets' },
    { id: 'archives', icon: <FileText size={16} />, label: t.files || 'Files' },
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-900/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30 flex justify-between items-center bg-purple-900/20 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-brand">
            <Fingerprint className="text-purple-400" /> {t.userFile}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-56 bg-black/20 border-r border-gray-800 flex flex-col overflow-y-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors border-l-4 text-left ${
                            activeTab === tab.id 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500' 
                            : 'text-gray-400 hover:text-white border-transparent'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full border-2 border-purple-500 p-1 relative group">
                                <img src={data.avatar} className="w-full h-full rounded-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={20} className="text-white"/>
                                </div>
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nombre / Alias</label>
                                <input 
                                    value={data.name} 
                                    onChange={e => handleChange('name', e.target.value)}
                                    className="w-full bg-gray-800 border-b border-gray-700 p-2 text-white outline-none focus:border-purple-500" 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Edad</label>
                                <input 
                                    value={data.age} 
                                    onChange={e => handleChange('age', e.target.value)}
                                    className="w-full bg-gray-800 border-b border-gray-700 p-2 text-white outline-none focus:border-purple-500" 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Género</label>
                                <input 
                                    value={data.gender} 
                                    onChange={e => handleChange('gender', e.target.value)}
                                    className="w-full bg-gray-800 border-b border-gray-700 p-2 text-white outline-none focus:border-purple-500" 
                                />
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Ocupación / Clase</label>
                            <input 
                                value={data.occupation} 
                                onChange={e => handleChange('occupation', e.target.value)}
                                className="w-full bg-gray-800 border-b border-gray-700 p-2 text-white outline-none focus:border-purple-500" 
                            />
                        </div>
                    </div>
                )}
                
                {activeTab === 'appearance' && (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Descripción Física General</label>
                            <textarea value={data.appearance} onChange={e => handleChange('appearance', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-xs font-bold text-gray-500 uppercase">Altura</label><input value={data.height} onChange={e => handleChange('height', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-purple-500" /></div>
                             <div><label className="text-xs font-bold text-gray-500 uppercase">Color de Ojos</label><input value={data.eyeColor} onChange={e => handleChange('eyeColor', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-purple-500" /></div>
                        </div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Estilo de Ropa</label><input value={data.clothingStyle} onChange={e => handleChange('clothingStyle', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-purple-500" /></div>
                    </div>
                )}

                {activeTab === 'psych' && <div className="space-y-4 animate-fade-in">
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Rasgos de Personalidad</label><textarea value={data.personality} onChange={e => handleChange('personality', e.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase">Miedos / Fobias</label><textarea value={data.fears} onChange={e => handleChange('fears', e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div>
                </div>}

                {/* NEW TABS */}
                {activeTab === 'philosophy' && (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-xs text-purple-300 italic">Define tus creencias y alineación moral.</p>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Filosofía de Vida</label><textarea value={data.philosophy} onChange={e => handleChange('philosophy', e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div>
                        <div><label className="text-xs font-bold text-gray-500 uppercase">Alineación (ej: Caótico Bueno)</label><input value={data.alignment} onChange={e => handleChange('alignment', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white outline-none focus:border-purple-500" /></div>
                    </div>
                )}

                {activeTab === 'routine' && (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-xs text-purple-300 italic">¿Qué haces en un día normal? La IA recordará esto.</p>
                        <textarea value={data.dailyRoutine} onChange={e => handleChange('dailyRoutine', e.target.value)} rows={8} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" />
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-xs text-purple-300 italic">Objetos que siempre llevas contigo.</p>
                        <textarea value={data.userInventory} onChange={e => handleChange('userInventory', e.target.value)} rows={8} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" placeholder="Ej: Reloj antiguo, navaja suiza, foto familiar..." />
                    </div>
                )}

                {/* Existing Tabs */}
                 {activeTab === 'background' && <div className="space-y-4 animate-fade-in"><div><label className="text-xs font-bold text-gray-500 uppercase">Biografía Detallada</label><textarea value={data.biography} onChange={e => handleChange('biography', e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div></div>}
                 {activeTab === 'skills' && <div className="space-y-4 animate-fade-in"><div><label className="text-xs font-bold text-gray-500 uppercase">Habilidades Especiales</label><textarea value={data.skills} onChange={e => handleChange('skills', e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div></div>}
                 {activeTab === 'secrets' && <div className="space-y-4 animate-fade-in"><div><label className="text-xs font-bold text-gray-500 uppercase">Secretos Oscuros</label><textarea value={data.secrets} onChange={e => handleChange('secrets', e.target.value)} rows={6} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white outline-none focus:border-purple-500" /></div></div>}

                {activeTab === 'archives' && (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative">
                             {editingArchiveId && <span className="absolute top-2 right-2 text-[10px] text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">Editando</span>}
                             <h4 className="text-sm font-bold text-purple-300 mb-2">{editingArchiveId ? 'Editar Archivo' : 'Crear Nuevo Archivo de Memoria'}</h4>
                             <input value={newArchiveTitle} onChange={(e) => setNewArchiveTitle(e.target.value)} placeholder="Título (ej: Proyecto Zero)" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2 text-sm outline-none focus:border-purple-500" />
                             <textarea value={newArchiveContent} onChange={(e) => setNewArchiveContent(e.target.value)} placeholder="Contenido que la IA debe recordar..." rows={3} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-3 text-sm outline-none focus:border-purple-500" />
                             <div className="flex gap-2">
                                {editingArchiveId && (
                                    <button onClick={() => { setEditingArchiveId(null); setNewArchiveTitle(''); setNewArchiveContent(''); }} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold uppercase rounded">
                                        Cancelar
                                    </button>
                                )}
                                <button onClick={saveArchive} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded flex items-center justify-center gap-2">
                                    {editingArchiveId ? <Save size={14}/> : <Plus size={14} />} {editingArchiveId ? 'Actualizar' : 'Añadir al Expediente'}
                                </button>
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {data.customArchives?.map(archive => (
                                <div key={archive.id} className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-lg relative group flex justify-between items-start">
                                    <div>
                                        <h5 className="font-bold text-purple-200 text-sm">{archive.title}</h5>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{archive.content}</p>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditArchive(archive)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteArchive(archive.id)} className="text-red-400 hover:text-red-300 p-1"><Trash size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/20 shrink-0">
          <button 
            onClick={() => { onSave(data); onClose(); }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-900/40"
          >
            {t.saveFile || "GUARDAR EXPEDIENTE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPersonaModal;