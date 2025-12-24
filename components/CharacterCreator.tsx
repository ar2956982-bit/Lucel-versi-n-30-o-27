import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, X, Book, Brain, Swords, Zap, HeartCrack, Lock, Sparkles, Globe, Backpack, FileText, Plus, Trash, Edit2, Cpu, Maximize2, Minimize2, Palette, Mic2, MessageSquare, ChevronRight, FolderPlus, File } from 'lucide-react';
import { Character, CustomArchive } from '../types';

interface CharacterCreatorProps {
  onSave: (char: Character) => void;
  onCancel: () => void;
  initialData?: Character | null;
  t: any; // Translations
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave, onCancel, initialData, t }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isMaximized, setIsMaximized] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '', description: '', category: 'Para ti', avatar: 'https://picsum.photos/300/400',
    tags: [], firstMessage: '', systemPrompt: '', personality: '', scenario: '', exampleDialogue: '',
    detailedBackground: '', uniqueSkills: '', limitations: '', deepMotivations: '', keyRelationships: '',
    extremeTraits: '', darkSecrets: '', voiceStyle: '', auraColor: '#f59e0b', affectionLevel: 50,
    voicePitch: 'Normal', dialogueFrequency: 'normal', customArchives: [], isHidden: false, aiModel: 'gemini-3-flash-preview'
  });

  const [localArchives, setLocalArchives] = useState<CustomArchive[]>([]);

  useEffect(() => { 
      if (initialData) {
          setFormData(initialData);
          if (initialData.customArchives) setLocalArchives(initialData.customArchives);
      }
  }, [initialData]);

  useEffect(() => {
    const handleFullScreenChange = () => {
        if (!document.fullscreenElement) {
            setIsMaximized(false);
        }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
      if (!isMaximized) {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
              elem.requestFullscreen().catch(err => console.log(err));
          }
          setIsMaximized(true);
      } else {
          if (document.exitFullscreen && document.fullscreenElement) {
              document.exitFullscreen().catch(err => console.log(err));
          }
          setIsMaximized(false);
      }
  };

  const handleSave = () => {
      // FIX FOR CRASH: Ensure ID always exists
      const finalId = formData.id || Date.now().toString();
      onSave({ 
          ...formData, 
          id: finalId,
          customArchives: localArchives 
      } as Character);
  };

  const handleChange = (field: keyof Character, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

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
          title: 'Nuevo Archivo',
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
    { id: 'basic', label: t?.tab_identity || 'IDENTIDAD', icon: <Book size={14} /> },
    { id: 'ai_core', label: t?.tab_aicore || 'NÚCLEO IA', icon: <Cpu size={14} /> },
    { id: 'background', label: t?.tab_history || 'HISTORIA', icon: <HeartCrack size={14} /> },
    { id: 'psych', label: t?.tab_psych || 'PSIQUE', icon: <Brain size={14} /> },
    { id: 'abilities', label: t?.tab_power || 'PODERES', icon: <Swords size={14} /> },
    { id: 'secrets', label: t?.tab_secrets || 'SECRETOS', icon: <Lock size={14} /> },
    { id: 'archives', label: t?.tab_files || 'ARCHIVOS', icon: <FolderPlus size={14} /> },
    { id: 'soul', label: t?.tab_soul || 'ALMA/AURA', icon: <Sparkles size={14} /> },
    { id: 'system', label: t?.tab_sys || 'SISTEMA', icon: <Zap size={14} /> },
  ];

  return (
    <div className={`mx-auto bg-[#020617] border border-gray-800 rounded-lg overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-[150] rounded-none' : 'max-w-6xl h-[90vh] relative'}`}>
      {/* Header */}
      <div className="h-14 border-b border-gray-800 flex justify-between items-center bg-black/60 px-4 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-primary">
               <Cpu size={18} className="animate-pulse" />
               <h2 className="text-sm font-black font-mono uppercase tracking-[0.2em]">{initialData ? (t?.edit_title || 'EDITAR_VÍNCULO') : (t?.creator_title || 'CREAR_NUEVO_VÍNCULO')} :: V26</h2>
           </div>
           <button onClick={toggleFullScreen} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-[10px] text-gray-400 hover:text-white hover:border-primary transition-all uppercase font-bold flex items-center gap-1">
             {isMaximized ? <Minimize2 size={10}/> : <Maximize2 size={10}/>} {isMaximized ? 'REDUCIR' : 'MAXIMIZAR'}
           </button>
        </div>
        <button onClick={() => { if(isMaximized) toggleFullScreen(); onCancel(); }} className="text-gray-500 hover:text-red-500 transition-colors"><X size={20}/></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
          <div className="w-16 md:w-48 bg-[#050505] border-r border-gray-800 flex flex-col overflow-y-auto shrink-0 no-scrollbar py-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-4 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-l-2 ${activeTab === tab.id ? 'text-primary border-primary bg-primary/5 shadow-[inset_10px_0_20px_rgba(245,158,11,0.05)]' : 'text-gray-600 hover:text-gray-300 border-transparent hover:bg-white/5'}`}>
                {tab.icon} <span className="hidden md:block">{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={12} className="ml-auto hidden md:block text-primary"/>}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-[#0b0d10] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                        <div 
                            className="aspect-[3/4] bg-gray-900 rounded border border-gray-700 relative group overflow-hidden cursor-pointer hover:border-primary transition-all shadow-lg" 
                            onClick={() => avatarInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handleAvatarDrop}
                        >
                            <img src={formData.avatar} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera className="text-primary mb-2" />
                                <span className="text-[9px] text-white font-black uppercase tracking-widest border border-white/20 px-2 py-1 rounded">Arrastrar o Clic</span>
                            </div>
                            <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                        <div className="mt-2 flex justify-between items-center px-1">
                            <span className="text-[9px] text-gray-500 font-mono">IMG_ID: {Math.random().toString(36).substr(2,6).toUpperCase()}</span>
                            <span className="text-[9px] text-primary font-bold uppercase">Editable</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-5">
                        {/* ... Basic Fields ... */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full"></div> {t?.label_name || 'Nombre del Vínculo'}</label>
                            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-sm focus:border-primary outline-none font-bold tracking-wide" placeholder="Escribe el nombre..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t?.label_desc || 'Descripción Corta'}</label>
                            <input type="text" value={formData.description} onChange={e => handleChange('description', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-300 text-xs focus:border-primary outline-none" placeholder="Breve descripción..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t?.label_first || 'Primer Mensaje (Hook)'}</label>
                            <textarea value={formData.firstMessage} onChange={e => handleChange('firstMessage', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-gray-300 text-xs focus:border-primary outline-none h-32 resize-none font-mono" placeholder="El mensaje inicial que enviará..." />
                        </div>
                    </div>
                </div>
              </div>
            )}
            {/* ... Other tabs ... */}
            {activeTab === 'ai_core' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Instrucción Maestra (System Prompt)</label>
                    <textarea value={formData.systemPrompt} onChange={e => handleChange('systemPrompt', e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded p-4 text-green-500 font-mono text-xs h-64 focus:border-green-500 outline-none leading-relaxed shadow-inner" placeholder="Ej: Eres una IA sarcástica del año 3050..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Matriz de Personalidad</label>
                    <textarea value={formData.personality} onChange={e => handleChange('personality', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-32 focus:border-primary outline-none" placeholder="MBTI, Temperamento, Arquetipo..." />
                 </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Biografía Detallada (Lore)</label>
                    <textarea value={formData.detailedBackground} onChange={e => handleChange('detailedBackground', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-4 text-gray-300 text-xs h-96 leading-relaxed focus:border-primary outline-none custom-scrollbar" placeholder="Historia completa, traumas pasados, origen..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Escenario Inicial</label>
                    <input type="text" value={formData.scenario} onChange={e => handleChange('scenario', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" placeholder="¿Dónde comienza la historia?" />
                 </div>
              </div>
            )}

            {activeTab === 'psych' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                 <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Motivaciones Profundas</label><textarea value={formData.deepMotivations} onChange={e => handleChange('deepMotivations', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-primary outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Relaciones Clave</label><textarea value={formData.keyRelationships} onChange={e => handleChange('keyRelationships', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-primary outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rasgos Extremos</label><textarea value={formData.extremeTraits} onChange={e => handleChange('extremeTraits', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-primary outline-none" /></div>
                 <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Limitaciones Psicológicas</label><textarea value={formData.limitations} onChange={e => handleChange('limitations', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs h-40 focus:border-primary outline-none" /></div>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Habilidades Únicas / Poderes</label>
                    <textarea value={formData.uniqueSkills} onChange={e => handleChange('uniqueSkills', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-4 text-white text-xs h-48 focus:border-primary outline-none" placeholder="Magia, Tecnología, Habilidades Físicas..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Protocolo de Diálogo (Ejemplos)</label>
                    <textarea value={formData.exampleDialogue} onChange={e => handleChange('exampleDialogue', e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded p-4 text-gray-400 font-mono text-xs h-48 focus:border-primary outline-none" placeholder="User: Hola. Character: Saludos." />
                 </div>
              </div>
            )}

            {activeTab === 'secrets' && (
               <div className="bg-red-950/20 border border-red-900/40 p-6 rounded space-y-4 animate-fade-in h-full flex flex-col">
                  <h3 className="text-red-500 font-bold flex items-center gap-2 uppercase tracking-widest text-xs border-b border-red-900/40 pb-2"><Lock size={14}/> Acceso Restringido: Secretos</h3>
                  <p className="text-[9px] text-red-400 font-mono">ADVERTENCIA: Estos datos solo serán accesibles por la IA para generar giros de trama inesperados.</p>
                  <textarea value={formData.darkSecrets} onChange={e => handleChange('darkSecrets', e.target.value)} className="flex-1 w-full bg-black border border-red-900/30 rounded p-4 text-red-200 text-xs font-mono focus:border-red-500 outline-none resize-none" placeholder="Misterios no revelados, crímenes pasados, verdaderas intenciones..." />
               </div>
            )}

            {activeTab === 'archives' && (
                <div className="space-y-6 animate-fade-in h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                        <div className="flex flex-col">
                            <h3 className="text-yellow-500 font-bold flex items-center gap-2 uppercase tracking-widest text-xs"><FolderPlus size={14}/> Fuentes de Información</h3>
                            <span className="text-[9px] text-gray-500">Documentos permanentes (Lore, Reglas, Diarios)</span>
                        </div>
                        <button onClick={addArchive} className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 px-3 py-1.5 rounded text-[10px] font-bold uppercase border border-yellow-600/50 flex items-center gap-2 transition-all"><Plus size={12}/> Nuevo Archivo</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                        {localArchives.map((arch, index) => (
                            <div key={arch.id} className="bg-[#0f172a] border border-gray-800 rounded-lg p-4 space-y-3 group hover:border-yellow-600/50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 flex-1">
                                        <File size={14} className="text-gray-500 group-hover:text-yellow-500 transition-colors"/>
                                        <input 
                                            value={arch.title} 
                                            onChange={(e) => updateArchive(arch.id, 'title', e.target.value)}
                                            placeholder="Título del Documento..."
                                            className="bg-transparent text-white font-bold text-xs outline-none border-b border-transparent focus:border-yellow-600 w-full"
                                        />
                                    </div>
                                    <button onClick={() => deleteArchive(arch.id)} className="text-red-500/50 hover:text-red-500 p-1"><Trash size={12}/></button>
                                </div>
                                <textarea 
                                    value={arch.content}
                                    onChange={(e) => updateArchive(arch.id, 'content', e.target.value)}
                                    placeholder="Escribe el contenido del archivo aquí. La IA tendrá acceso permanente a esto."
                                    className="w-full bg-black/30 p-3 rounded text-gray-300 text-xs font-mono h-32 outline-none border border-gray-800 focus:border-yellow-600/50 resize-none leading-relaxed"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'soul' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest"><Palette size={12}/> Color de Aura Neuronal</label><input type="color" value={formData.auraColor} onChange={e => handleChange('auraColor', e.target.value)} className="w-full h-10 bg-gray-900 border border-gray-700 rounded cursor-pointer" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest"><Mic2 size={12}/> Registro de Voz / Tono</label><input type="text" value={formData.voiceStyle} onChange={e => handleChange('voiceStyle', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest"><Sparkles size={12}/> Nivel de Afecto Inicial</label><div className="flex items-center gap-3"><input type="range" min="0" max="100" value={formData.affectionLevel} onChange={e => handleChange('affectionLevel', parseInt(e.target.value))} className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary" /><span className="text-xs font-mono text-primary">{formData.affectionLevel}%</span></div></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest"><MessageSquare size={12}/> Densidad de Respuesta</label><select value={formData.dialogueFrequency} onChange={e => handleChange('dialogueFrequency', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white text-xs outline-none"><option value="normal">Equilibrado</option><option value="concise">Conciso / Cortante</option><option value="verbose">Verborrágico / Detallado</option></select></div>
               </div>
            )}

            {activeTab === 'system' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="p-6 bg-[#0f172a] border border-blue-900/30 rounded">
                    <label className="text-[10px] font-black text-blue-400 uppercase block mb-3 tracking-widest">Motor de Procesamiento (LLM)</label>
                    <select value={formData.aiModel} onChange={e => handleChange('aiModel', e.target.value)} className="w-full bg-black border border-gray-800 rounded p-3 text-white text-xs font-mono">
                        <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Velocidad)</option>
                        <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Razonamiento Complejo)</option>
                        <option value="deepseek-v3.2">DeepSeek V3.2 (Rol Inmersivo)</option>
                        <option value="gemini-2.5-flash-image">Gemini 2.5 Image (Generador Visual)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0f172a] rounded border border-gray-800">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Protocolo de Ocultación</span>
                        <span className="text-[9px] text-gray-600 font-mono">Solo visible bajo autenticación de cuervo.</span>
                     </div>
                     <input type="checkbox" checked={formData.isHidden} onChange={e => handleChange('isHidden', e.target.checked)} className="w-5 h-5 accent-red-500 cursor-pointer" />
                  </div>
               </div>
            )}
          </div>
      </div>

      <div className="h-16 border-t border-gray-800 bg-black/60 flex items-center justify-end gap-4 px-6 shrink-0 backdrop-blur-md">
        <button onClick={onCancel} className="px-6 py-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abortar</button>
        <button onClick={handleSave} className="bg-primary text-black px-8 py-2 rounded font-black uppercase text-[10px] tracking-[0.2em] hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-2">
            <Save size={14}/> Guardar Vínculo
        </button>
      </div>
    </div>
  );
};

export default CharacterCreator;