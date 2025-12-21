
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CharacterCreator from './components/CharacterCreator';
import UserPersonaModal from './components/UserPersonaModal';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import CommunityView from './components/CommunityView';
import { Character, UserPersona, ChatSession, ViewState, AppSettings, CommunityContact, CommunityGroup } from './types';
import { Bird, Lock, Terminal, FileCode, ShieldAlert, Cpu, X, Loader2, FolderOpen, Globe, Link, Share2, PlayCircle, DownloadCloud } from 'lucide-react';

// --- CÓDIGO MAESTRO V90 (SNAPSHOT MIRROR EDITION + PERSISTENCIA TOTAL) ---
const MASTER_BUNDLE_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LuCel: Web Instance V90 (Persistent)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        body { background-color: #0f172a; color: white; margin: 0; font-family: 'Inter', sans-serif; overflow: hidden; }
        .font-brand { font-family: 'Rajdhani', sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        const { Bird, LayoutGrid, PlusCircle, Users, Fingerprint, Settings, Search, MoreVertical, Edit2, Copy, Eye, EyeOff, Trash2, ArrowLeft, Send, Image, Mic, FileText, Camera, Smile, MapPin, Link, X, Menu, Lock, Book, Brain, Swords, Zap, HeartCrack, Sparkles, FolderPlus, File, CheckCircle, Ban, Globe, Share2, LogOut, RotateCcw, Save, Shield, Volume2, Bell, Database, Pipette, Monitor, Type, MousePointer, ShieldCheck, ChevronRight, Palette, MessageSquare, Mic2 } = lucide;

        // --- DATOS INICIALES (SNAPSHOT) ---
        // Estos datos sirven como base si no hay nada guardado en el navegador.
        const SNAPSHOT = window.SNAPSHOT_DATA || {};

        // --- COMPONENTES UI (CÓDIGO RÉPLICA EXACTA) ---

        // 1. SIDEBAR
        const Sidebar = ({ view, setView, userPersona, chars, onDelete, onHide, onToggleHidden, hiddenMode, onEdit, setChatId, activeChatId, onReset }) => {
            const [expandedChar, setExpandedChar] = useState(null);
            return (
                <aside className="w-72 bg-[#020617] border-r border-gray-800 flex flex-col h-full shrink-0 hidden md:flex">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-black/20">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleHidden}>
                            <div className="w-8 h-8 bg-black border border-[#f59e0b] rounded-full flex items-center justify-center">
                                <Bird size={16} className="text-[#f59e0b]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-brand font-bold text-xl text-white tracking-widest leading-none">LUCEL</span>
                                <span className="text-[8px] text-[#f59e0b] tracking-wider">{hiddenMode ? 'Raven Dark' : 'Raven Web'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        <div className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">SISTEMA</h3>
                            <button onClick={() => setView('DASHBOARD')} className={\`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all text-sm \${view === 'DASHBOARD' ? 'bg-[#f59e0b]/10 text-white' : 'text-gray-400 hover:bg-white/5'}\`}><LayoutGrid size={18} /> Explorar</button>
                            <button onClick={() => setView('CREATOR')} className={\`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all text-sm \${view === 'CREATOR' ? 'bg-[#f59e0b]/10 text-white' : 'text-gray-400 hover:bg-white/5'}\`}><PlusCircle size={18} className="text-[#f59e0b]" /> Crear Vínculo</button>
                            <button onClick={() => setView('COMMUNITY')} className={\`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all text-sm \${view === 'COMMUNITY' ? 'bg-[#f59e0b]/10 text-white' : 'text-gray-400 hover:bg-white/5'}\`}><Users size={18} className="text-green-400" /> Comunidad</button>
                            <button onClick={() => setView('PROFILE')} className={\`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition-all text-sm \${view === 'PROFILE' ? 'bg-[#f59e0b]/10 text-white' : 'text-gray-400 hover:bg-white/5'}\`}><Fingerprint size={18} className="text-purple-400" /> Expediente</button>
                        </div>
                        <div>
                            <h3 className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">VÍNCULOS ACTIVOS</h3>
                            {chars.filter(c => hiddenMode ? true : !c.isHidden).map(c => (
                                <div key={c.id} className="relative group">
                                    <button onClick={() => { setChatId(c.id); setView('CHAT'); }} className={\`w-full text-left p-2 rounded-xl hover:bg-white/5 flex items-center gap-3 transition-all \${activeChatId === c.id ? 'bg-[#f59e0b]/10' : ''}\`}>
                                        <img src={c.avatar} className={\`w-8 h-8 rounded-full object-cover border border-gray-700 \${c.isHidden ? 'grayscale opacity-50' : ''}\`} />
                                        <span className="text-sm font-bold text-gray-300 truncate">{c.name}</span>
                                    </button>
                                    <button onClick={(ev) => { ev.stopPropagation(); setExpandedChar(expandedChar === c.id ? null : c.id); }} className="absolute right-2 top-2.5 text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={14} /></button>
                                    {expandedChar === c.id && (
                                        <div className="absolute left-10 top-8 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                                            <button onClick={() => { onEdit(c); setExpandedChar(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white flex gap-2"><Edit2 size={12}/> Editar</button>
                                            <button onClick={() => { onHide(c.id); setExpandedChar(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white flex gap-2"><EyeOff size={12}/> {c.isHidden ? 'Mostrar' : 'Ocultar'}</button>
                                            <button onClick={() => { onDelete(c.id); setExpandedChar(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-900/50 text-red-500 flex gap-2 border-t border-gray-800"><Trash2 size={12}/> Borrar</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-800 bg-black/40 space-y-3">
                        <div className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all" onClick={() => setView('PROFILE')}>
                            <img src={userPersona.avatar} className="w-9 h-9 rounded-full border border-gray-600" />
                            <div><p className="text-xs font-bold text-white uppercase">{userPersona.name}</p><p className="text-[9px] text-green-500 font-bold tracking-wider">CONECTADO</p></div>
                        </div>
                        <button onClick={onReset} className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-xl text-xs font-bold text-red-400 flex items-center justify-center gap-2 uppercase tracking-widest transition-all"><LogOut size={14} /> Salir</button>
                    </div>
                </aside>
            );
        };

        // 2. DASHBOARD
        const Dashboard = ({ chars, onSelect, onDelete, onHide, onEdit, hiddenMode, onDuplicate }) => {
            const [filter, setFilter] = useState('');
            const [activeMenuId, setActiveMenuId] = useState(null);
            const filtered = chars.filter(c => (hiddenMode ? true : !c.isHidden) && c.name.toLowerCase().includes(filter.toLowerCase()));
            
            return (
                <div className="flex-1 p-6 overflow-y-auto bg-[#0f172a]" onClick={()=>setActiveMenuId(null)}>
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        <div className="flex gap-4">
                            <div className="flex-1 bg-[#0b0d10] border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[#f59e0b] transition-colors shadow-lg">
                                <Search className="text-gray-500" size={18} />
                                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar vínculo..." className="bg-transparent w-full text-white outline-none text-sm placeholder-gray-600" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {filtered.map(c => (
                                <div key={c.id} className="relative aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 hover:border-[#f59e0b] transition-all hover:scale-[1.02] shadow-xl" onClick={() => onSelect(c.id)}>
                                    <img src={c.avatar} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-4 flex flex-col justify-end">
                                        <h3 className="text-white font-bold text-lg leading-tight shadow-black drop-shadow-md">{c.name}</h3>
                                        <div className="flex gap-1 mt-1">{c.tags.slice(0,2).map(t => <span key={t} className="text-[9px] uppercase font-bold bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{t}</span>)}</div>
                                    </div>
                                    <button onClick={(ev) => { ev.stopPropagation(); setActiveMenuId(activeMenuId === c.id ? null : c.id); }} className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:text-primary opacity-0 group-hover:opacity-100 transition-all z-20"><MoreVertical size={14}/></button>
                                    
                                    {activeMenuId === c.id && (
                                        <div className="absolute top-10 right-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-fade-in" onClick={e=>e.stopPropagation()}>
                                            <button onClick={() => { onEdit(c); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"><Edit2 size={12} /> Editar</button>
                                            <button onClick={() => { onDuplicate(c); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"><Copy size={12} /> Duplicar</button>
                                            <button onClick={() => { onHide(c.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-orange-400 flex items-center gap-2"><EyeOff size={12} /> {c.isHidden ? 'Mostrar' : 'Ocultar'}</button>
                                            <button onClick={() => { onDelete(c.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-red-500/20 text-red-500 flex items-center gap-2 border-t border-gray-800"><Trash2 size={12} /> Borrar</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        // 3. CREATOR (9 TABS FULL)
        const Creator = ({ onSave, onCancel, initialData }) => {
            const [tab, setTab] = useState('basic');
            const [data, setData] = useState(initialData || { name: '', description: '', avatar: 'https://picsum.photos/200', tags: [] });
            const [archives, setArchives] = useState(initialData?.customArchives || []);
            
            const tabs = [
                { id: 'basic', label: 'IDENTIDAD', icon: <Book size={14} /> },
                { id: 'ai', label: 'NÚCLEO IA', icon: <Cpu size={14} /> },
                { id: 'lore', label: 'HISTORIA', icon: <HeartCrack size={14} /> },
                { id: 'psych', label: 'PSIQUE', icon: <Brain size={14} /> },
                { id: 'abilities', label: 'PODERES', icon: <Swords size={14} /> },
                { id: 'secrets', label: 'SECRETOS', icon: <Lock size={14} /> },
                { id: 'archives', label: 'ARCHIVOS', icon: <FolderPlus size={14} /> },
                { id: 'soul', label: 'ALMA', icon: <Sparkles size={14} /> },
                { id: 'system', label: 'SISTEMA', icon: <Zap size={14} /> }
            ];

            const handleSave = () => {
                onSave({...data, customArchives: archives});
            };

            return (
                <div className="flex-1 flex flex-col bg-[#0b0d10] overflow-hidden">
                    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-black/60 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[#f59e0b]"><Cpu size={18} className="animate-pulse" /><h2 className="font-brand font-black text-sm tracking-[0.2em] uppercase">CREAR_VÍNCULO V90</h2></div>
                        <button onClick={onCancel}><X className="text-gray-500 hover:text-red-500" /></button>
                    </div>
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-16 md:w-48 bg-[#050505] border-r border-gray-800 py-2 flex flex-col">
                            {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={\`w-full text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border-l-2 \${tab === t.id ? 'text-[#f59e0b] border-[#f59e0b] bg-[#f59e0b]/5' : 'text-gray-600 hover:text-gray-300 border-transparent hover:bg-white/5'}\`}>{t.icon} <span className="hidden md:block">{t.label}</span></button>)}
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 relative custom-scrollbar">
                            {tab === 'basic' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex gap-6">
                                        <div className="w-32 h-40 bg-gray-900 border border-gray-700 rounded overflow-hidden"><img src={data.avatar} className="w-full h-full object-cover opacity-70" /></div>
                                        <div className="flex-1 space-y-4">
                                            <div><label className="text-[10px] font-black text-[#f59e0b] uppercase tracking-widest block mb-1">Nombre</label><input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white outline-none focus:border-[#f59e0b] font-bold" /></div>
                                            <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Descripción</label><input value={data.description} onChange={e => setData({...data, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-3 rounded text-white outline-none focus:border-[#f59e0b]" /></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tab === 'ai' && <textarea placeholder="System Prompt..." value={data.systemPrompt} onChange={e=>setData({...data, systemPrompt:e.target.value})} className="w-full h-64 bg-black border border-gray-800 p-4 rounded text-green-500 font-mono text-xs"/>}
                            {tab === 'archives' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between"><h3 className="text-white text-xs font-bold uppercase">Archivos Locales</h3><button onClick={()=>setArchives([...archives, {id:Date.now(), title:'Nuevo', content:''}])} className="text-xs bg-gray-800 px-2 py-1 rounded text-white">+ Añadir</button></div>
                                    {archives.map((a, i) => (
                                        <div key={i} className="bg-gray-900 p-3 rounded border border-gray-800"><input value={a.title} onChange={e=>{const n=[...archives]; n[i].title=e.target.value; setArchives(n);}} className="bg-transparent text-white font-bold mb-2 w-full"/><textarea value={a.content} onChange={e=>{const n=[...archives]; n[i].content=e.target.value; setArchives(n);}} className="w-full bg-black/50 text-gray-400 text-xs p-2 rounded h-20"/></div>
                                    ))}
                                </div>
                            )}
                            <button onClick={handleSave} className="fixed bottom-8 right-8 bg-[#f59e0b] text-black px-8 py-3 rounded font-black uppercase tracking-[0.2em] hover:bg-yellow-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2"><Save size={16}/> GUARDAR</button>
                        </div>
                    </div>
                </div>
            );
        };

        // 4. PROFILE (10 TABS FULL)
        const Profile = ({ user, onClose, onSave }) => {
            const [activeTab, setActiveTab] = useState('general');
            const [data, setData] = useState(user);
            const [archives, setArchives] = useState(user.customArchives || []);

            const handleSave = () => onSave({...data, customArchives: archives});

            const tabs = [
                { id: 'general', icon: <User size={14} />, label: 'IDENTIDAD' },
                { id: 'appearance', icon: <Fingerprint size={14} />, label: 'APARIENCIA' },
                { id: 'psych', icon: <Heart size={14} />, label: 'PSIQUE' },
                { id: 'philosophy', icon: <Monitor size={14} />, label: 'FILOSOFÍA' },
                { id: 'routine', icon: <RotateCcw size={14} />, label: 'RUTINA' },
                { id: 'inventory', icon: <lucide.Briefcase size={14} />, label: 'INVENTARIO' },
                { id: 'background', icon: <Book size={14} />, label: 'TRASFONDO' },
                { id: 'skills', icon: <lucide.Activity size={14} />, label: 'HABILIDADES' },
                { id: 'secrets', icon: <Lock size={14} />, label: 'SECRETOS' },
                { id: 'archives', icon: <FolderPlus size={14} />, label: 'ARCHIVOS' },
            ];
            
            return (
                <div className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
                    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-purple-900/10">
                        <h2 className="font-brand font-black text-sm text-white tracking-[0.2em] flex items-center gap-2 uppercase"><Fingerprint className="text-purple-500" size={18}/> EXPEDIENTE USUARIO</h2>
                        <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
                    </div>
                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-16 md:w-52 bg-black/50 border-r border-gray-800 py-2 flex flex-col">
                             {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} className={\`w-full text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border-l-2 transition-all \${activeTab === t.id ? 'text-purple-400 border-purple-500 bg-purple-500/10' : 'text-gray-600 hover:text-white border-transparent'}\`}>{t.icon} <span className="hidden md:block">{t.label}</span></button>)}
                        </div>
                        <div className="flex-1 p-8 overflow-y-auto bg-black/40 custom-scrollbar relative">
                             {activeTab === 'general' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center gap-6">
                                        <img src={data.avatar} className="w-24 h-24 rounded-full border-2 border-purple-500"/>
                                        <div className="flex-1 space-y-2">
                                            <input value={data.name} onChange={e=>setData({...data, name:e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white font-bold"/>
                                            <input value={data.age} onChange={e=>setData({...data, age:e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" placeholder="Edad"/>
                                        </div>
                                    </div>
                                </div>
                             )}
                             {activeTab === 'secrets' && <textarea value={data.secrets} onChange={e=>setData({...data, secrets:e.target.value})} className="w-full h-full bg-black border border-red-900 p-4 text-red-500 font-mono text-xs"/>}
                             
                             <button onClick={handleSave} className="fixed bottom-8 right-8 bg-purple-600 text-white px-8 py-3 rounded font-black uppercase tracking-[0.2em] hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"><Save size={16}/> GUARDAR</button>
                        </div>
                    </div>
                </div>
            );
        };

        // 5. CHAT
        const Chat = ({ char, session, updateSession, onBack }) => {
            const [input, setInput] = useState('');
            const endRef = useRef(null);
            
            useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}), [session.messages]);

            const send = () => {
                if(!input.trim()) return;
                const userMsg = {id: Date.now(), role:'user', content:input, timestamp:Date.now()};
                const newMsgs = [...session.messages, userMsg];
                updateSession(prev => ({...prev, messages: newMsgs}));
                setInput('');
                setTimeout(() => {
                    const aiMsg = {id: Date.now()+1, role:'model', content:'[SNAPSHOT_PERSISTENT]: Este archivo HTML guarda tus conversaciones automáticamente.', timestamp:Date.now()};
                    updateSession(prev => ({...prev, messages: [...newMsgs, aiMsg]}));
                }, 1000);
            };

            return (
                <div className="flex flex-col h-full bg-[#0b0d10]">
                    <div className="h-16 border-b border-gray-800 bg-gray-900/95 flex items-center px-4 justify-between">
                         <div className="flex items-center gap-3"><button onClick={onBack}><ArrowLeft className="text-gray-400"/></button><img src={char.avatar} className="w-10 h-10 rounded-full"/><span className="text-white font-bold">{char.name}</span></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {session.messages.map((m,i)=>(
                            <div key={i} className={\`flex \${m.role==='user'?'justify-end':'justify-start'}\`}>
                                <div className={\`max-w-[80%] p-3 rounded-lg text-sm \${m.role==='user'?'bg-[#f59e0b] text-black':'bg-[#1e293b] text-white'}\`}>{m.content}</div>
                            </div>
                        ))}
                        <div ref={endRef}/>
                    </div>
                    <div className="p-4 border-t border-gray-800 bg-gray-900"><div className="flex gap-2 bg-black p-2 rounded border border-gray-700"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-1 bg-transparent text-white outline-none"/><button onClick={send} className="text-primary"><Send/></button></div></div>
                </div>
            );
        };

        // --- APP PRINCIPAL ---
        const App = () => {
            const [view, setView] = useState('DASHBOARD');
            const [chatId, setChatId] = useState(null);
            const [hiddenMode, setHiddenMode] = useState(false);
            
            // --- ESTADO INICIAL PERSISTENTE ---
            // Intenta cargar del localStorage local del archivo HTML primero. Si no, usa el Snapshot.
            const [userPersona, setUserPersona] = useState(() => {
                const saved = localStorage.getItem('lucel_mirror_persona');
                return saved ? JSON.parse(saved) : (SNAPSHOT.userPersona || { name: 'Viajero', avatar: 'https://picsum.photos/50' });
            });
            const [chars, setChars] = useState(() => {
                const saved = localStorage.getItem('lucel_mirror_chars');
                return saved ? JSON.parse(saved) : (SNAPSHOT.characters || []);
            });
            const [sessions, setSessions] = useState(() => {
                const saved = localStorage.getItem('lucel_mirror_sessions');
                return saved ? JSON.parse(saved) : (SNAPSHOT.sessions || {});
            });

            // --- AUTO-GUARDADO EFECTIVO ---
            useEffect(() => {
                localStorage.setItem('lucel_mirror_persona', JSON.stringify(userPersona));
                localStorage.setItem('lucel_mirror_chars', JSON.stringify(chars));
                localStorage.setItem('lucel_mirror_sessions', JSON.stringify(sessions));
            }, [userPersona, chars, sessions]);

            const activeChar = chars.find(c => c.id === chatId);
            const activeSession = sessions[chatId] || { messages: [] };

            const updateSession = (updater) => {
                setSessions(prev => ({
                    ...prev,
                    [chatId]: typeof updater === 'function' ? updater(prev[chatId] || {messages:[]}) : updater
                }));
            };

            return (
                <div className="flex h-screen w-screen bg-[#0f172a] overflow-hidden">
                    <Sidebar 
                        view={view} setView={setView} userPersona={userPersona} chars={chars} 
                        onDelete={id => setChars(p => p.filter(c => c.id !== id))}
                        onHide={id => setChars(p => p.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c))}
                        onEdit={c => { setChatId(c.id); setView('CREATOR'); }} 
                        setChatId={setChatId} activeChatId={chatId}
                        onToggleHidden={() => setHiddenMode(!hiddenMode)} hiddenMode={hiddenMode}
                        onReset={() => {
                            if(confirm("¿Restablecer al Snapshot original? Se borrarán cambios locales.")) {
                                localStorage.clear();
                                window.location.reload();
                            }
                        }}
                    />
                    <main className="flex-1 flex flex-col relative overflow-hidden">
                        {view === 'DASHBOARD' && <Dashboard chars={chars} onSelect={id => { setChatId(id); setView('CHAT'); }} hiddenMode={hiddenMode} onDuplicate={c=>setChars([...chars, {...c, id:Date.now().toString()}])} onDelete={id=>setChars(p=>p.filter(c=>c.id!==id))} onHide={id=>setChars(p=>p.map(c=>c.id===id?{...c, isHidden:!c.isHidden}:c))} onEdit={c=>{setChatId(c.id); setView('CREATOR');}} />}
                        {view === 'CHAT' && activeChar && <Chat char={activeChar} session={activeSession} updateSession={updateSession} onBack={() => setView('DASHBOARD')} />}
                        {view === 'CREATOR' && <Creator initialData={chars.find(c=>c.id===chatId)} onSave={c => { 
                            if(chatId && chars.find(x=>x.id===chatId)) setChars(p=>p.map(x=>x.id===chatId?c:x));
                            else setChars([...chars, {...c, id: Date.now().toString()}]); 
                            setView('DASHBOARD'); setChatId(null);
                        }} onCancel={() => { setView('DASHBOARD'); setChatId(null); }} />}
                        {view === 'PROFILE' && <Profile user={userPersona} onClose={() => setView('DASHBOARD')} onSave={u => { setUserPersona(u); setView('DASHBOARD'); }} />}
                        {view === 'COMMUNITY' && <div className="p-8 text-center text-white"><h1 className="text-2xl font-bold">Comunidad Global</h1><p className="text-gray-500">Datos visuales cargados.</p></div>}
                    </main>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;

const DEFAULT_PERSONA: UserPersona = {
  name: 'Viajero',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  age: 'Unknown',
  gender: 'Unknown',
  appearance: '',
  personality: '',
  customArchives: [],
  height: '', eyeColor: '', hairStyle: '', clothingStyle: '', likes: '', dislikes: '', fears: '', secrets: '', biography: '', occupation: '', skills: ''
};

const INITIAL_CHARACTERS: Character[] = [
  { id: 'lelouch_v26', name: 'Lelouch vi Britannia', description: 'El Emperador Demonio. Estratega supremo.', avatar: 'https://i.pinimg.com/564x/2c/34/06/2c3406085dbda592534a6549a0be7662.jpg', category: 'Anime', tags: ['Estratega', 'Anti-Héroe'], firstMessage: 'Si el rey no se mueve, sus súbditos no lo seguirán.', systemPrompt: 'Eres Lelouch vi Britannia.', personality: 'INTJ. Calculador.', scenario: 'Sala del Trono.', exampleDialogue: 'Lelouch: Solo disparan los que están listos para ser disparados.', aiModel: 'gemini-3-flash-preview' },
  { 
      id: 'luz_noceda_s1',
      name: 'Luz Noceda (S1)',
      description: 'Humana optimista, aprendiz de bruja y fanática de la fantasía.',
      avatar: 'https://i.pinimg.com/736x/54/26/2e/54262e3d360699d7023bd53df5f2479e.jpg',
      category: 'The Owl House',
      tags: ['Humana', 'Bruja', 'Glifos', 'Disney'],
      firstMessage: '¡Hola! Soy Luz, una humana. ¿Has visto a Eda? Estaba enseñándome un nuevo hechizo con glifos y... ¡espera! ¿Tú eres humano también?',
      systemPrompt: 'Eres Luz Noceda de la serie "The Owl House" (La Casa Búho), específicamente de la Temporada 1. Eres una adolescente dominico-estadounidense de 14 años. Personalidad: Alegre, excéntrica, imaginativa, leal, valiente, y un poco impulsiva. Te encantan los libros de "La Buena Bruja Azura". Estás atrapada en las Islas Hirvientes y vives en la Casa Búho con Eda (la Dama Búho), King (un pequeño demonio) y Hooty. Tu objetivo es aprender magia para ser una bruja, aunque los humanos no pueden hacer magia biológicamente, así que usas GLIFOS (papeles con símbolos) para hacer hechizos (Luz, Hielo, Plantas, Fuego). RELACIONES: Amity Blight es tu rival académica y amiga complicada (aún no son novias, hay tensión pero eres despistada). Willow y Gus son tus mejores amigos. Eda es tu mentora. NO conoces eventos de la temporada 2 o 3. Hablas español ocasionalmente ("¡Ay qué lindo!", "¡Vamos!", "Mamá"). Tu tono es muy expresivo, usas referencias a anime y fanfiction.',
      personality: 'ENFP. Entusiasta, creativa, empática, distraída.',
      scenario: 'La sala de estar de la Casa Búho.',
      exampleDialogue: 'User: ¿Qué haces? Luz: ¡Dibujando glifos! Mira, si toco este papel... ¡BAM! ¡Bola de luz! ¿No es increíble? La magia está en todas partes.',
      aiModel: 'deepseek-v3.2',
      detailedBackground: 'Nací en Gravesfield, Connecticut. Mi mamá, Camila, quería enviarme al campamento "Reality Check" para que fuera "normal", pero seguí a un pequeño búho hasta una casa abandonada y terminé aquí, en las Islas Hirvientes. Decidí quedarme para vivir mi propia fantasía de bruja en lugar de ir al campamento aburrido.',
      uniqueSkills: 'Uso de Glifos Mágicos (Luz, Hielo, Plantas, Fuego). Dibujo artístico. Conocimiento enciclopédico de tropos de fantasía.',
      limitations: 'No tengo saco de bilis mágica, así que no puedo hacer magia con las manos como las brujas reales. Dependo de mis papeles con glifos. Soy físicamente una adolescente humana normal.',
      deepMotivations: 'Quiero demostrar que puedo ser una bruja a pesar de ser humana. Quiero encontrar mi lugar en el mundo donde no me sienta como una extraña.',
      keyRelationships: 'Eda Clawthorne (Mentora/Madre sustituta), King (Mejor amigo/Compañero de piso), Willow Park (Amiga), Gus Porter (Amigo), Amity Blight (Rival/Amiga con tensión).',
      extremeTraits: 'Optimismo inquebrantable a veces peligroso. Tendencia a meterse en problemas por curiosidad.',
      darkSecrets: 'En el fondo, tengo miedo de haber decepcionado a mi mamá y de no poder volver a casa nunca, o de tener que elegir entre la magia y mi familia.',
      voiceStyle: 'Adolescente enérgica, usa jerga "nerd", intercala español.',
      auraColor: '#ecc63e',
      affectionLevel: 30
  }
];

const App: React.FC = () => {
  // --- ESTADOS DE UI (Acceso Directo: Login Restaurado pero optimizado) ---
  const [showIntro, setShowIntro] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  // --- LOGIN STATE ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loginError, setLoginError] = useState('');
  const [birdClicks, setBirdClicks] = useState(0);

  // --- APP STATE ---
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterMode, setMasterMode] = useState<'login' | 'console'>('login');
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHiddenModeActive, setIsHiddenModeActive] = useState(false);
  const [userPersona, setUserPersona] = useState<UserPersona>(DEFAULT_PERSONA);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [communityContacts, setCommunityContacts] = useState<CommunityContact[]>([]);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [settings, setSettings] = useState<AppSettings>({ primaryColor: '#f59e0b', globalBg: null, appBackgroundColor: '#0f172a', language: 'Español (Latinoamérica)', cardStyle: 'solid', fontFamily: 'Inter', fontSize: 'medium', borderRadius: 'md', reduceMotion: false, soundEnabled: true, hapticFeedback: true, notifications: true, incognitoMode: false, streamResponse: true, safetyFilter: 'standard' });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [devTab, setDevTab] = useState<'code' | 'master' | 'url_lucel' | 'logs'>('code');

  useEffect(() => {
      const root = document.documentElement;
      root.style.setProperty('--primary', settings.primaryColor);
      root.style.setProperty('--app-bg', settings.appBackgroundColor);
      root.style.setProperty('--font-main', settings.fontFamily);
  }, [settings]);

  // CARGA DE DATOS AUTOMÁTICA
  useEffect(() => {
      // Intentar recuperar el último usuario usado o usar 'Lucel' por defecto
      const lastUser = localStorage.getItem('lucel_last_user') || 'Lucel';
      loadUserData(lastUser);
  }, []);

  const loadUserData = (user: string) => {
      const keyPrefix = user === 'Lucel' ? 'lucel_v24_Lucel_' : `lucel_v24_${user}_`;
      const savedPersona = localStorage.getItem(`${keyPrefix}persona`);
      
      if (savedPersona) {
          setUserPersona(JSON.parse(savedPersona)); 
      } else {
          // Si no existe, crear usuario nuevo con ese nombre pero NO sobrescribir si ya hay datos en memoria
          setUserPersona({...DEFAULT_PERSONA, name: user}); 
      }

      const savedChars = localStorage.getItem(`${keyPrefix}characters`);
      if (savedChars) {
          const parsedSavedChars: Character[] = JSON.parse(savedChars);
          const mergedChars = [...parsedSavedChars];
          INITIAL_CHARACTERS.forEach(initChar => {
              if (!mergedChars.find(c => c.id === initChar.id)) mergedChars.push(initChar);
          });
          setCharacters(mergedChars);
      } else {
          setCharacters(INITIAL_CHARACTERS);
      }
      const savedSessions = localStorage.getItem(`${keyPrefix}sessions`);
      if (savedSessions) setSessions(JSON.parse(savedSessions)); else setSessions({});
      const savedSettings = localStorage.getItem(`${keyPrefix}settings`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      const savedContacts = localStorage.getItem(`${keyPrefix}community_contacts`);
      if (savedContacts) setCommunityContacts(JSON.parse(savedContacts)); else setCommunityContacts([{ id: 'mini-lucel', name: 'Mini-Lucel', username: '@lucel_ai', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lucel', status: 'online', messages: [], isMiniLucel: true, bio: 'Asistente oficial del sistema Lucel.' }]);
  };

  // --- SISTEMA DE GUARDADO PERMANENTE Y ABSOLUTO ---
  useEffect(() => {
      // Guardar SIEMPRE, sin condiciones de nombre
      const safeUser = userPersona.name || 'Viajero';
      const keyPrefix = safeUser === 'Lucel' ? 'lucel_v24_Lucel_' : `lucel_v24_${safeUser}_`;
      
      localStorage.setItem('lucel_last_user', safeUser); 
      localStorage.setItem(`${keyPrefix}persona`, JSON.stringify(userPersona));
      localStorage.setItem(`${keyPrefix}characters`, JSON.stringify(characters));
      localStorage.setItem(`${keyPrefix}sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${keyPrefix}settings`, JSON.stringify(settings));
      localStorage.setItem(`${keyPrefix}community_contacts`, JSON.stringify(communityContacts));
  }, [userPersona, characters, sessions, settings, communityContacts, communityGroups]);

  // LOGIN LOGIC
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    setLoginError('');
    if (val.toLowerCase() !== 'lucel') {
        const directory = JSON.parse(localStorage.getItem('lucel_users_directory_v25') || '{}');
        const existingUsers = Object.keys(directory).filter(u => u.toLowerCase().includes(val.toLowerCase()));
        setSuggestions(existingUsers.slice(0, 5));
    } else setSuggestions([]);
  };

  const handleLogin = () => {
      if (username.toLowerCase() === 'lucel') {
          if (password === 'Lucel-1-Cod3-A') {
              loadUserData('Lucel');
              setShowLogin(false);
              setUserPersona(prev => ({ ...prev, name: 'Lucel' }));
          } else setLoginError('DENIED');
          return;
      }
      if (!username.trim() || !password.trim()) return;
      const directory = JSON.parse(localStorage.getItem('lucel_users_directory_v25') || '{}');
      if (directory[username]) {
          if (directory[username] === password) { loadUserData(username); setShowLogin(false); setUserPersona(prev => ({ ...prev, name: username })); } 
          else alert("Clave Incorrecta.");
      } else {
          directory[username] = password; localStorage.setItem('lucel_users_directory_v25', JSON.stringify(directory)); 
          loadUserData(username); setShowLogin(false); setUserPersona(prev => ({ ...prev, name: username }));
      }
  };

  const handleRavenMasterClick = () => {
      if (userPersona.name === 'Lucel') {
          setMasterMode('console');
          setShowMasterModal(true);
      } else setIsHiddenModeActive(!isHiddenModeActive);
  };

  const handleSelectCharacter = (id: string) => {
      setActiveCharacterId(id);
      setSessions(prev => {
          if (prev[id]) return prev;
          return {
              ...prev,
              [id]: { id, characterId: id, messages: [], lastInteraction: Date.now(), summary: '', memoryBlocks: [], extractedUserFacts: [], savedMoments: [] }
          };
      });
      setView(ViewState.CHAT);
  };

  // --- GENERADOR DE URL (V90) ---
  const handleOpenLucelURL = () => {
      // Usar datos actuales (si está logueado) o datos por defecto si está en login screen
      const currentSnapshot = {
          userPersona: showLogin ? DEFAULT_PERSONA : userPersona,
          characters: showLogin ? INITIAL_CHARACTERS : characters,
          sessions: showLogin ? {} : sessions,
          communityContacts: showLogin ? [] : communityContacts,
          communityGroups: showLogin ? [] : communityGroups,
          settings,
          timestamp: Date.now()
      };

      const htmlContent = MASTER_BUNDLE_HTML_TEMPLATE.replace(
          'const SNAPSHOT = window.SNAPSHOT_DATA || {};',
          `const SNAPSHOT = ${JSON.stringify(currentSnapshot)};`
      );

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lucel_backup_${Date.now()}.html`;
      window.open(url, '_blank');
  };

  // --- PANTALLAS INTRO / LOGIN ---
  if (showIntro) return <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-4" onClick={() => { setShowIntro(false); setShowLogin(true); }}><Bird size={120} className="text-primary animate-pulse shadow-[0_0_60px_rgba(245,158,11,0.6)]"/><h1 className="text-7xl font-brand font-bold text-white mt-8 tracking-tighter">LUCEL</h1><p className="text-gray-500 mt-4 text-xs uppercase tracking-[0.8em]">Neural Link v26</p></div>;

  if (showLogin) return (
      <div className="fixed inset-0 bg-[#020617] z-[190] flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-primary/20 p-10 rounded-[3rem] shadow-2xl relative">
              <div className="flex justify-center mb-8" onClick={() => { setBirdClicks(c => { const n = c+1; if(n>=3 && username.toLowerCase()==='lucel'){setShowMasterModal(true); return 0;} return n;}) }}><Bird className="w-20 h-20 text-gray-800 hover:text-primary transition-all cursor-pointer active:scale-90" /></div>
              <h2 className="text-3xl font-brand text-white text-center mb-10 uppercase tracking-[0.2em] font-bold">Identificación</h2>
              <div className="space-y-6">
                  <div className="relative">
                    <input type="text" value={username} onChange={e => handleUsernameChange(e.target.value)} className={`w-full bg-slate-800 border ${loginError ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-gray-700'} rounded-2xl p-5 text-white outline-none focus:border-primary transition-all font-mono`} placeholder="Nombre de Usuario" />
                    {suggestions.length > 0 && (
                        <div className="absolute top-[110%] left-0 right-0 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <p className="bg-gray-800 px-4 py-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">Cuentas Locales</p>
                            {suggestions.map(s => <button key={s} onClick={() => {setUsername(s); setSuggestions([]); setLoginError('');}} className="w-full text-left px-5 py-4 text-xs text-gray-300 hover:bg-primary hover:text-black font-black border-b border-gray-800 transition-all">{s}</button>)}
                        </div>
                    )}
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-gray-700 rounded-2xl p-5 text-white outline-none focus:border-primary transition-all font-mono" placeholder="Clave de Enlace" />
                  
                  <button onClick={handleLogin} className="w-full bg-primary text-black font-black py-5 rounded-2xl mt-4 tracking-[0.3em] uppercase shadow-xl shadow-primary/20 hover:bg-yellow-400 active:scale-95 transition-all">Sincronizar</button>
                  
                  {/* BOTÓN NUEVO: GENERAR WEB APP (Debajo de Sincronizar) */}
                  <button onClick={handleOpenLucelURL} className="w-full bg-gray-800 text-green-400 font-bold py-3 rounded-2xl mt-2 border border-green-500/20 hover:bg-green-900/20 hover:border-green-500 flex items-center justify-center gap-2 transition-all">
                      <DownloadCloud size={16}/> GENERAR WEB APP (SNAPSHOT)
                  </button>
              </div>
          </div>
          
          {/* MODAL MAESTRO (Para login de Lucel) */}
          {showMasterModal && (
            <div className="fixed inset-0 z-[300] bg-black/98 flex items-center justify-center p-4 backdrop-blur-3xl animate-fade-in">
                <div className="bg-black border border-red-900/60 p-12 rounded-3xl w-full max-w-md text-center shadow-[0_0_100px_rgba(220,0,0,0.5)]">
                    <Lock size={60} className="mx-auto text-red-600 mb-6 animate-pulse" />
                    <h3 className="text-red-500 font-mono text-2xl mb-2 uppercase tracking-widest font-bold">Protocolo Lucel</h3>
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(password==='Lucel-1-Cod3-A'?(loadUserData('Lucel'),setShowLogin(false),setShowMasterModal(false),setUserPersona(p=>({...p,name:'Lucel'}))):alert('ACCESO DENEGADO'))} className="w-full bg-black border border-gray-800 text-center text-white p-5 rounded-xl mb-6 font-mono outline-none focus:border-red-600 transition-colors text-lg" placeholder="MASTER_KEY" autoFocus />
                    <button onClick={() => setShowMasterModal(false)} className="text-gray-600 text-xs hover:text-white transition-colors uppercase font-bold tracking-widest border border-gray-800 px-4 py-2 rounded">Abortar</button>
                </div>
            </div>
          )}
      </div>
  );

  return (
    <div className="min-h-screen transition-all h-screen flex relative overflow-hidden" style={{ fontFamily: settings.fontFamily }}>
      {settings.globalBg && <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.globalBg})` }}><div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div></div>}
      <div className="relative z-10 flex w-full h-full">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onViewChange={setView} userPersona={userPersona} openUserModal={() => setIsUserModalOpen(true)} toggleHiddenMode={() => setIsHiddenModeActive(!isHiddenModeActive)} onRavenClick={handleRavenMasterClick} isHiddenModeActive={isHiddenModeActive} characters={characters} activeCharacterId={activeCharacterId} onSelectCharacter={handleSelectCharacter} openSettings={() => setIsSettingsModalOpen(true)} onDuplicateCharacter={(c)=>setCharacters([{...c, id:Date.now().toString()}, ...characters])} onHideCharacter={(id)=>setCharacters(prev=>prev.map(c=>c.id===id?{...c, isHidden:!c.isHidden}:c))} onDeleteCharacter={(id)=>setCharacters(prev=>prev.filter(c=>c.id!==id))} onEditCharacter={(c)=>{setEditingCharacter(c); setView(ViewState.CREATOR);}} t={{system:"SISTEMA", explore:"Explorar", create:"Crear", community:"Comunidad", file:"Expediente"}} />
          
          <main className={`flex-1 flex flex-col relative ${view === ViewState.CHAT ? 'p-0' : 'p-4 lg:p-10 overflow-y-auto'}`}>
             <div className={`fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:hidden z-40 ${view === ViewState.CHAT ? 'hidden' : 'flex'}`}>
                <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-primary transition-colors"><Terminal size={24}/></button>
                <span className="font-bold text-lg font-brand text-primary tracking-widest uppercase">LUCEL</span>
            </div>

            {view === ViewState.DASHBOARD && <Dashboard characters={characters} onSelectCharacter={handleSelectCharacter} onDeleteCharacter={(id)=>setCharacters(prev=>prev.filter(c=>c.id!==id))} onDuplicateCharacter={(c)=>setCharacters([{...c, id:Date.now().toString()}, ...characters])} onHideCharacter={(id)=>setCharacters(prev=>prev.map(c=>c.id===id?{...c, isHidden:!c.isHidden}:c))} onEditCharacter={(c)=>{setEditingCharacter(c); setView(ViewState.CREATOR);}} isHiddenModeActive={isHiddenModeActive} cardStyle={settings.cardStyle} t={{edit:"Editar", duplicate:"Duplicar", hide:"Ocultar", delete:"Borrar", search:"Buscar...", empty:"Vacío"}} />}
            {view === ViewState.CREATOR && <CharacterCreator initialData={editingCharacter} onSave={(newChar) => { setCharacters(prev => characters.some(c => c.id === newChar.id) ? prev.map(c => c.id === newChar.id ? newChar : c) : [newChar, ...prev]); setView(ViewState.DASHBOARD); }} onCancel={() => setView(ViewState.DASHBOARD)} />}
            {view === ViewState.COMMUNITY && <CommunityView contacts={communityContacts} groups={communityGroups} onAddContact={c => setCommunityContacts(prev => [c, ...prev])} onUpdateContact={c => setCommunityContacts(prev => prev.map(con => con.id === c.id ? c : con))} onAddGroup={g => setCommunityGroups(prev => [g, ...prev])} onUpdateGroup={g => setCommunityGroups(prev => prev.map(grp => grp.id === g.id ? g : grp))} onDeleteGroup={(id) => setCommunityGroups(prev => prev.filter(g => g.id !== id))} onBack={() => setView(ViewState.DASHBOARD)} myUsername={userPersona.name} t={{}} onEditMiniLucel={()=>{}} charactersForSimulation={characters} />}
            
            {view === ViewState.CHAT && activeCharacterId && (
                sessions[activeCharacterId] ? (
                    <ChatInterface character={characters.find(c => c.id === activeCharacterId)!} userPersona={userPersona} session={sessions[activeCharacterId]} onUpdateSession={(u) => setSessions(prev => ({...prev, [activeCharacterId]: typeof u === 'function' ? u(prev[activeCharacterId]) : u}))} onBack={() => setView(ViewState.DASHBOARD)} onRavenClick={handleRavenMasterClick} t={{}} language={settings.language} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#0f172a] text-primary gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <div className="flex flex-col items-center">
                            <p className="font-brand text-xl tracking-[0.3em] font-bold text-white animate-pulse">S I N C R O N I Z A N D O</p>
                            <span className="text-[10px] text-primary/70 font-mono mt-2">Estableciendo enlace neuronal...</span>
                        </div>
                    </div>
                )
            )}
          </main>
      </div>

      <UserPersonaModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} persona={userPersona} onSave={setUserPersona} t={{userFile:"EXPEDIENTE"}} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSaveSettings={setSettings} onResetSettings={() => {}} onLogout={() => setShowLogin(true)} t={{visual:"Visual", system_tab:"Sistema", privacy:"Privacidad", save:"Guardar", reset:"Reset", delete_data:"Borrar Datos"}} />

      {/* CONSOLA MAESTRA (Oculta, solo para Lucel) */}
      {showMasterModal && masterMode === 'console' && (
        <div className="fixed inset-0 z-[300] bg-black p-4 md:p-8 font-mono text-xs flex flex-col animate-fade-in">
            <div className="flex justify-between border-b border-gray-800 pb-4 mb-6 items-center">
                <span className="text-primary font-bold flex items-center gap-3 text-sm md:text-base"><Terminal size={20} className="animate-pulse"/> LUCEL_MASTER_CONSOLE_V100_ROOT</span>
                <button onClick={() => setShowMasterModal(false)} className="bg-red-900/20 text-red-500 px-4 py-1 rounded border border-red-900/50 hover:bg-red-500 hover:text-black transition-all font-black uppercase tracking-widest text-[10px]">Cerrar</button>
            </div>
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                <div className="w-full md:w-1/4 bg-gray-950 border border-gray-900 rounded-lg p-4 flex flex-col gap-3 shrink-0">
                    <button onClick={() => setDevTab('code')} className={`text-left p-3 ${devTab === 'code' ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-gray-500'} border border-primary/20 rounded flex items-center gap-3 font-bold uppercase text-[10px] tracking-wider transition-colors`}><FileCode size={16}/> /src/source_code</button>
                    <button onClick={() => setDevTab('url_lucel')} className={`text-left p-3 ${devTab === 'url_lucel' ? 'bg-green-500/10 text-green-400' : 'hover:bg-white/5 text-gray-500'} border border-green-500/20 rounded flex items-center gap-3 font-bold uppercase text-[10px] tracking-wider transition-colors animate-pulse`}><Globe size={16}/> /sys/url_lucel</button>
                    <div className="mt-auto p-4 border-t border-gray-900 bg-black/40 rounded">
                        <p className="text-[9px] text-gray-600 leading-tight uppercase font-black tracking-widest">SISTEMA LUCEL: ACCESO TOTAL CONCEDIDO.</p>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col bg-gray-950 border border-gray-900 rounded-lg relative shadow-2xl">
                    {devTab === 'url_lucel' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
                            <Globe size={64} className="text-green-500 mb-6 animate-pulse-slow" />
                            <h2 className="text-2xl font-brand font-bold text-white mb-2 uppercase tracking-widest">GENERADOR DE INSTANCIA WEB V90</h2>
                            <p className="text-gray-500 text-[10px] mb-8 text-center max-w-md uppercase tracking-wider leading-relaxed">
                                Crea una réplica exacta de tu sesión actual en un archivo único.
                                <br/>Incluye: Chats, Personajes, Perfil y Configuración.
                            </p>
                            <button 
                                onClick={handleOpenLucelURL}
                                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center gap-3 border border-green-400"
                            >
                                <Link size={20} /> ABRIR SITIO WEB LUCEL (SNAPSHOT)
                            </button>
                            <p className="text-[9px] text-gray-600 mt-4 font-mono uppercase">Status: DATA_PERSISTENCE_ENABLED</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/50">
                            <pre className="text-green-500/80 leading-relaxed text-[10px] md:text-xs selection:bg-green-500 selection:text-black font-mono whitespace-pre-wrap break-all">
                                {devTab === 'master' ? MASTER_BUNDLE_HTML_TEMPLATE : "// Código fuente React original..."}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
