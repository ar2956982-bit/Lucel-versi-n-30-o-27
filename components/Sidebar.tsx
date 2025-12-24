import React, { useState } from 'react';
import { LayoutGrid, PlusCircle, Fingerprint, X, Settings, Users, MoreHorizontal, Trash2, Copy, EyeOff, Edit2, Bird, ChevronDown, ChevronRight } from 'lucide-react';
import { Character, UserPersona } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewChange: (view: any) => void;
  userPersona: UserPersona;
  openUserModal: () => void;
  toggleHiddenMode: () => void;
  onRavenClick: () => void;
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
  sidebarColor?: string; // V35 Custom Color
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, onViewChange, userPersona, openUserModal, 
  toggleHiddenMode, onRavenClick, isHiddenModeActive, characters, activeCharacterId, onSelectCharacter,
  openSettings, onDuplicateCharacter, onHideCharacter, onDeleteCharacter, onEditCharacter, t, sidebarColor
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isLinksExpanded, setIsLinksExpanded] = useState(true); // Default open
  const isLucel = userPersona.name === 'Lucel';

  const handleTextClick = () => {
      if (isLucel) onRavenClick();
      else toggleHiddenMode();
  };

  const handleHide = (id: string, isHidden: boolean) => {
      onHideCharacter(id);
      setActiveMenuId(null);
      if (!isHidden) {
          alert("Se hará visible si presionas en la palabra Lucel en el menú principal");
      }
  };

  // Filter visible characters for the list
  const visibleCharacters = characters.filter(c => isHiddenModeActive ? true : !c.isHidden);

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

      <aside 
        className={`fixed top-0 left-0 h-full w-[280px] border-r border-gray-800 z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`} 
        onClick={() => setActiveMenuId(null)}
        style={{ backgroundColor: sidebarColor || '#020617' }}
      >
        
        {/* LOGO AREA */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/10 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden group">
            <div className={`w-10 h-10 rounded-full bg-black/50 border-2 flex items-center justify-center relative shrink-0 transition-all ${isLucel ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-800'}`}>
               <Bird className={`w-6 h-6 z-10 ${isLucel ? 'text-primary' : 'text-gray-700'}`} />
            </div>
            <div className="flex flex-col min-w-0 cursor-pointer" onClick={handleTextClick}>
              <h1 className="text-lg font-bold font-brand tracking-widest text-white leading-none truncate group-hover:text-primary transition-colors select-none">LUCEL</h1>
              <span className={`text-[8px] font-mono tracking-wider transition-colors truncate ${isHiddenModeActive ? 'text-red-500' : 'text-primary'}`}>
                {isHiddenModeActive ? 'Raven Dark v26' : 'Raven Ed. v26'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-white bg-gray-800 rounded-lg"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
          <div>
            <h3 className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{t.system}</h3>
            <nav className="space-y-1">
              <button onClick={() => { onViewChange('DASHBOARD'); onClose(); }} className="w-full text-left flex items-center px-4 py-3 text-sm font-bold rounded-xl text-gray-300 hover:bg-white/5 transition-all"><LayoutGrid className="mr-3 w-5 h-5" /> {t.explore}</button>
              <button onClick={() => { onViewChange('CREATOR'); onClose(); }} className="w-full text-left group flex items-center px-4 py-3 text-sm font-bold rounded-xl text-gray-300 hover:bg-white/5 transition-all"><PlusCircle className="mr-3 w-5 h-5 text-primary" /> {t.create}</button>
              <button onClick={() => { onViewChange('COMMUNITY'); onClose(); }} className="w-full text-left flex items-center px-4 py-3 text-sm font-bold rounded-xl text-gray-300 hover:bg-white/5 transition-all"><Users className="mr-3 w-5 h-5 text-green-400" /> {t.community}</button>
              <button onClick={() => { openUserModal(); onClose(); }} className="w-full text-left flex items-center px-4 py-3 text-sm font-bold rounded-xl text-gray-300 hover:bg-white/5 transition-all"><Fingerprint className="mr-3 w-5 h-5 text-purple-400" /> {t.file}</button>
            </nav>
          </div>

          <div>
            <div 
                className="px-3 flex items-center justify-between mb-4 cursor-pointer group"
                onClick={() => setIsLinksExpanded(!isLinksExpanded)}
            >
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">
                   {t.active_links} <span className="text-primary ml-1">({visibleCharacters.length})</span>
               </h3>
               <button className="text-gray-500 group-hover:text-white transition-colors">
                   {isLinksExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
               </button>
            </div>
            
            {isLinksExpanded && (
                <div className="space-y-1 animate-fade-in-down">
                   {visibleCharacters.map(char => (
                     <div key={char.id} className="relative group">
                        <button onClick={() => { onSelectCharacter(char.id); onClose(); }} className={`w-full text-left flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeCharacterId === char.id ? 'bg-primary/10 text-white border-l-4 border-primary pl-2' : 'text-gray-400 hover:bg-white/5'}`}>
                          <img src={char.avatar} alt="" className={`w-8 h-8 rounded-full mr-3 object-cover border border-gray-700 ${char.isHidden ? 'grayscale' : ''}`} />
                          <div className="flex-1 min-w-0">
                             <div className="truncate text-sm font-bold flex items-center gap-1">{char.name} {char.isHidden && <EyeOff size={10} className="text-red-500"/>}</div>
                          </div>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }} className="absolute right-2 top-3 p-1.5 text-gray-600 hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal size={14} /></button>
                        {activeMenuId === char.id && (
                           <div className="absolute left-10 top-10 w-40 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in">
                              <button onClick={(e) => { e.stopPropagation(); onEditCharacter(char); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2 border-b border-gray-800 font-bold tracking-tighter uppercase"><Edit2 size={12} /> {t.edit}</button>
                              <button onClick={(e) => { e.stopPropagation(); handleHide(char.id, !!char.isHidden); }} className="w-full text-left px-4 py-3 text-xs hover:bg-white/10 text-orange-400 flex items-center gap-2 font-bold tracking-tighter uppercase"><EyeOff size={12} /> {char.isHidden ? t.show : t.hide}</button>
                              <button onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char.id); setActiveMenuId(null); }} className="w-full text-left px-4 py-3 text-xs hover:bg-red-900/20 text-red-500 flex items-center gap-2 font-bold tracking-tighter uppercase"><Trash2 size={12} /> {t.delete}</button>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-black/10 space-y-3 shrink-0">
          <div className="flex items-center cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors" onClick={() => { openUserModal(); onClose(); }}>
            <img className="h-10 w-10 rounded-full object-cover border-2 border-primary/50 shadow-lg shadow-primary/10" src={userPersona.avatar} alt="User" />
            <div className="ml-3 min-w-0">
              <p className="text-sm font-bold text-white flex items-center gap-1 truncate uppercase tracking-tighter">{userPersona.name} {userPersona.name === 'Lucel' && <Bird size={12} className="text-primary fill-primary" />}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">CONECTADO</p>
            </div>
          </div>
          <button onClick={() => { openSettings(); onClose(); }} className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 border border-gray-700 hover:border-primary rounded-xl text-xs text-gray-300 font-bold transition-all uppercase tracking-widest shadow-inner"><Settings size={16} /> {t.settings}</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;