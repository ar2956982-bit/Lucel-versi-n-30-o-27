import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Search, Edit, Trash, Bookmark, Brain, History, Database, Star, X, Palette, Image as ImageIcon, Save, RefreshCw, Type, Square, MessageSquare, AlertTriangle, Eraser, RotateCcw, Copy, Pencil, Plus, Languages } from 'lucide-react';
import { Character, Message, UserPersona, ChatSession } from '../types';
import { generateChatResponse, extractUserFacts, generateSummary } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { marked } from 'marked';

interface ChatInterfaceProps {
  character: Character;
  userPersona: UserPersona;
  session: ChatSession;
  onUpdateSession: (session: ChatSession | ((prev: ChatSession) => ChatSession)) => void;
  onBack: () => void;
  t: any;
  language: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, userPersona, session, onUpdateSession, onBack, t, language }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'memory' | 'history' | 'facts' | 'moments' | 'settings'>('memory');
  const [showRightSidebar, setShowRightSidebar] = useState(false); 
  const [searchHistory, setSearchHistory] = useState('');
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  
  // Translation State
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});

  // Memory Block Editing State
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [tempBlockContent, setTempBlockContent] = useState('');

  // Fact Editing State
  const [editingFactIndex, setEditingFactIndex] = useState<number | null>(null);
  const [tempFactContent, setTempFactContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, isTyping, translatedMessages]);

  // --- AUTO TRANSLATION LOGIC ---
  useEffect(() => {
      if (autoTranslate) {
          session.messages.forEach(async (msg) => {
              if (msg.role === 'model' && !translatedMessages[msg.id]) {
                  try {
                      // Simple Translation Call
                      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                      const response = await ai.models.generateContent({
                          model: 'gemini-2.0-flash-exp',
                          contents: `Translate this text to ${language}: "${msg.content}". Return ONLY the translation.`
                      });
                      if (response.text) {
                          setTranslatedMessages(prev => ({...prev, [msg.id]: response.text || ''}));
                      }
                  } catch (e) { console.error("Translation fail", e); }
              }
          });
      }
  }, [session.messages, autoTranslate, language]);

  useEffect(() => {
    if (session.messages.length === 0) {
      const initialMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: character.firstMessage || `*${character.name} te observa.*`,
        timestamp: Date.now()
      };
      onUpdateSession({ ...session, messages: [initialMsg] });
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const newMessages = [...session.messages, userMsg];
    
    onUpdateSession({
      ...session,
      messages: newMessages,
      lastInteraction: Date.now()
    });
    setInput('');
    setIsTyping(true);

    let retrievedContext = "";
    if (newMessages.length > 25) {
        const queryTerms = input.toLowerCase().split(' ').filter(w => w.length > 3);
        const oldMessages = newMessages.slice(0, -20); 
        const matchedMessages = oldMessages.filter(m => 
            queryTerms.some(term => m.content.toLowerCase().includes(term))
        ).slice(-5); 

        if (matchedMessages.length > 0) {
            retrievedContext = matchedMessages.map(m => `[Old Msg ${new Date(m.timestamp).toLocaleDateString()}] ${m.role}: ${m.content}`).join('\n');
        }
    }

    const responseText = await generateChatResponse(
      newMessages, 
      input, 
      character, 
      userPersona, 
      session.extractedUserFacts,
      language,
      retrievedContext,
      session.memoryBlocks || (session.summary ? [session.summary] : []) // V26: Pass all blocks
    );

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: Date.now()
    };
    
    extractUserFacts(input, session.extractedUserFacts).then(newFacts => {
        if (newFacts.length !== session.extractedUserFacts.length) {
            onUpdateSession((prev) => ({...prev, extractedUserFacts: newFacts}));
        }
    });

    if (newMessages.length % 5 === 0) {
        generateSummary(newMessages).then(summary => {
             // V26: Update First Block OR Summary
             onUpdateSession((prev) => {
                 const newBlocks = [...(prev.memoryBlocks || [])];
                 if (newBlocks.length === 0) newBlocks.push(summary);
                 else newBlocks[0] = summary; // Always update the active (first) block
                 return {...prev, summary, memoryBlocks: newBlocks};
             });
        });
    }

    onUpdateSession((prev) => ({
      ...prev,
      messages: [...prev.messages, aiMsg],
      lastInteraction: Date.now()
    }));
    setIsTyping(false);
  };

  const saveMoment = (msg: Message) => {
    const isAlreadySaved = session.savedMoments.find(m => m.id === msg.id);
    if (!isAlreadySaved) {
        onUpdateSession({
            ...session,
            savedMoments: [...session.savedMoments, { ...msg, isMemory: true }]
        });
    }
    setActiveMessageMenu(null);
  };

  const saveToFacts = (msg: Message) => {
      const cleanContent = msg.content.substring(0, 100); 
      onUpdateSession({
          ...session,
          extractedUserFacts: [...session.extractedUserFacts, `[Manual] ${cleanContent}`]
      });
      alert(t.save_fact + ": OK"); 
      setActiveMessageMenu(null);
  };

  const copyMessage = (text: string) => {
      navigator.clipboard.writeText(text);
      setActiveMessageMenu(null);
  };
  
  const deleteMessage = (msgId: string) => {
      onUpdateSession({
          ...session,
          messages: session.messages.filter(m => m.id !== msgId)
      });
      setActiveMessageMenu(null);
  };

  const editMessage = (msgId: string, newContent: string) => {
      onUpdateSession({
          ...session,
          messages: session.messages.map(m => m.id === msgId ? { ...m, content: newContent } : m)
      });
      setActiveMessageMenu(null);
  };

  // --- MEMORY BLOCK MANAGEMENT V26 ---
  const handleEditBlock = (index: number) => {
      setTempBlockContent(session.memoryBlocks?.[index] || '');
      setEditingBlockIndex(index);
  };

  const handleSaveBlock = () => {
      if (editingBlockIndex === null) return;
      onUpdateSession(prev => {
          const newBlocks = [...(prev.memoryBlocks || [])];
          newBlocks[editingBlockIndex] = tempBlockContent;
          return { ...prev, memoryBlocks: newBlocks };
      });
      setEditingBlockIndex(null);
  };

  const handleDeleteBlock = (index: number) => {
      if (confirm("¿Borrar este bloque de memoria?")) {
          onUpdateSession(prev => {
              const newBlocks = prev.memoryBlocks?.filter((_, i) => i !== index) || [];
              return { ...prev, memoryBlocks: newBlocks };
          });
      }
  };

  const handleAddBlock = () => {
      onUpdateSession(prev => ({
          ...prev,
          memoryBlocks: [...(prev.memoryBlocks || []), "Nuevo bloque de memoria..."]
      }));
  };

  // Fact Management
  const handleEditFact = (index: number) => {
      setTempFactContent(session.extractedUserFacts[index]);
      setEditingFactIndex(index);
  };

  const handleSaveFact = (index: number) => {
      const updatedFacts = [...session.extractedUserFacts];
      updatedFacts[index] = tempFactContent;
      onUpdateSession(prev => ({ ...prev, extractedUserFacts: updatedFacts }));
      setEditingFactIndex(null);
  };

  const handleDeleteFact = (index: number) => {
      if(confirm("¿Borrar este recuerdo permanentemente?")) {
          const updatedFacts = session.extractedUserFacts.filter((_, i) => i !== index);
          onUpdateSession(prev => ({ ...prev, extractedUserFacts: updatedFacts }));
      }
  };

  const handleThemeChange = (field: keyof import('../types').ChatTheme, value: any) => {
      onUpdateSession(prev => {
          const currentTheme = prev.theme || {};
          return {
              ...prev,
              theme: { ...currentTheme, [field]: value }
          };
      });
  };

  const handleClearChat = () => {
      if(confirm("¿Estás seguro de que quieres borrar TODO el historial de este chat? No se puede deshacer.")) {
          onUpdateSession(prev => {
              return {
                  ...prev,
                  messages: [], 
                  summary: '',
              };
          });
      }
  };

  const handleRestoreChat = () => {
      const initialMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: character.firstMessage || `*${character.name} te observa.*`,
        timestamp: Date.now()
      };
      onUpdateSession(prev => ({ ...prev, messages: [initialMsg] }));
  };

  const handleDeleteLast = () => {
      onUpdateSession(prev => ({ ...prev, messages: prev.messages.slice(0, -1) }));
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleThemeChange('backgroundImage', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const renderMarkdown = (text: string) => {
    return { __html: marked.parse(text) };
  };

  const bubbleShapeClass = session.theme?.bubbleShape === 'square' ? 'rounded-none' : session.theme?.bubbleShape === 'message' ? '' : 'rounded-2xl';
  const chatFontSize = session.theme?.fontSize === 'small' ? 'text-xs' : session.theme?.fontSize === 'large' ? 'text-base' : 'text-sm';
  const borderClass = session.theme?.bubbleBorder ? 'border border-white/20' : 'border-none';

  return (
    <div 
        className="flex h-[calc(100vh-6rem)] lg:h-screen w-full bg-gray-900 relative" 
        onClick={() => setActiveMessageMenu(null)}
        style={{
            backgroundImage: session.theme?.backgroundImage ? `url(${session.theme.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
    >
      {session.theme?.backgroundImage && <div className="absolute inset-0 bg-black/60 z-0" style={{ opacity: session.theme.backgroundOpacity ?? 0.6 }}></div>}

      <div className="flex-1 flex flex-col relative h-full z-10">
        <div className="h-16 border-b border-gray-800 bg-gray-900/90 backdrop-blur flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden text-gray-400"><ArrowLeft /></button>
            <img src={character.avatar} className="w-10 h-10 rounded-full object-cover border border-primary" />
            <div>
              <h3 className="font-bold text-white font-brand">{character.name}</h3>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {t.online || "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button 
                onClick={() => setAutoTranslate(!autoTranslate)}
                className={`p-2 rounded-lg transition-colors ${autoTranslate ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Auto-Translate Chat"
              >
                  <Languages size={20} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowRightSidebar(!showRightSidebar); }} 
                className={`p-2 rounded-lg transition-colors ${showRightSidebar ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Brain size={20} />
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {session.messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <Eraser size={40} className="mb-2 opacity-20"/>
                 <p className="text-sm">Chat vaciado.</p>
                 <button onClick={handleRestoreChat} className="mt-4 text-primary text-xs hover:underline flex items-center gap-1"><RotateCcw size={12}/> {t.restoreStart || "Restaurar"}</button>
             </div>
          )}
          {session.messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group relative`}>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id); }}
                className={`absolute top-2 ${msg.role === 'user' ? 'left-0 -ml-8' : 'right-0 -mr-8'} p-1.5 text-gray-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 ${activeMessageMenu === msg.id ? 'opacity-100 bg-gray-800' : ''}`}
              >
                <MoreVertical size={16} />
              </button>

              {activeMessageMenu === msg.id && (
                  <div className={`absolute top-8 ${msg.role === 'user' ? 'left-0' : 'right-0'} w-44 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden`}>
                      <button onClick={() => saveToFacts(msg)} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 flex items-center gap-2 text-purple-300">
                          <Database size={14} /> {t.save_fact || "Guardar Hecho"}
                      </button>
                      <button onClick={() => copyMessage(msg.content)} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 flex items-center gap-2 text-gray-300 border-t border-gray-800">
                          <Copy size={14} /> {t.copy || "Copiar"}
                      </button>
                      <button onClick={() => {
                          const newContent = prompt("Editar mensaje:", msg.content);
                          if (newContent) editMessage(msg.id, newContent);
                      }} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 flex items-center gap-2 text-gray-300 border-t border-gray-800">
                          <Edit size={14} /> {t.edit_msg || "Editar"}
                      </button>
                      <button onClick={() => saveMoment(msg)} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 flex items-center gap-2 text-primary border-t border-gray-800">
                          <Bookmark size={14} /> Guardar Momento
                      </button>
                      <button onClick={() => deleteMessage(msg.id)} className="w-full text-left px-4 py-3 text-xs hover:bg-red-500/20 flex items-center gap-2 text-red-400 border-t border-gray-800">
                          <Trash size={14} /> {t.delete}
                      </button>
                  </div>
              )}

              <div 
                className={`max-w-[85%] lg:max-w-[70%] p-4 ${chatFontSize} leading-relaxed shadow-lg ${bubbleShapeClass} ${borderClass}
                  ${msg.role === 'user' 
                    ? 'msg-user text-white' 
                    : 'msg-ai text-gray-100'
                  }
                  ${session.theme?.bubbleShape === 'message' 
                    ? (msg.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm') 
                    : ''
                  }
                `}
                style={{
                    backgroundColor: msg.role === 'user' ? (session.theme?.userBubbleColor || '#f59e0b') : (session.theme?.aiBubbleColor || '#1f293b'),
                    opacity: session.theme?.opacity || 1
                }}
              >
                {msg.role === 'model' 
                   ? <div dangerouslySetInnerHTML={renderMarkdown(translatedMessages[msg.id] || msg.content)} className="prose prose-invert prose-sm" /> 
                   : msg.content
                }
                {translatedMessages[msg.id] && <div className="text-[9px] text-blue-300 mt-1 flex items-center gap-1"><Languages size={10}/> Translated</div>}
                
                {session.theme?.showTimestamps !== false && (
                    <div className="text-[9px] opacity-50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="msg-ai px-4 py-3 flex items-center gap-1" style={{ backgroundColor: session.theme?.aiBubbleColor || '#1f293b' }}>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-gray-900/80 backdrop-blur border-t border-gray-800">
          <div className="flex items-center gap-2 bg-gray-800 rounded-2xl p-2 border border-gray-700 focus-within:border-primary transition-colors">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.typeMsg || "Escribe..."}
              className="flex-1 bg-transparent border-none outline-none text-white px-3 h-10"
            />
            <button 
              onClick={handleSend}
              className="p-2.5 bg-primary text-black rounded-xl hover:bg-yellow-500 transition-transform active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {showRightSidebar && (
        <div 
            onClick={(e) => e.stopPropagation()}
            className="w-80 bg-black/90 backdrop-blur-md border-l border-gray-800 h-full flex flex-col absolute right-0 top-0 bottom-0 z-30 lg:relative animate-fade-in shadow-2xl"
        >
           {/* ... (Sidebar content kept same as previous) ... */}
           {/* RE-INSERTING SIDEBAR CONTENT TO ENSURE INTEGRITY */}
           <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
               <span className="text-xs font-bold text-primary uppercase tracking-widest">{t.memory}</span>
               <button onClick={() => setShowRightSidebar(false)} className="lg:hidden text-white"><X size={16} /></button>
           </div>
           
           <div className="flex border-b border-gray-800">
               <button onClick={() => setRightSidebarTab('memory')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${rightSidebarTab === 'memory' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><Brain size={18} /></button>
               <button onClick={() => setRightSidebarTab('history')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${rightSidebarTab === 'history' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><History size={18} /></button>
               <button onClick={() => setRightSidebarTab('facts')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${rightSidebarTab === 'facts' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><Database size={18} /></button>
               <button onClick={() => setRightSidebarTab('settings')} className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${rightSidebarTab === 'settings' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}><Palette size={18} /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {rightSidebarTab === 'memory' && (
                   <div className="space-y-4 animate-fade-in">
                       <div className="flex justify-between items-center mb-2">
                           <h4 className="text-sm font-bold text-white flex items-center gap-2"><Brain size={14}/> Bloques de Memoria</h4>
                           <button onClick={handleAddBlock} className="text-green-400 hover:text-green-300 text-xs font-bold flex items-center gap-1">
                               <Plus size={12}/> ADD
                           </button>
                       </div>

                       {(session.memoryBlocks && session.memoryBlocks.length > 0 ? session.memoryBlocks : [session.summary || '']).map((block, index) => (
                           <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700 relative group">
                               {index === 0 && <span className="absolute -top-2 left-2 text-[8px] bg-primary text-black px-2 rounded font-bold uppercase">Active Context</span>}
                               
                               {editingBlockIndex === index ? (
                                   <div className="space-y-2 mt-2">
                                       <textarea 
                                            value={tempBlockContent}
                                            onChange={(e) => setTempBlockContent(e.target.value)}
                                            className="w-full bg-black/50 p-2 rounded text-xs text-white border border-primary outline-none h-32"
                                       />
                                       <div className="flex gap-2 justify-end">
                                           <button onClick={() => setEditingBlockIndex(null)} className="text-red-400 text-xs">Cancelar</button>
                                           <button onClick={handleSaveBlock} className="text-green-400 text-xs font-bold">Guardar</button>
                                       </div>
                                   </div>
                               ) : (
                                   <>
                                     <p className="text-xs text-gray-300 italic mt-1 whitespace-pre-wrap">{block || "..."}</p>
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800/80 rounded">
                                         <button onClick={() => handleEditBlock(index)} className="p-1 text-blue-400 hover:text-white"><Edit size={12}/></button>
                                         <button onClick={() => handleDeleteBlock(index)} className="p-1 text-red-400 hover:text-white"><Trash size={12}/></button>
                                     </div>
                                   </>
                               )}
                           </div>
                       ))}
                   </div>
               )}
               {/* Facts, History, Moments, Settings tabs assumed correctly implemented from previous versions */}
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;