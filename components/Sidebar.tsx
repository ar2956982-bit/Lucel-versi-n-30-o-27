import React, { useState, useRef } from 'react';
import { LayoutGrid, PlusCircle, Fingerprint, Search, X, Settings, Users, MoreHorizontal, Trash2, Copy, EyeOff, Edit2, Bird } from 'lucide-react';
import { Character, UserPersona } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: any) => void;
  userPersona: UserPersona;
  openUserModal: () => void;
  toggleHiddenMode: () => void;
  onLogoLongPress: () => void;
  onVersionClick: () => void;
  onRavenClick: () => void; // New prop for triple click logic
  isHiddenModeActive: boolean;
  characters: Character[];
  activeCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  openSettings: () => void;
  onDuplicateCharacter: (char: Character) => void;
  onHideCharacter: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onEditCharacter: (char: Character) => void;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, onViewChange, userPersona, openUserModal, 
  toggleHiddenMode, onLogoLongPress, onVersionClick, onRavenClick, isHiddenModeActive, characters, activeCharacterId, onSelectCharacter,
  openSettings, onDuplicateCharacter, onHideCharacter, onDeleteCharacter, onEditCharacter, t
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [ravenClicks, setRavenClicks] = useState(0);
  
  const isLucel = userPersona.name === 'Lucel';

  // Logic for Raven clicks (Security Console) - EXCLUSIVE TO LUCEL
  const handleRavenInteraction = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isLucel) return; // Silent fail for everyone else

      setRavenClicks(prev => {
          const newCount = prev + 1;
          if (newCount === 3) {
              onRavenClick(); // Trigger App console handler
              return 0;
          }
          return newCount;
      });
      
      if (ravenClicks === 0) {
          toggleHiddenMode();
      }
      
      setTimeout(() => setRavenClicks(0), 1000);
  };

  const displayedCharacters = characters.filter(c => 
    isHiddenModeActive ? true : !c.isHidden
  );

  return (
    <>
      <div 
        onClick={onClose} 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      ></div>

      <aside className={`
        fixed top-0 left-0 h-full w-[280px] bg-sidebar-bg border-r border-gray-800 z-50 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} onClick={() => setActiveMenuId(null)}>
        
        {/* Header - Raven Logo */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-black border-2 flex items-center justify-center overflow-hidden relative transition-all ${isLucel ? 'cursor-pointer border-primary neon-shadow' : 'border-gray-800'}`}
                onClick={handleRavenInteraction}
            >
               <Bird className={`w-8 h-8 z-10 ${isLucel ? 'text-primary' : 'text-gray-700'}`} />
               <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isLucel ? 'to-primary/20' : 'to-black'}`}></div>
               {ravenClicks > 0 && isLucel && <span className="absolute top-0 right-0 bg-red-600 w-3 h-3 rounded-full animate-ping"></span>}
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold font-brand tracking-wide text-white leading-none select-none">LUCEL</h1>
              
              <button 
                onClick={onVersionClick}
                className={`text-[10px] font-mono tracking-[0.2em] transition-colors uppercase text-left hover:text-white ${isHiddenModeActive ? 'text-red-500 animate-pulse' : 'text-primary'}`}
              >
                {isHiddenModeActive ? 'Raven Dark v26' : 'Raven Ed. v26'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          <div>
            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{t.system || "System"}</h3>
            <nav className="space-y-1">
              <button onClick={() => { onViewChange('DASHBOARD'); onClose(); }} className="w-full text-left sidebar-item flex items-center px-3 py-2.5 text-sm font-bold rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                <LayoutGrid className="mr-3 flex-shrink-0 w-5 h-5" /> {t.explore}
              </button>
              <button onClick={() => { onViewChange('CREATOR'); onClose(); }} className="w-full text-left sidebar-item group flex items-center px-3 py-2.5 text-sm font-bold rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                <PlusCircle className="mr-3 flex-shrink-0 w-5 h-5 text-primary group-hover:animate-pulse" />
                {t.create}
              </button>
              <button onClick={() => { onViewChange('COMMUNITY'); onClose(); }} className="w-full text-left sidebar-item group flex items-center px-3 py-2.5 text-sm font-bold rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                <Users className="mr-3 flex-shrink-0 w-5 h-5 text-green-400" />
                {t.community}
              </button>
              <button onClick={openUserModal} className="w-full text-left sidebar-item group flex items-center px-3 py-2.5 text-sm font-bold rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all">
                <Fingerprint className="mr-3 flex-shrink-0 w-5 h-5 text-purple-400" />
                {t.file}
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 flex items-center justify-between mb-3">
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.activeLinks}</h3>
               <span className="bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded">{displayedCharacters.length}</span>
            </div>
            
            <div className="space-y-1">
               {displayedCharacters.map(char => (
                 <div key={char.id} className="relative group/item">
                    <button 
                      onClick={() => { onSelectCharacter(char.id); onClose(); }}
                      className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${activeCharacterId === char.id ? 'bg-primary/10 text-white border-l-2 border-primary pl-2.5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <img src={char.avatar} alt="" className={`w-8 h-8 rounded-full mr-3 object-cover border border-gray-700 ${char.isHidden ? 'grayscale' : ''}`} />
                      <div className="flex-1 min-w-0">
                         <div className="truncate text-sm flex items-center gap-1">{char.name} {char.isHidden && <EyeOff size={10} className="text-red-500"/>}</div>
                         <div className="truncate text-[10px] text-gray-600">{char.category}</div>
                      </div>
                    </button>
                    
                    {/* 3 DOTS TRIGGER */}
                    <button 
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          setActiveMenuId(activeMenuId === char.id ? null : char.id); 
                      }}
                      className="absolute right-2 top-3 p-1 text-gray-500 hover:text-primary rounded opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {/* CONTEXT MENU */}
                    {activeMenuId === char.id && (
                       <div className="absolute left-10 top-8 ml-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[60] overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); onEditCharacter(char); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white flex items-center gap-2">
                             <Edit2 size={12} /> {t.edit}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDuplicateCharacter(char); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-white flex items-center gap-2">
                             <Copy size={12} /> {t.duplicate}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onHideCharacter(char.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 text-orange-400 flex items-center gap-2">
                             <EyeOff size={12} /> {char.isHidden ? 'Mostrar' : t.hide}
                          </button>
                          <button onClick={(e) => { 
                             e.stopPropagation();
                             onDeleteCharacter(char.id); 
                             setActiveMenuId(null); 
                          }} className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/20 text-red-500 flex items-center gap-2 border-t border-gray-800">
                             <Trash2 size={12} /> {t.delete}
                          </button>
                       </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-black/20 space-y-3">
          <div className="flex items-center cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors" onClick={openUserModal}>
            <img className="h-9 w-9 rounded-full object-cover border-2 border-primary" src={userPersona.avatar} alt="User" />
            <div className="ml-3">
              <p className="text-sm font-bold text-white flex items-center gap-1">
                  {userPersona.name}
                  {userPersona.name === 'Lucel' && <Bird size={12} className="text-primary fill-primary" />}
              </p>
              <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {t.online || "CONECTADO"}</p>
            </div>
          </div>
          <button 
            onClick={openSettings} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 border border-gray-700 hover:border-primary hover:bg-gray-800 rounded-lg text-xs text-gray-300 font-bold transition-all"
          >
             <Settings size={14} className="animate-spin-slow" /> {t.settings}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;