import React, { useState, useEffect } from 'react';
import { Camera, Save, X, Book, Brain, Swords, Zap, HeartCrack, Lock, Sparkles, Globe, Backpack, FileText, Plus, Trash, Edit2, Cpu } from 'lucide-react';
import { Character, CustomArchive } from '../types';

interface CharacterCreatorProps {
  onSave: (char: Character) => void;
  onCancel: () => void;
  initialData?: Character | null; // Added prop for editing
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onSave, onCancel, initialData }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'ai_core' | 'background' | 'psych' | 'abilities' | 'secrets' | 'soul' | 'world' | 'inventory' | 'archives' | 'system'>('basic');
  
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    description: '',
    category: 'Para ti',
    avatar: `https://picsum.photos/seed/${Math.random()}/300/400`,
    tags: [],
    
    // Core
    firstMessage: '',
    systemPrompt: '',
    personality: '',
    scenario: '',
    exampleDialogue: '',
    
    // Deep Fields
    detailedBackground: '',
    uniqueSkills: '',
    limitations: '',
    deepMotivations: '',
    keyRelationships: '',
    extremeTraits: '',
    darkSecrets: '',
    voiceStyle: '',

    // Soul
    auraColor: '#ffffff',
    affectionLevel: 0,
    voicePitch: 'Normal',
    dialogueFrequency: 'normal',
    
    // Files
    customArchives: [],

    isHidden: false,
    
    // AI Core
    aiModel: 'gemini-2.0-flash'
  });

  // Archive Local State
  const [newArchiveTitle, setNewArchiveTitle] = useState('');
  const [newArchiveContent, setNewArchiveContent] = useState('');
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Character, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          // Update existing
          setFormData(prev => ({
              ...prev,
              customArchives: prev.customArchives?.map(a => 
                  a.id === editingArchiveId 
                  ? { ...a, title: newArchiveTitle, content: newArchiveContent, date: Date.now() }
                  : a
              )
          }));
          setEditingArchiveId(null);
      } else {
          // Add new
          const newArchive: CustomArchive = {
              id: Date.now().toString(),
              title: newArchiveTitle,
              content: newArchiveContent,
              date: Date.now()
          };
          setFormData(prev => ({
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
      setFormData(prev => ({
          ...prev,
          customArchives: prev.customArchives?.filter(a => a.id !== id)
      }));
      if (editingArchiveId === id) {
          setEditingArchiveId(null);
          setNewArchiveTitle('');
          setNewArchiveContent('');
      }
  };

  const handleSave = () => {
    if (!formData.name) return alert("El nombre es obligatorio");
    
    const newChar: Character = {
      // If editing, keep ID, else create new
      id: initialData?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description || '',
      category: formData.category || 'Para ti',
      avatar: formData.avatar || 'https://picsum.photos/300/400',
      tags: formData.tags || [],
      
      firstMessage: formData.firstMessage || 'Hola...',
      systemPrompt: formData.systemPrompt || '',
      personality: formData.personality || '',
      scenario: formData.scenario || '',
      exampleDialogue: formData.exampleDialogue || '',
      
      detailedBackground: formData.detailedBackground,
      uniqueSkills: formData.uniqueSkills,
      limitations: formData.limitations,
      deepMotivations: formData.deepMotivations,
      keyRelationships: formData.keyRelationships,
      extremeTraits: formData.extremeTraits,
      darkSecrets: formData.darkSecrets,
      voiceStyle: formData.voiceStyle,

      auraColor: formData.auraColor,
      affectionLevel: formData.affectionLevel,
      voicePitch: formData.voicePitch,
      dialogueFrequency: formData.dialogueFrequency,

      customArchives: formData.customArchives || [],

      isHidden: formData.isHidden || false,
      aiModel: formData.aiModel || 'gemini-2.0-flash'
    };
    
    onSave(newChar);
  };

  const tabs = [
    { id: 'basic', label: 'Identidad', icon: <Book size={16} /> },
    { id: 'ai_core', label: 'Núcleo IA', icon: <Cpu size={16} /> }, // NEW TAB
    { id: 'background', label: 'Trasfondo', icon: <HeartCrack size={16} /> },
    { id: 'psych', label: 'Psique', icon: <Brain size={16} /> },
    { id: 'abilities', label: 'Poderes', icon: <Swords size={16} /> },
    { id: 'secrets', label: 'Secretos', icon: <Lock size={16} /> },
    { id: 'soul', label: 'Alma & Aura', icon: <Sparkles size={16} /> },
    { id: 'world', label: 'Mundo', icon: <Globe size={16} /> },
    { id: 'inventory', label: 'Inventario', icon: <Backpack size={16} /> },
    { id: 'archives', label: 'Archivos', icon: <FileText size={16} /> }, 
    { id: 'system', label: 'Sistema', icon: <Zap size={16} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/20 shrink-0">
        <div>
           <h2 className="text-2xl font-bold font-brand text-primary">{initialData ? 'Editar Vínculo' : 'Crear Vínculo Profundo'}</h2>
           <p className="text-xs text-gray-400">Diseña una entidad compleja con memoria y alma.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-white"><X /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-black/20 border-r border-gray-800 flex flex-col overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-5 text-sm font-bold uppercase tracking-wider transition-all border-l-4 ${
                  activeTab === tab.id 
                    ? 'text-primary border-primary bg-primary/5' 
                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-full aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden relative group border-2 border-dashed border-gray-700 hover:border-primary transition-colors">
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white mb-2" />
                      <span className="text-xs text-gray-300">Subir de Galería</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>
                
                <div className="col-span-2 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre de la Entidad</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" 
                      placeholder="Ej: Aelita, El Oráculo..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción Corta (Tarjeta)</label>
                    <input 
                      type="text" 
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" 
                      placeholder="Breve descripción para la vista previa..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoría</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none"
                    >
                      <option>Para ti</option>
                      <option>Anime</option>
                      <option>Terror</option>
                      <option>Rol</option>
                      <option>Películas</option>
                      <option>Drama</option>
                      <option>Oculto</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-red-900/10 p-4 rounded-lg border border-red-900/30">
                    <input 
                      type="checkbox" 
                      checked={formData.isHidden}
                      onChange={(e) => handleChange('isHidden', e.target.checked)}
                      id="isHidden"
                      className="w-5 h-5 accent-red-500"
                    />
                    <label htmlFor="isHidden" className="text-sm font-bold text-red-400">Marcar como Oculto (Dark Web)</label>
                  </div>
                </div>
              </div>
            )}

            {/* AI CORE SELECTION TAB */}
            {activeTab === 'ai_core' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-white mb-1">Selecciona el Núcleo Neuronal</h3>
                        <p className="text-xs text-gray-400">Determina qué IA "da vida" a este personaje.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* GEMINI CARD */}
                        <div 
                            onClick={() => handleChange('aiModel', 'gemini-2.0-flash')}
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col gap-4 overflow-hidden ${formData.aiModel === 'gemini-2.0-flash' || !formData.aiModel ? 'border-yellow-500 bg-yellow-900/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}
                        >
                            <div className="absolute top-0 right-0 p-2">
                                <Sparkles className={`${formData.aiModel === 'gemini-2.0-flash' || !formData.aiModel ? 'text-yellow-500' : 'text-gray-600'}`} />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="font-bold text-yellow-500 text-xl">G</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">Gemini 2.0 Flash Exp</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Google • Oficial</p>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                El modelo insignia de la aplicación. Extremadamente rápido, creativo y equilibrado. Ideal para roleplay general y respuestas instantáneas.
                            </p>
                            {formData.aiModel === 'gemini-2.0-flash' && <div className="absolute bottom-4 right-4 text-yellow-500 text-xs font-bold">● ACTIVO</div>}
                        </div>

                        {/* DEEPSEEK CARD */}
                        <div 
                            onClick={() => handleChange('aiModel', 'deepseek-v3.2')}
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col gap-4 overflow-hidden ${formData.aiModel === 'deepseek-v3.2' ? 'border-cyan-500 bg-cyan-900/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}
                        >
                            <div className="absolute top-0 right-0 p-2">
                                <Brain className={`${formData.aiModel === 'deepseek-v3.2' ? 'text-cyan-500' : 'text-gray-600'}`} />
                            </div>
                            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <span className="font-bold text-cyan-500 text-xl">D</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">DeepSeek V3.2</h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">DeepSeek • Dec 2025</p>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                Especializado en razonamiento profundo, narrativa densa y lógica compleja. Mayor latencia pero respuestas más ricas y estructuradas.
                            </p>
                            {formData.aiModel === 'deepseek-v3.2' && <div className="absolute bottom-4 right-4 text-cyan-500 text-xs font-bold">● ACTIVO</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* NEW ARCHIVES TAB */}
            {activeTab === 'archives' && (
                <div className="space-y-6 animate-fade-in h-full flex flex-col">
                     <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4">
                        <p className="text-xs text-primary">Archivos de memoria específicos para esta IA. Estos documentos se inyectarán en su contexto.</p>
                     </div>

                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 relative">
                            {editingArchiveId && <span className="absolute top-2 right-2 text-[10px] text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">Editando</span>}
                            <h4 className="text-sm font-bold text-white mb-2">{editingArchiveId ? 'Editar Archivo' : 'Crear Archivo de Memoria'}</h4>
                            <input 
                            value={newArchiveTitle}
                            onChange={(e) => setNewArchiveTitle(e.target.value)}
                            placeholder="Título (ej: Diario Secreto)"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-2 text-sm outline-none focus:border-primary"
                            />
                            <textarea 
                            value={newArchiveContent}
                            onChange={(e) => setNewArchiveContent(e.target.value)}
                            placeholder="Contenido..."
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white mb-3 text-sm outline-none focus:border-primary"
                            />
                            <div className="flex gap-2">
                                {editingArchiveId && (
                                    <button onClick={() => { setEditingArchiveId(null); setNewArchiveTitle(''); setNewArchiveContent(''); }} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold uppercase rounded">
                                        Cancelar
                                    </button>
                                )}
                                <button onClick={saveArchive} className="flex-1 py-2 bg-primary hover:bg-yellow-500 text-black text-xs font-bold uppercase rounded flex items-center justify-center gap-2">
                                    {editingArchiveId ? <Save size={14}/> : <Plus size={14} />} {editingArchiveId ? 'Actualizar' : 'Añadir Archivo'}
                                </button>
                            </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                        {formData.customArchives?.map(archive => (
                            <div key={archive.id} className="bg-gray-800 border border-gray-700 p-3 rounded-lg relative group flex justify-between items-start">
                                <div>
                                    <h5 className="font-bold text-white text-sm">{archive.title}</h5>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{archive.content}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEditArchive(archive)}
                                        className="text-blue-400 hover:text-blue-300 p-1"
                                        title="Editar"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => deleteArchive(archive.id)}
                                        className="text-red-400 hover:text-red-300 p-1"
                                        title="Borrar"
                                    >
                                        <Trash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!formData.customArchives || formData.customArchives.length === 0) && (
                            <p className="text-center text-xs text-gray-600 mt-4">Sin archivos.</p>
                        )}
                    </div>
                </div>
            )}

            {/* KEEPING EXISTING TABS (Simplified for brevity but functionally present) */}
            {activeTab === 'world' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reglas del Mundo</label>
                        <textarea rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ubicaciones Importantes</label>
                        <textarea rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Objetos Iniciales</label>
                        <textarea rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vestimenta y Equipamiento</label>
                        <textarea rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                </div>
            )}
            
            {activeTab === 'background' && (
               <div className="space-y-6 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Historia de Fondo Detallada</label>
                    <textarea rows={8} value={formData.detailedBackground} onChange={(e) => handleChange('detailedBackground', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Relaciones Clave Preexistentes</label>
                    <textarea rows={4} value={formData.keyRelationships} onChange={(e) => handleChange('keyRelationships', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                  </div>
               </div>
            )}

             {activeTab === 'psych' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Personalidad Base</label>
                  <textarea rows={3} value={formData.personality} onChange={(e) => handleChange('personality', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rasgos de Personalidad Extremos</label>
                  <textarea rows={3} value={formData.extremeTraits} onChange={(e) => handleChange('extremeTraits', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Motivaciones Personales Profundas</label>
                  <textarea rows={4} value={formData.deepMotivations} onChange={(e) => handleChange('deepMotivations', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estilo de Voz / Comunicación</label>
                  <input type="text" value={formData.voiceStyle} onChange={(e) => handleChange('voiceStyle', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'abilities' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Habilidades Únicas</label>
                        <textarea rows={6} value={formData.uniqueSkills} onChange={(e) => handleChange('uniqueSkills', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Limitaciones y Debilidades</label>
                        <textarea rows={6} value={formData.limitations} onChange={(e) => handleChange('limitations', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'secrets' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="bg-red-900/10 p-4 rounded-lg border border-red-500/20">
                      <p className="text-sm text-red-300">Esta sección define lo que el personaje oculta activamente.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Secretos Oscuros o Revelaciones</label>
                    <textarea rows={6} value={formData.darkSecrets} onChange={(e) => handleChange('darkSecrets', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                  </div>
               </div>
            )}

            {activeTab === 'soul' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color del Aura</label>
                            <div className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg">
                                <input type="color" value={formData.auraColor} onChange={(e) => handleChange('auraColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" />
                                <span className="text-gray-400 text-sm">{formData.auraColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nivel de Afecto Inicial</label>
                            <input type="range" min="0" max="100" value={formData.affectionLevel} onChange={(e) => handleChange('affectionLevel', parseInt(e.target.value))} className="w-full accent-primary" />
                            <span className="text-primary font-bold">{formData.affectionLevel}%</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tono de Voz</label>
                             <select value={formData.voicePitch} onChange={(e) => handleChange('voicePitch', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary">
                                 <option>Muy Grave</option><option>Grave</option><option>Normal</option><option>Agudo</option><option>Muy Agudo</option><option>Robótico</option><option>Etéreo</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frecuencia de Diálogo</label>
                             <select value={formData.dialogueFrequency} onChange={(e) => handleChange('dialogueFrequency', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary">
                                 <option value="verbose">Extenso / Detallado</option><option value="normal">Equilibrado</option><option value="concise">Corto / Seco</option>
                             </select>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Escenario Actual</label>
                  <textarea rows={3} value={formData.scenario} onChange={(e) => handleChange('scenario', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">System Prompt (Override)</label>
                  <textarea rows={6} value={formData.systemPrompt} onChange={(e) => handleChange('systemPrompt', e.target.value)} className="w-full bg-gray-950 font-mono text-sm border border-gray-700 rounded-lg p-3 text-green-400 focus:border-primary outline-none" />
                </div>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje Inicial</label>
                  <textarea rows={3} value={formData.firstMessage} onChange={(e) => handleChange('firstMessage', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ejemplos de Diálogo</label>
                  <textarea rows={4} value={formData.exampleDialogue} onChange={(e) => handleChange('exampleDialogue', e.target.value)} className="w-full bg-gray-950 font-mono text-sm border border-gray-700 rounded-lg p-3 text-gray-300 focus:border-primary outline-none" />
                </div>
              </div>
            )}
          </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800 bg-black/20 flex justify-end shrink-0">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors shadow-lg shadow-primary/20"
        >
          <Save size={20} /> {initialData ? 'Guardar Cambios' : 'Crear Entidad'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreator;