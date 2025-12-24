import React, { useState, useRef, useEffect } from 'react';
import { X, Fingerprint, User, Heart, Lock, BookOpen, Activity, FileText, Camera, Briefcase, Clock, Compass, Maximize2, Minimize2, Save, Ruler, Eye, Scissors, Shirt, FolderPlus, Trash, File } from 'lucide-react';
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [data, setData] = useState<UserPersona>(persona);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [localArchives, setLocalArchives] = useState<CustomArchive[]>([]);

  useEffect(() => { 
      if (isOpen) {
          setData(persona);
          if (persona.customArchives) setLocalArchives(persona.customArchives);
      }
  }, [isOpen, persona]);

  if (!isOpen) return null;

  const handleChange = (field: keyof UserPersona, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
      onSave({ ...data, customArchives: localArchives });
      onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => handleChange('avatar', reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onloadend = () => handleChange('avatar', reader.result as string);
              reader.readAsDataURL(file);
          }
      }
  };

  const addArchive = () => {
      const newArchive: CustomArchive = {
          id: Date.now().toString(),
          title: 'Nuevo Documento',
          content: '',
          date: Date.now()
      };
      setLocalArchives([...localArchives, newArchive]);
  };

  const updateArchive = (id: string, field: 'title' | 'content', value: string) => {
      setLocalArchives(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const deleteArchive = (id: string) => {
      setLocalArchives(prev => prev.filter(a => a.id !== id));
  };

  const tabs = [
    { id: 'general', icon: <User size={14} />, label: t?.tab_identity || 'IDENTIDAD' },
    { id: 'appearance', icon: <Fingerprint size={14} />, label: t?.tab_appearance || 'APARIENCIA' },
    { id: 'psych', icon: <Heart size={14} />, label: t?.tab_psych || 'PSIQUE' },
    { id: 'philosophy', icon: <Compass size={14} />, label: t?.tab_phil || 'FILOSOFÍA' },
    { id: 'routine', icon: <Clock size={14} />, label: t?.tab_routine || 'RUTINA' },
    { id: 'inventory', icon: <Briefcase size={14} />, label: t?.tab_inv || 'INVENTARIO' },
    { id: 'background', icon: <BookOpen size={14} />, label: t?.tab_bg || 'TRASFONDO' },
    { id: 'skills', icon: <Activity size={14} />, label: t?.tab_skills || 'HABILIDADES' },
    { id: 'secrets', icon: <Lock size={14} />, label: t?.tab_secrets || 'SECRETOS' },
    { id: 'archives', icon: <FolderPlus size={14} />, label: t?.tab_files || 'ARCHIVOS' },
  ];

  return (
    <div className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 animate-fade-in">
      <div className={`bg-[#050505] border border-purple-900/40 rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${isMaximized ? 'fixed inset-0 rounded-none' : 'w-full max-w-5xl h-[90vh] relative'}`}>
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex justify-between items-center bg-purple-950/10 px-4 shrink-0">
          <div className="flex items-center gap-4">
              <h2 className="text-sm font-black text-white flex items-center gap-2 font-brand uppercase tracking-[0.2em]"><Fingerprint className="text-purple-500" size={18} /> {t?.user_file_title || 'EXPEDIENTE NEURONAL'}</h2>
              <button onClick={() => setIsMaximized(!isMaximized)} className="text-purple-400 hover:text-white transition-colors p-1">{isMaximized ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}</button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-2 transition-all"><X size={20}/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-16 md:w-52 bg-black/20 border-r border-gray-800 flex flex-col overflow-y-auto no-scrollbar py-2">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-l-2 ${activeTab === tab.id ? 'bg-purple-500/10 text-purple-300 border-purple-500' : 'text-gray-600 hover:text-gray-400 border-transparent hover:bg-white/5'}`}>
                        {tab.icon} <span className="hidden md:block">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-black/40 relative">
                
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div 
                                className="w-32 h-32 rounded-full border-2 border-purple-500/50 p-1 relative group cursor-pointer shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
                                onClick={() => avatarInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onDrop={handleAvatarDrop}
                            >
                                <img src={data.avatar} className="w-full h-full rounded-full object-cover bg-gray-900" />
                                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white"/><span className="text-[8px] font-black uppercase text-white tracking-widest mt-1">Arrastrar</span></div>
                                <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nombre Completo</label><input value={data.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none transition-all font-bold tracking-wide" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Edad / Ciclos</label><input value={data.age} onChange={e => handleChange('age', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none" /></div>
                                     <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Género / Identidad</label><input value={data.gender} onChange={e => handleChange('gender', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* ... other tabs ... */}
                {activeTab === 'appearance' && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Ruler size={12}/> Altura</label><input value={data.height} onChange={e => handleChange('height', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Eye size={12}/> Color de Ojos</label><input value={data.eyeColor} onChange={e => handleChange('eyeColor', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Scissors size={12}/> Peinado</label><input value={data.hairStyle} onChange={e => handleChange('hairStyle', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                        <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Shirt size={12}/> Estilo de Ropa</label><input value={data.clothingStyle} onChange={e => handleChange('clothingStyle', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                      </div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rasgos Distintivos / Cicatrices</label><textarea value={data.appearance} onChange={e => handleChange('appearance', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-4 text-white text-xs h-32 outline-none focus:border-purple-500" /></div>
                   </div>
                )}

                {activeTab === 'psych' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personalidad</label><textarea value={data.personality} onChange={e => handleChange('personality', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-purple-500 outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gustos (Likes)</label><textarea value={data.likes} onChange={e => handleChange('likes', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-purple-500 outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Disgustos (Dislikes)</label><textarea value={data.dislikes} onChange={e => handleChange('dislikes', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-purple-500 outline-none" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Miedos / Fobias</label><textarea value={data.fears} onChange={e => handleChange('fears', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-purple-500 outline-none" /></div>
                   </div>
                )}

                {activeTab === 'philosophy' && (
                   <div className="space-y-4 animate-fade-in">
                      <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">Filosofía de Vida / Creencias Morales</label>
                      <textarea value={data.philosophy} onChange={e => handleChange('philosophy', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-6 text-gray-300 text-sm h-96 leading-relaxed shadow-inner focus:border-purple-500 outline-none custom-scrollbar" placeholder="¿En qué cree el usuario? ¿Cuál es su código moral?" />
                   </div>
                )}

                {activeTab === 'routine' && (
                   <div className="space-y-4 animate-fade-in">
                      <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">Rutina Diaria & Hábitos</label>
                      <textarea value={data.dailyRoutine} onChange={e => handleChange('dailyRoutine', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-6 text-gray-300 text-sm h-96 leading-relaxed shadow-inner focus:border-purple-500 outline-none custom-scrollbar" placeholder="¿Qué hace normalmente durante el día?" />
                   </div>
                )}

                {activeTab === 'inventory' && (
                   <div className="space-y-4 animate-fade-in">
                      <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">Inventario Personal / Equipamiento</label>
                      <textarea value={data.userInventory} onChange={e => handleChange('userInventory', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-6 text-gray-300 text-sm h-96 leading-relaxed shadow-inner focus:border-purple-500 outline-none custom-scrollbar font-mono" placeholder="- Smartphone&#10;- Reloj&#10;- Cartera..." />
                   </div>
                )}

                {activeTab === 'background' && (
                   <div className="space-y-6 animate-fade-in">
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ocupación / Rol</label><input value={data.occupation} onChange={e => handleChange('occupation', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                      <div className="space-y-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Biografía (Historia de Vida)</label><textarea value={data.biography} onChange={e => handleChange('biography', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-4 text-white text-xs h-60 leading-relaxed custom-scrollbar" /></div>
                   </div>
                )}

                {activeTab === 'skills' && (
                   <div className="space-y-4 animate-fade-in">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Habilidades & Conocimientos</label>
                      <textarea value={data.skills} onChange={e => handleChange('skills', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-6 text-white text-sm h-80 leading-relaxed shadow-inner focus:border-purple-500 outline-none" />
                   </div>
                )}

                {activeTab === 'secrets' && (
                   <div className="space-y-6 bg-red-950/10 p-6 rounded border border-red-900/30 animate-fade-in h-full flex flex-col">
                      <label className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 border-b border-red-900/30 pb-2"><Lock size={14}/> Secretos Privados</label>
                      <textarea value={data.secrets} onChange={e => handleChange('secrets', e.target.value)} className="flex-1 w-full bg-black border border-red-900/30 rounded p-4 text-red-100 text-xs h-80 focus:border-red-500 outline-none font-mono leading-relaxed" placeholder="Cosas que la IA debería saber sobre ti, pero que nadie más sabe..." />
                   </div>
                )}

                {activeTab === 'archives' && (
                    <div className="space-y-6 animate-fade-in h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                            <div className="flex flex-col">
                                <h3 className="text-purple-400 font-bold flex items-center gap-2 uppercase tracking-widest text-xs"><FolderPlus size={14}/> Fuentes de Información</h3>
                                <span className="text-[9px] text-gray-500">Documentos permanentes (Lore, Reglas, Diarios)</span>
                            </div>
                            <button onClick={addArchive} className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-purple-600/50 flex items-center gap-2 transition-all"><FileText size={12}/> Nuevo Archivo</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {localArchives.map((arch, index) => (
                                <div key={arch.id} className="bg-[#0f172a] border border-gray-800 rounded-lg p-4 space-y-3 group hover:border-purple-600/50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 flex-1">
                                            <File size={14} className="text-gray-500 group-hover:text-purple-500 transition-colors"/>
                                            <input 
                                                value={arch.title} 
                                                onChange={(e) => updateArchive(arch.id, 'title', e.target.value)}
                                                placeholder="Título del Documento..."
                                                className="bg-transparent text-white font-bold text-xs outline-none border-b border-transparent focus:border-purple-600 w-full"
                                            />
                                        </div>
                                        <button onClick={() => deleteArchive(arch.id)} className="text-red-500/50 hover:text-red-500 p-1"><Trash size={12}/></button>
                                    </div>
                                    <textarea 
                                        value={arch.content}
                                        onChange={(e) => updateArchive(arch.id, 'content', e.target.value)}
                                        placeholder="Escribe el contenido del archivo aquí. La IA tendrá acceso permanente a esto."
                                        className="w-full bg-black/30 p-3 rounded text-gray-300 text-xs font-mono h-32 outline-none border border-gray-800 focus:border-purple-600/50 resize-none leading-relaxed"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="h-16 border-t border-gray-800 bg-black/60 flex items-center justify-end gap-4 px-6 shrink-0 backdrop-blur-md">
          <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-all">Cerrar</button>
          <button onClick={handleSave} className="px-8 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2 active:scale-95">
            <Save size={14}/> Sincronizar Expediente
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPersonaModal;