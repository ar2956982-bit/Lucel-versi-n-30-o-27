import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, ArrowLeft, MoreVertical, Trash, Copy, Eraser, RotateCcw, Pencil, Plus, Layout, X, ImageIcon, Palette, AlertTriangle, History, BookOpen, UserCheck, Bookmark, Bird, Edit3, Save, ChevronDown, ChevronUp, MessageCircle, Zap, Maximize2, Minimize2, Image, Code, FileText, Smartphone, ShieldAlert, ChevronRight, Clock, Eye, Search } from 'lucide-react';
import { Character, Message, UserPersona, ChatSession } from '../types';
import { generateChatResponse, generateImageResponse } from '../services/geminiService';
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

// --- OPTIMIZATION: MEMOIZED MESSAGE BUBBLE ---
// This prevents the entire chat history from re-rendering (and re-parsing Markdown)
// every time the user types a character in the input box.
const MemoizedMessageBubble = React.memo(({ msg, role, theme, layoutPreset, fontSize, onMenuClick, isActiveMenu, onDelete, onEdit, onCopy, onFact, onMem, onCode }: any) => {
    
    const renderMarkdown = (text: string) => { return { __html: marked.parse(text) }; };

    const getMessageBubbleClass = (role: 'user' | 'model', preset: string | undefined) => {
      const base = `max-w-[85%] md:max-w-[70%] px-5 py-3 shadow-md relative leading-relaxed transition-all border border-white/5`;
      const sizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

      if (preset === 'whatsapp') {
          return `${base} rounded-lg ${sizeClass} ${role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`;
      }
      if (preset === 'instagram') {
          return `${base} rounded-3xl px-4 py-2 ${sizeClass}`;
      }
      return `${base} rounded-2xl ${role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} ${sizeClass}`;
    };

    return (
        <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in group relative`}>
            <div 
            className={getMessageBubbleClass(role, layoutPreset)}
            style={{ 
                backgroundColor: role === 'user' ? (theme?.userBubbleColor || '#f59e0b') : (theme?.aiBubbleColor || '#1e293b'), 
                color: role === 'user' ? (theme?.userBubbleColor === '#ffffff' ? 'black' : 'white') : undefined 
            }}
            >
            {msg.attachment && (msg.attachment.type === 'image' || msg.attachment.type === 'generated_image') && (
                <img src={msg.attachment.url} className="rounded-lg mb-2 border border-white/20 max-w-full" loading="lazy" />
            )}

            <div className="prose prose-invert max-w-none prose-sm selection:bg-primary/30 selection:text-white" dangerouslySetInnerHTML={renderMarkdown(msg.content)} />
            
            <button 
                onClick={(e) => { e.stopPropagation(); onMenuClick(msg.id); }}
                className={`absolute ${role === 'user' ? '-left-8' : '-right-8'} top-1 bg-black/50 rounded-full p-1.5 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-all z-20`}
            >
                <MoreVertical size={14}/>
            </button>

            {isActiveMenu && (
                <div className={`absolute top-8 ${role === 'user' ? 'right-0' : 'left-0'} w-56 bg-[#020617] border border-gray-700 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] z-[60] overflow-hidden animate-fade-in text-[10px] font-black uppercase`}>
                    <button onClick={() => onCopy(msg.content)} className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-3 transition-colors"><Copy size={14}/> Copiar Texto</button>
                    <button onClick={() => onEdit(msg)} className="w-full text-left px-4 py-3 hover:bg-white/10 text-blue-400 flex items-center gap-3 transition-colors border-t border-gray-800"><Edit3 size={14}/> Editar Mensaje</button>
                    <button onClick={() => onFact(msg.content)} className="w-full text-left px-4 py-3 hover:bg-purple-900/30 text-purple-400 flex items-center gap-3 border-t border-gray-800 transition-colors"><UserCheck size={14}/> Guardar Hecho</button>
                    <button onClick={() => onMem(msg.content)} className="w-full text-left px-4 py-3 hover:bg-primary/20 text-primary flex items-center gap-3 border-t border-gray-800 transition-colors"><Bookmark size={14}/> Forzar Memoria</button>
                    <button onClick={() => onCode(msg.content)} className="w-full text-left px-4 py-3 hover:bg-green-900/30 text-green-400 flex items-center gap-3 border-t border-gray-800 transition-colors"><Code size={14}/> Guardar Código</button>
                    <button onClick={() => onDelete(msg.id)} className="w-full text-left px-4 py-3 hover:bg-red-900/30 text-red-500 flex items-center gap-3 border-t border-gray-800 transition-colors"><Trash size={14}/> Borrar Definitivamente</button>
                </div>
            )}
            </div>
        </div>
    );
});

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, userPersona, session, onUpdateSession, onBack, onRavenClick, t, language }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // New Accordion State for Right Sidebar
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
      'memory': true, 
      'facts': false,
      'rules': false,
      'code': false,
      'history': false,
      'settings': false
  });

  const [showRightSidebar, setShowRightSidebar] = useState(false); 
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  
  // History Search State
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Edición de Bloques de Memoria
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [tempBlockContent, setTempBlockContent] = useState('');

  // Edición de Mensajes
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Input Expansion
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTyping) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages, isTyping, isInputExpanded]);

  // --- DRAG & DROP FOR CHAT ---
  const handleChatDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          const reader = new FileReader();
          reader.onload = () => {
              if (file.type.startsWith('image/')) {
                   if (confirm("¿Quieres establecer esta imagen como FONDO del chat? (Cancelar para enviar como mensaje)")) {
                       handleThemeChange('backgroundImage', reader.result as string);
                   } else {
                       const userMsg: Message = { 
                           id: Date.now().toString(), 
                           role: 'user', 
                           content: '', 
                           timestamp: Date.now(),
                           attachment: { type: 'image', url: reader.result as string }
                       };
                       const newMessages = [...session.messages, userMsg];
                       onUpdateSession(p => ({ ...p, messages: newMessages, lastInteraction: Date.now() }));
                       processAIResponse(newMessages, "Imagen enviada");
                   }
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const processAIResponse = async (history: Message[], lastText: string) => {
      setIsTyping(true);
      const responseText = await generateChatResponse(
        history, 
        lastText, 
        character, 
        userPersona, 
        session.extractedUserFacts || [], 
        language, 
        "", 
        session.memoryBlocks || [],
        session.aiRules || [],
        session.codeSnippets || []
    );
    
    // --- LÓGICA DE MEMORIA AUTÓNOMA ---
    let cleanText = responseText;
    const memoryRegex = /\[MEMORY_ADD:\s*([\s\S]*?)\]/g;
    const factRegex = /\[FACT_ADD:\s*([\s\S]*?)\]/g;
    const codeRegex = /\[CODE_ADD:\s*([\s\S]*?)\]/g;
    
    let match;
    const autoMemories: string[] = [];
    while ((match = memoryRegex.exec(responseText)) !== null) {
        autoMemories.push(match[1].trim());
        cleanText = cleanText.replace(match[0], ''); 
    }

    const autoFacts: string[] = [];
    while ((match = factRegex.exec(responseText)) !== null) {
        autoFacts.push(match[1].trim());
        cleanText = cleanText.replace(match[0], ''); 
    }

    const autoCodes: string[] = [];
    while ((match = codeRegex.exec(responseText)) !== null) {
        autoCodes.push(match[1].trim());
        cleanText = cleanText.replace(match[0], ''); 
    }

    cleanText = cleanText.trim();

    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: cleanText, timestamp: Date.now() };
    
    onUpdateSession((prev) => ({ 
        ...prev, 
        messages: [...prev.messages, aiMsg], 
        lastInteraction: Date.now(),
        memoryBlocks: [...(prev.memoryBlocks || []), ...autoMemories],
        extractedUserFacts: [...(prev.extractedUserFacts || []), ...autoFacts],
        codeSnippets: [...(prev.codeSnippets || []), ...autoCodes]
    }));
    
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    const newMessages = [...session.messages, userMsg];
    
    onUpdateSession((prev) => ({ 
        ...prev, 
        messages: newMessages, 
        lastInteraction: Date.now() 
    }));
    
    setInput('');
    processAIResponse(newMessages, input);
  };

  const handleGenerateImage = async () => {
      const imagePrompt = window.prompt("Describe la imagen que quieres que la IA genere:");
      if (!imagePrompt) return;

      // Add user request message
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: `Genera una imagen: ${imagePrompt}`, timestamp: Date.now() };
      const newMessages = [...session.messages, userMsg];
      onUpdateSession(p => ({ ...p, messages: newMessages }));
      
      setIsTyping(true);
      // Generate using service
      const imageUrl = await generateImageResponse(imagePrompt);
      setIsTyping(false);

      if (imageUrl) {
          const aiMsg: Message = { 
              id: (Date.now() + 1).toString(), 
              role: 'model', 
              content: "Aquí tienes la imagen generada.", 
              timestamp: Date.now(),
              attachment: { type: 'generated_image', url: imageUrl }
          };
          onUpdateSession(p => ({ ...p, messages: [...p.messages, aiMsg] }));
      } else {
          alert("Error generando imagen. Inténtalo de nuevo.");
      }
      setShowAttachMenu(false);
  };

  const handleThemeChange = (field: string, value: any) => {
    onUpdateSession(prev => ({
        ...prev,
        theme: { ...(prev.theme || {}), [field]: value }
    }));
  };

  const setLayoutPreset = (preset: 'default' | 'whatsapp' | 'instagram' | 'messenger' | 'telegram') => {
      onUpdateSession(prev => ({
          ...prev,
          theme: { ...(prev.theme || {}), layoutPreset: preset }
      }));
  };

  const applyBubblePreset = (preset: 'whatsapp' | 'instagram' | 'messenger' | 'telegram') => {
      let userColor = '#f59e0b';
      let aiColor = '#1e293b';

      if (preset === 'whatsapp') { userColor = '#005c4b'; aiColor = '#202c33'; }
      if (preset === 'instagram') { userColor = '#3797f0'; aiColor = '#262626'; }
      if (preset === 'messenger') { userColor = '#a855f7'; aiColor = '#303030'; }
      if (preset === 'telegram') { userColor = '#2b5278'; aiColor = '#182533'; }

      onUpdateSession(prev => ({
          ...prev,
          theme: { 
              ...(prev.theme || {}), 
              userBubbleColor: userColor, 
              aiBubbleColor: aiColor 
          }
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
  
  const saveToCode = (text: string) => {
      onUpdateSession(p => ({...p, codeSnippets: [...(p.codeSnippets || []), text]}));
      setActiveMessageMenu(null);
  };

  const triggerEdit = (msg: Message) => {
      setEditingMessageId(msg.id);
      setEditMessageContent(msg.content);
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

  const toggleSection = (section: string) => {
      setOpenSections(prev => ({
          ...prev,
          [section]: !prev[section]
      }));
  };

  // Filter messages for History View
  const filteredHistory = session.messages.filter(m => {
      if(!historySearchTerm) return true;
      return m.content.toLowerCase().includes(historySearchTerm.toLowerCase());
  });

  // --- MEMOIZED MESSAGE LIST ---
  // We use useMemo to render the list of messages. This list will ONLY re-render if
  // session.messages, editingMessageId, or activeMessageMenu changes. 
  // It will NOT re-render when 'input' changes.
  const messageList = useMemo(() => {
      return session.messages.map((msg) => {
          if (editingMessageId === msg.id) {
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in mb-4`}>
                    <div className="flex flex-col gap-2 min-w-[250px] bg-[#1e293b] p-4 rounded-xl border border-primary/50">
                        <textarea 
                            value={editMessageContent} 
                            onChange={e => setEditMessageContent(e.target.value)} 
                            className="bg-black/50 text-white p-2 rounded text-sm w-full outline-none border border-gray-700"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMessageId(null)} className="text-xs text-red-400 font-bold hover:underline">Cancelar</button>
                            <button onClick={() => handleEditMessage(msg.id, editMessageContent)} className="text-xs text-green-400 font-bold hover:underline">Guardar</button>
                        </div>
                    </div>
                </div>
              );
          }
          return (
            <MemoizedMessageBubble 
                key={msg.id}
                msg={msg}
                role={msg.role}
                theme={session.theme}
                layoutPreset={session.theme?.layoutPreset}
                fontSize={session.theme?.fontSize}
                onMenuClick={(id: string) => setActiveMessageMenu(activeMessageMenu === id ? null : id)}
                isActiveMenu={activeMessageMenu === msg.id}
                onDelete={handleDeleteMessage}
                onEdit={triggerEdit}
                onCopy={(txt: string) => { navigator.clipboard.writeText(txt); setActiveMessageMenu(null); }}
                onFact={saveToFacts}
                onMem={saveToMemory}
                onCode={saveToCode}
            />
          );
      });
  }, [session.messages, activeMessageMenu, editingMessageId, editMessageContent, session.theme]);


  return (
    <div 
        className="flex h-full w-full bg-[#0f172a] relative overflow-hidden" 
        style={{ backgroundImage: session.theme?.backgroundImage ? `url(${session.theme.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
        onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
        onDrop={handleChatDrop}
    >
      
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
              <p className="text-[9px] text-green-400 font-black animate-pulse uppercase tracking-widest flex items-center gap-1">● {t.status_online}</p>
            </div>
          </div>
          <button onClick={() => setShowRightSidebar(true)} className="p-2 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-all shadow-lg border border-primary/20"><Layout size={20}/></button>
        </div>

        {/* Messages Area - USING MEMOIZED LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-32" onClick={() => setActiveMessageMenu(null)}>
          {messageList}
          {isTyping && (
             <div className="flex justify-start"><div className="bg-[#1e293b] rounded-2xl px-4 py-3 flex gap-1.5 shadow-lg border border-white/5"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f172a]/95 backdrop-blur-lg border-t border-gray-800 z-30 lg:relative lg:bg-transparent">
          <div className={`flex gap-2 bg-[#1e293b] p-3 rounded-2xl border border-gray-700 max-w-5xl mx-auto shadow-2xl relative group focus-within:border-primary transition-all items-end ${isInputExpanded ? 'h-72' : 'h-auto'}`}>
             
             {/* Attachment Menu */}
             <div className="relative">
                 <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-2.5 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl mb-0.5 transition-colors shadow-md border border-gray-700">
                     <Plus size={18} className={showAttachMenu ? "rotate-45 transition-transform" : "transition-transform"} />
                 </button>
                 {showAttachMenu && (
                     <div className="absolute bottom-12 left-0 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                         <button onClick={handleGenerateImage} className="w-full text-left px-4 py-3 hover:bg-white/10 text-white flex items-center gap-2 text-xs font-bold uppercase"><ImageIcon size={14}/> Generar Imagen IA</button>
                     </div>
                 )}
             </div>

            <button onClick={() => setIsInputExpanded(!isInputExpanded)} className="p-2.5 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl mb-0.5 transition-colors shadow-md border border-gray-700">
                {isInputExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Escribe tu mensaje..." 
                className={`flex-1 bg-transparent border-none outline-none px-3 py-2 text-white text-base md:text-sm font-medium placeholder-gray-500 resize-none custom-scrollbar transition-all ${isInputExpanded ? 'h-full' : 'h-12'}`}
            />
            
            <button onClick={handleSend} className="bg-primary text-black p-4 rounded-xl active:scale-90 transition-all shadow-lg shadow-primary/20 hover:bg-yellow-400 group mb-0.5">
                <Send size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - ACCORDION LAYOUT (SAME AS BEFORE) */}
      <div className={`fixed inset-0 bg-gray-950/98 backdrop-blur-xl z-[100] flex flex-col transition-all duration-500 ${showRightSidebar ? 'translate-x-0' : 'translate-x-full'} md:relative md:inset-auto md:w-96 md:translate-x-0 ${showRightSidebar ? '' : 'md:hidden'} border-l border-gray-800 shadow-2xl overflow-hidden`}>
          <div className="h-16 flex items-center justify-between p-4 border-b border-gray-800 bg-black/40 shrink-0">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={onRavenClick}>
                <Bird size={20} className="text-primary group-hover:scale-110 transition-transform animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">NÚCLEO V26</span>
              </div>
              <button onClick={() => setShowRightSidebar(false)} className="text-gray-400 p-2 bg-gray-800 rounded-full hover:bg-red-900/40 hover:text-white transition-all"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#050505]">
              
              {/* 1. MEMORY CORE */}
              <div className="border-b border-gray-900">
                  <button onClick={() => toggleSection('memory')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-primary flex items-center gap-2"><BookOpen size={12}/> {t.chat_memory}</span>
                      {openSections['memory'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['memory'] && (
                      <div className="p-4 pt-0 space-y-4 animate-fade-in">
                          <button onClick={() => onUpdateSession(p => ({...p, memoryBlocks: [...(p.memoryBlocks||[]), "Nuevo recuerdo..."]}))} className="w-full py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all border border-primary/20 text-[10px] font-bold uppercase flex items-center justify-center gap-2"><Plus size={12}/> Añadir Bloque</button>
                          {(session.memoryBlocks || []).map((block, index) => (
                              <div key={index} className="bg-[#1e293b] p-3 rounded-lg border border-gray-800 text-[11px] text-gray-300 italic group relative shadow-inner">
                                   {editingBlockIndex === index ? (
                                       <div className="space-y-2">
                                           <textarea value={tempBlockContent} onChange={e=>setTempBlockContent(e.target.value)} className="w-full bg-black p-2 rounded text-xs text-white border border-primary/30 outline-none" rows={3}/>
                                           <div className="flex gap-2"><button onClick={() => { onUpdateSession(p=>{const n=[...p.memoryBlocks]; n[index]=tempBlockContent; return {...p, memoryBlocks:n};}); setEditingBlockIndex(null); }} className="flex-1 bg-green-600 py-1 rounded text-[9px] text-black font-bold uppercase">Guardar</button></div>
                                       </div>
                                   ) : (
                                       <>
                                           <p className="line-clamp-6">{block}</p>
                                           <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1">
                                               <button onClick={() => {setEditingBlockIndex(index); setTempBlockContent(block);}} className="text-blue-400 hover:text-white"><Pencil size={10}/></button>
                                               <button onClick={() => onUpdateSession(p => ({...p, memoryBlocks: p.memoryBlocks.filter((_,i)=>i!==index)}))} className="text-red-500 hover:text-white"><Trash size={10}/></button>
                                           </div>
                                       </>
                                   )}
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* 2. FACTS */}
              <div className="border-b border-gray-900">
                  <button onClick={() => toggleSection('facts')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-purple-400 flex items-center gap-2"><UserCheck size={12}/> Hechos del Usuario</span>
                      {openSections['facts'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['facts'] && (
                      <div className="p-4 pt-0 space-y-2 animate-fade-in">
                          {(session.extractedUserFacts || []).map((fact, index) => (
                              <div key={index} className="bg-purple-900/10 p-2 rounded border border-purple-900/30 text-[10px] text-purple-200 flex justify-between group">
                                  <span>{fact}</span>
                                  <button onClick={() => onUpdateSession(p => ({...p, extractedUserFacts: p.extractedUserFacts.filter((_,i)=>i!==index)}))} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash size={10}/></button>
                              </div>
                          ))}
                          {(session.extractedUserFacts || []).length === 0 && <p className="text-[10px] text-gray-600 italic">No hay hechos guardados.</p>}
                      </div>
                  )}
              </div>

              {/* 3. RULES */}
              <div className="border-b border-gray-900">
                  <button onClick={() => toggleSection('rules')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-red-500 flex items-center gap-2"><ShieldAlert size={12}/> Reglas Absolutas</span>
                      {openSections['rules'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['rules'] && (
                      <div className="p-4 pt-0 space-y-3 animate-fade-in">
                          <button onClick={() => onUpdateSession(p => ({...p, aiRules: [...(p.aiRules||[]), "Nueva regla..."]}))} className="w-full py-2 bg-red-900/20 text-red-500 rounded border border-red-900/30 text-[10px] font-bold uppercase flex items-center justify-center gap-2"><Plus size={12}/> Nueva Regla</button>
                          {(session.aiRules || []).map((rule, i) => (
                               <div key={i} className="bg-red-950/10 p-2 rounded border border-red-900/30 text-[10px] text-red-200 group relative">
                                   <textarea value={rule} onChange={(e) => { const newRules = [...(session.aiRules || [])]; newRules[i] = e.target.value; onUpdateSession(p => ({...p, aiRules: newRules})); }} className="w-full bg-transparent outline-none resize-none"/>
                                   <button onClick={() => onUpdateSession(p => ({...p, aiRules: p.aiRules?.filter((_,idx)=>idx!==i)}))} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100"><Trash size={10}/></button>
                               </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* 4. CODE */}
              <div className="border-b border-gray-900">
                  <button onClick={() => toggleSection('code')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-2"><Code size={12}/> Banco de Código</span>
                      {openSections['code'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['code'] && (
                      <div className="p-4 pt-0 space-y-3 animate-fade-in">
                          <button onClick={() => onUpdateSession(p => ({...p, codeSnippets: [...(p.codeSnippets||[]), "// Nuevo snippet"]}))} className="w-full py-2 bg-green-900/20 text-green-500 rounded border border-green-900/30 text-[10px] font-bold uppercase flex items-center justify-center gap-2"><Plus size={12}/> Nuevo Snippet</button>
                          {(session.codeSnippets || []).map((code, i) => (
                               <div key={i} className="bg-black p-2 rounded border border-gray-800 group relative font-mono text-[9px] text-green-400">
                                   <textarea value={code} onChange={(e) => { const newCode = [...(session.codeSnippets || [])]; newCode[i] = e.target.value; onUpdateSession(p => ({...p, codeSnippets: newCode})); }} className="w-full bg-transparent outline-none resize-y h-20"/>
                                   <div className="flex gap-2 justify-end mt-1 opacity-0 group-hover:opacity-100">
                                       <button onClick={() => navigator.clipboard.writeText(code)} className="text-blue-400"><Copy size={10}/></button>
                                       <button onClick={() => onUpdateSession(p => ({...p, codeSnippets: p.codeSnippets?.filter((_,idx)=>idx!==i)}))} className="text-red-500"><Trash size={10}/></button>
                                   </div>
                               </div>
                          ))}
                      </div>
                  )}
              </div>
              
              {/* 5. HISTORY */}
              <div className="border-b border-gray-900">
                  <button onClick={() => toggleSection('history')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Clock size={12}/> Historial & Logs</span>
                      {openSections['history'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['history'] && (
                      <div className="p-4 pt-0 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between text-[10px] text-gray-500">
                              <span>Mensajes Totales: <span className="text-white font-bold">{session.messages.length}</span></span>
                          </div>
                          
                          <div className="flex items-center gap-2 bg-gray-900 p-2 rounded border border-gray-800 focus-within:border-primary/50 transition-colors">
                                <Search size={12} className="text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar en el historial..." 
                                    className="bg-transparent text-[10px] text-white outline-none w-full"
                                    value={historySearchTerm}
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                />
                                {historySearchTerm && <button onClick={() => setHistorySearchTerm('')}><X size={10} className="text-gray-500 hover:text-white"/></button>}
                          </div>

                          <div className="bg-gray-900 p-2 rounded max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                              {filteredHistory.length > 0 ? filteredHistory.map(m => (
                                  <div key={m.id} className="text-[9px] border-b border-gray-800 pb-1 mb-1 last:border-0 text-gray-400 hover:bg-white/5 p-1 rounded cursor-pointer transition-colors flex flex-col gap-1">
                                      <div className="flex justify-between items-center">
                                         <span className={`font-bold uppercase ${m.role === 'user' ? 'text-primary' : 'text-blue-400'}`}>{m.role === 'user' ? 'Tú' : 'IA'}</span>
                                         <span className="text-gray-600 text-[8px]">{new Date(m.timestamp).toLocaleDateString()}</span>
                                      </div>
                                      <span className="line-clamp-2">{m.content}</span>
                                  </div>
                              )) : (
                                  <div className="text-[9px] text-gray-500 text-center py-4 italic">No se encontraron mensajes.</div>
                              )}
                          </div>
                      </div>
                  )}
              </div>

              {/* 6. SETTINGS */}
              <div>
                  <button onClick={() => toggleSection('settings')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2"><Palette size={12}/> Estética del Chat</span>
                      {openSections['settings'] ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </button>
                  {openSections['settings'] && (
                      <div className="p-4 pt-0 space-y-4 animate-fade-in">
                          <div className="space-y-2">
                              <label className="text-[9px] text-gray-600 uppercase font-black">Estilo (Layout)</label>
                              <div className="grid grid-cols-3 gap-2">
                                  <button onClick={() => setLayoutPreset('default')} className={`h-6 rounded text-[8px] font-bold border ${!session.theme?.layoutPreset || session.theme?.layoutPreset === 'default' ? 'bg-primary text-black border-primary' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>DEFAULT</button>
                                  <button onClick={() => setLayoutPreset('whatsapp')} className={`h-6 rounded text-[8px] font-bold border ${session.theme?.layoutPreset === 'whatsapp' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>WA</button>
                                  <button onClick={() => setLayoutPreset('instagram')} className={`h-6 rounded text-[8px] font-bold border ${session.theme?.layoutPreset === 'instagram' ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>IG</button>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[9px] text-gray-600 uppercase font-black">Colores</label>
                              <div className="grid grid-cols-4 gap-2">
                                  <button onClick={() => applyBubblePreset('whatsapp')} className="bg-[#005c4b] h-6 rounded flex items-center justify-center text-[7px] font-bold text-white">WA</button>
                                  <button onClick={() => applyBubblePreset('instagram')} className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 h-6 rounded flex items-center justify-center text-[7px] font-bold text-white">IG</button>
                                  <button onClick={() => applyBubblePreset('messenger')} className="bg-[#a855f7] h-6 rounded flex items-center justify-center text-[7px] font-bold text-white">MS</button>
                                  <button onClick={() => applyBubblePreset('telegram')} className="bg-[#229ED9] h-6 rounded flex items-center justify-center text-[7px] font-bold text-white">TG</button>
                              </div>
                          </div>
                          
                          <label className="w-full h-16 border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all bg-gray-900/50 relative overflow-hidden">
                              {session.theme?.backgroundImage ? <img src={session.theme.backgroundImage} className="absolute inset-0 w-full h-full object-cover opacity-50"/> : <ImageIcon size={16} className="text-gray-600"/>}
                              <span className="text-[8px] text-gray-500 mt-1 relative z-10 font-bold uppercase">Fondo</span>
                              <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                          </label>
                      </div>
                  )}
              </div>

          </div>
      </div>
    </div>
  );
};

export default ChatInterface;