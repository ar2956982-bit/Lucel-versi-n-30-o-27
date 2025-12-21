
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Trash, Copy, Eraser, RotateCcw, Pencil, Plus, Layout, X, ImageIcon, Palette, AlertTriangle, History, BookOpen, UserCheck, Bookmark, Bird, Edit3, Save } from 'lucide-react';
import { Character, Message, UserPersona, ChatSession } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { marked } from 'marked';

interface ChatInterfaceProps {
  character: Character;
  userPersona: UserPersona;
  session: ChatSession;
  onUpdateSession: (session: ChatSession | ((prev: ChatSession) => ChatSession)) => void;
  onBack: () => void;
  onRavenClick: () => void;
  t: any;
  language: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, userPersona, session, onUpdateSession, onBack, onRavenClick, t, language }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'memory' | 'facts' | 'history' | 'settings'>('memory');
  const [showRightSidebar, setShowRightSidebar] = useState(false); 
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  
  // Edición de Bloques de Memoria
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [tempBlockContent, setTempBlockContent] = useState('');

  // Edición de Mensajes (Feature Restaurada)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...session.messages, userMsg];
    
    // Actualización optimista
    onUpdateSession((prev) => ({ 
        ...prev, 
        messages: newMessages, 
        lastInteraction: Date.now() 
    }));
    
    setInput('');
    setIsTyping(true);

    // Llamada al Núcleo IA con Memoria Infinita
    const responseText = await generateChatResponse(
        newMessages, 
        input, 
        character, 
        userPersona, 
        session.extractedUserFacts || [], 
        language, 
        "", 
        session.memoryBlocks || []
    );
    
    // --- LÓGICA DE MEMORIA AUTÓNOMA (REGEX) ---
    // Extrae y ejecuta comandos [MEMORY_ADD] y [FACT_ADD] generados por la IA
    let cleanText = responseText;
    const memoryRegex = /\[MEMORY_ADD:\s*([\s\S]*?)\]/g;
    const factRegex = /\[FACT_ADD:\s*([\s\S]*?)\]/g;
    
    let match;
    const autoMemories: string[] = [];
    while ((match = memoryRegex.exec(responseText)) !== null) {
        autoMemories.push(match[1].trim());
        cleanText = cleanText.replace(match[0], ''); // Ocultar comando del chat visible
    }

    const autoFacts: string[] = [];
    while ((match = factRegex.exec(responseText)) !== null) {
        autoFacts.push(match[1].trim());
        cleanText = cleanText.replace(match[0], ''); // Ocultar comando del chat visible
    }

    cleanText = cleanText.trim();

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: cleanText, timestamp: Date.now() };
    
    onUpdateSession((prev) => ({ 
        ...prev, 
        messages: [...prev.messages, aiMsg], 
        lastInteraction: Date.now(),
        // Agregamos automáticamente las memorias detectadas por la IA
        memoryBlocks: [...(prev.memoryBlocks || []), ...autoMemories],
        extractedUserFacts: [...(prev.extractedUserFacts || []), ...autoFacts]
    }));
    
    setIsTyping(false);
  };

  const handleThemeChange = (field: string, value: any) => {
    onUpdateSession(prev => ({
        ...prev,
        theme: { ...(prev.theme || {}), [field]: value }
    }));
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => handleThemeChange('backgroundImage', reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  // Funciones del Menú de Mensajes
  const saveToFacts = (text: string) => {
      onUpdateSession(p => ({...p, extractedUserFacts: [...(p.extractedUserFacts || []), text]}));
      setActiveMessageMenu(null);
  };

  const saveToMemory = (text: string) => {
      onUpdateSession(p => ({...p, memoryBlocks: [...(p.memoryBlocks || []), text]}));
      setActiveMessageMenu(null);
  };

  const handleEditMessage = (msgId: string, newContent: string) => {
      onUpdateSession(prev => ({
          ...prev,
          messages: prev.messages.map(m => m.id === msgId ? { ...m, content: newContent } : m)
      }));
      setEditingMessageId(null);
  };

  const handleDeleteMessage = (msgId: string) => {
      onUpdateSession(prev => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== msgId)
      }));
      setActiveMessageMenu(null);
  };

  const renderMarkdown = (text: string) => { return { __html: marked.parse(text) }; };
  const chatFontSize = session.theme?.fontSize === 'small' ? 'text-xs' : session.theme?.fontSize === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className="flex h-full w-full bg-[#0f172a] relative overflow-hidden" 
        style={{ backgroundImage: session.theme?.backgroundImage ? `url(${session.theme.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      
      {session.theme?.backgroundImage && <div className="absolute inset-0 bg-black/70 z-0 backdrop-blur-[2px]"></div>}

      <div className="flex-1 flex flex-col relative h-full z-10">
        {/* Topbar */}
        <div className="h-16 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0 shadow-xl">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 p-1 hover:text-primary transition-colors"><ArrowLeft size={24} /></button>
            <img src={character.avatar} className="w-10 h-10 rounded-full object-cover border border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]" />
            <div>
              <h3 className="font-bold text-white font-brand text-sm md:text-base truncate uppercase tracking-tighter flex items-center gap-2">
                  {character.name}
                  <span className="text-[9px] bg-primary/20 text-primary px-1.5 rounded border border-primary/30">V26</span>
              </h3>
              <p className="text-[9px] text-green-400 font-black animate-pulse uppercase tracking-widest flex items-center gap-1">● MEMORIA INFINITA</p>
            </div>
          </div>
          <button onClick={() => setShowRightSidebar(true)} className="p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all shadow-lg border border-primary/20"><Layout size={20}/></button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-32" onClick={() => setActiveMessageMenu(null)}>
          {session.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group relative`}>
              <div 
                className={`max-w-[85%] md:max-w-[70%] px-5 py-3 rounded-2xl shadow-2xl relative ${chatFontSize} leading-relaxed transition-all border border-white/5 ${msg.role === 'user' ? 'text-white rounded-tr-none' : 'bg-[#1e293b]/95 text-gray-100 rounded-tl-none'}`}
                style={{ backgroundColor: msg.role === 'user' ? (session.theme?.userBubbleColor || '#f59e0b') : (session.theme?.aiBubbleColor || undefined), color: msg.role === 'user' ? (session.theme?.userBubbleColor === '#ffffff' ? 'black' : 'white') : undefined }}
              >
                {editingMessageId === msg.id ? (
                    <div className="flex flex-col gap-2 min-w-[250px]">
                        <textarea 
                            value={editMessageContent} 
                            onChange={e => setEditMessageContent(e.target.value)} 
                            className="bg-black/50 text-white p-2 rounded text-sm w-full outline-none border border-primary/50"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-xs text-red-400 font-bold hover:underline">Cancelar</button>
                            <button onClick={() => handleEditMessage(msg.id, editMessageContent)} className="text-xs text-green-400 font-bold hover:underline">Guardar</button>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-sm selection:bg-primary/30 selection:text-white" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
                )}
                
                {/* 3 DOTS MENU TRIGGER */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id); }}
                  className="absolute -right-8 top-1 bg-black/50 rounded-full p-1.5 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <MoreVertical size={14}/>
                </button>

                {/* MESSAGE CONTEXT MENU (FULL FEATURES) */}
                {activeMessageMenu === msg.id && (
                    <div className="absolute top-8 right-0 w-56 bg-[#020617] border border-gray-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] z-[60] overflow-hidden animate-fade-in text-[10px] font-black uppercase">
                        <button onClick={() => { navigator.clipboard.writeText(msg.content); setActiveMessageMenu(null); }} className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-3 transition-colors"><Copy size={14}/> Copiar Texto</button>
                        <button onClick={() => { setEditingMessageId(msg.id); setEditMessageContent(msg.content); setActiveMessageMenu(null); }} className="w-full text-left px-4 py-3 hover:bg-white/10 text-blue-400 flex items-center gap-3 transition-colors border-t border-gray-800"><Edit3 size={14}/> Editar Mensaje</button>
                        <button onClick={() => saveToFacts(msg.content)} className="w-full text-left px-4 py-3 hover:bg-purple-900/30 text-purple-400 flex items-center gap-3 border-t border-gray-800 transition-colors"><UserCheck size={14}/> Guardar Hecho</button>
                        <button onClick={() => saveToMemory(msg.content)} className="w-full text-left px-4 py-3 hover:bg-primary/20 text-primary flex items-center gap-3 border-t border-gray-800 transition-colors"><Bookmark size={14}/> Forzar Memoria</button>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="w-full text-left px-4 py-3 hover:bg-red-900/30 text-red-500 flex items-center gap-3 border-t border-gray-800 transition-colors"><Trash size={14}/> Borrar Definitivamente</button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start"><div className="bg-[#1e293b] rounded-2xl px-4 py-3 flex gap-1.5 shadow-lg border border-white/5"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/95 backdrop-blur-lg border-t border-gray-800 z-30 lg:relative lg:bg-transparent">
          <div className="flex gap-2 bg-[#1e293b] p-2 rounded-2xl border border-gray-700 max-w-5xl mx-auto shadow-2xl relative group focus-within:border-primary transition-colors">
            <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder="Escribir al núcleo..." 
                className="flex-1 bg-transparent border-none outline-none p-3 text-white text-base md:text-sm font-medium placeholder-gray-500" 
            />
            <button onClick={handleSend} className="bg-primary text-black p-4 rounded-xl active:scale-90 transition-all shadow-lg shadow-primary/20 hover:bg-yellow-400 group">
                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Derecha (Memoria y Ajustes) */}
      <div className={`fixed inset-0 bg-gray-950/98 backdrop-blur-xl z-[100] flex flex-col transition-all duration-500 ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'} md:relative md:inset-auto md:w-96 md:translate-x-0 ${showRightSidebar ? '' : 'md:hidden'} border-l border-gray-800 shadow-2xl`}>
          <div className="h-16 flex items-center justify-between p-4 border-b border-gray-800 bg-black/40 shrink-0">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={onRavenClick}>
                <Bird size={20} className="text-primary group-hover:scale-110 transition-transform animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">NÚCLEO DE MEMORIA V26</span>
              </div>
              <button onClick={() => setShowRightSidebar(false)} className="text-gray-400 p-2 bg-gray-800 rounded-full hover:bg-red-900/40 hover:text-white transition-all"><X size={24}/></button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-black/40 border-b border-gray-800 shrink-0">
            {[
              {id: 'memory', icon: <BookOpen size={14}/>, label: 'MEMORIA'},
              {id: 'facts', icon: <UserCheck size={14}/>, label: 'HECHOS'},
              {id: 'history', icon: <History size={14}/>, label: 'HISTORIAL'},
              {id: 'settings', icon: <Palette size={14}/>, label: 'ESTÉTICA'}
            ].map(tab => (
               <button key={tab.id} onClick={() => setRightSidebarTab(tab.id as any)} className={`flex-1 py-4 flex flex-col items-center gap-1 text-[8px] font-black uppercase transition-all ${rightSidebarTab === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-600 hover:text-gray-300'}`}>
                 {tab.icon} {tab.label}
               </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-32 bg-[#050505]">
              {rightSidebarTab === 'memory' && (
                  <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Bloques Contextuales (IA)</h4>
                          <button onClick={() => onUpdateSession(p => ({...p, memoryBlocks: [...(p.memoryBlocks||[]), "Nuevo recuerdo..."]}))} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all border border-primary/20"><Plus size={16}/></button>
                      </div>
                      <p className="text-[9px] text-gray-500 mb-2">Recuerdos generados automáticamente por la IA o añadidos manualmente.</p>
                      
                      {(session.memoryBlocks || []).map((block, index) => (
                          <div key={index} className="bg-[#1e293b] p-4 rounded-xl border border-gray-800 text-[11px] text-gray-300 italic group relative shadow-inner hover:border-primary/30 transition-colors">
                               {editingBlockIndex === index ? (
                                   <div className="space-y-3">
                                       <textarea value={tempBlockContent} onChange={e=>setTempBlockContent(e.target.value)} className="w-full bg-black p-3 rounded-lg text-xs text-white border border-primary/30 outline-none" rows={4}/>
                                       <div className="flex gap-2"><button onClick={() => { onUpdateSession(p=>{const n=[...p.memoryBlocks]; n[index]=tempBlockContent; return {...p, memoryBlocks:n};}); setEditingBlockIndex(null); }} className="flex-1 bg-green-600 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-green-500 text-black transition-colors">Guardar</button><button onClick={()=>setEditingBlockIndex(null)} className="flex-1 bg-gray-700 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-gray-600 transition-colors">Cancelar</button></div>
                                   </div>
                               ) : (
                                   <>
                                       <p className="line-clamp-6">{block}</p>
                                       <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1">
                                           <button onClick={() => {setEditingBlockIndex(index); setTempBlockContent(block);}} className="text-blue-400 hover:text-white p-1"><Pencil size={12}/></button>
                                           <button onClick={() => onUpdateSession(p => ({...p, memoryBlocks: p.memoryBlocks.filter((_,i)=>i!==index)}))} className="text-red-500 hover:text-white p-1"><Trash size={12}/></button>
                                       </div>
                                   </>
                               )}
                          </div>
                      ))}
                      {(!session.memoryBlocks || session.memoryBlocks.length === 0) && <p className="text-center text-[10px] text-gray-600 mt-10 uppercase font-bold tracking-widest border border-dashed border-gray-800 p-4 rounded-xl">Sin memorias registradas aún.</p>}
                  </div>
              )}

              {rightSidebarTab === 'facts' && (
                  <div className="space-y-4 animate-fade-in">
                      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Hechos del Usuario</h4>
                      <div className="space-y-2">
                        {(session.extractedUserFacts || []).map((fact, i) => (
                            <div key={i} className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl text-[10px] text-gray-300 flex justify-between items-center group shadow-md hover:border-purple-500/50 transition-colors">
                                <span className="flex-1 pr-4 font-mono">{fact}</span>
                                <button onClick={() => onUpdateSession(p => ({...p, extractedUserFacts: p.extractedUserFacts.filter((_,j)=>j!==i)}))} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-white p-1 bg-black/50 rounded"><Trash size={12}/></button>
                            </div>
                        ))}
                      </div>
                  </div>
              )}

              {rightSidebarTab === 'history' && (
                  <div className="space-y-4 animate-fade-in">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registro Completo</h4>
                      <div className="space-y-3">
                        {session.messages.length === 0 && <p className="text-[10px] text-gray-600 italic">No hay historial disponible.</p>}
                        {session.messages.map((m, i) => (
                            <div key={i} className={`text-[10px] p-3 rounded-lg border ${m.role === 'user' ? 'bg-primary/5 border-primary/20 text-gray-300' : 'bg-gray-900 border-gray-800 text-gray-400'}`}>
                                <span className={`block font-bold uppercase mb-1 ${m.role === 'user' ? 'text-primary' : 'text-gray-500'}`}>{m.role === 'user' ? userPersona.name : character.name}</span>
                                <p className="line-clamp-4 hover:line-clamp-none cursor-pointer transition-all">{m.content}</p>
                                <span className="text-[8px] text-gray-600 mt-2 block">{new Date(m.timestamp).toLocaleString()}</span>
                            </div>
                        ))}
                      </div>
                  </div>
              )}

              {rightSidebarTab === 'settings' && (
                  <div className="space-y-6 animate-fade-in">
                      <div className="space-y-5">
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estética Individual</h4>
                          
                          <div className="space-y-2">
                              <label className="text-[9px] text-gray-600 uppercase font-black">Fondo del Chat</label>
                              <label className="w-full h-24 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative shadow-inner group bg-gray-900/50">
                                  {session.theme?.backgroundImage ? <img src={session.theme.backgroundImage} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform"/> : <ImageIcon size={24} className="text-gray-700"/>}
                                  <span className="text-[10px] text-gray-500 mt-1 z-10 font-bold uppercase">Subir Imagen HD</span>
                                  <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                              </label>
                              {session.theme?.backgroundImage && <button onClick={() => handleThemeChange('backgroundImage', null)} className="text-[9px] text-red-500 w-full text-center font-black uppercase hover:text-red-400 transition-colors">Eliminar Imagen</button>}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-[9px] text-gray-600 uppercase font-black">Burbuja Tú</label>
                                  <input type="color" value={session.theme?.userBubbleColor || '#f59e0b'} onChange={e => handleThemeChange('userBubbleColor', e.target.value)} className="w-full h-10 rounded-xl bg-gray-900 border-none cursor-pointer shadow-lg" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[9px] text-gray-600 uppercase font-black">Burbuja IA</label>
                                  <input type="color" value={session.theme?.aiBubbleColor || '#1e293b'} onChange={e => handleThemeChange('aiBubbleColor', e.target.value)} className="w-full h-10 rounded-xl bg-gray-900 border-none cursor-pointer shadow-lg" />
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default ChatInterface;
