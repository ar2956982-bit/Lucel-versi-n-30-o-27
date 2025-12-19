import React, { useState } from 'react';
import { Search, MoreVertical, Edit2, Copy, EyeOff, Trash2 } from 'lucide-react';
import { Character, CardStyle } from '../types';

interface DashboardProps {
  characters: Character[];
  onSelectCharacter: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onDuplicateCharacter: (char: Character) => void;
  onHideCharacter: (id: string) => void;
  onEditCharacter: (char: Character) => void;
  isHiddenModeActive: boolean;
  cardStyle: CardStyle;
  t: any; // Translations
}

const Dashboard: React.FC<DashboardProps> = ({ 
  characters, onSelectCharacter, onDeleteCharacter, onDuplicateCharacter, onHideCharacter, onEditCharacter,
  isHiddenModeActive, cardStyle, t
}) => {
  const [filter, setFilter] = useState('Para ti');
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredCharacters = characters.filter(c => {
    if (c.isHidden && !isHiddenModeActive) return false;
    
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filter === 'Para ti' || c.category === filter || filter === 'Favoritos';
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['Para ti', 'Anime', 'Terror', 'Películas', 'Drama', 'Rol', 'Oculto'];

  // Card Style Classes
  const getCardClasses = () => {
      switch(cardStyle) {
          case 'glass': return 'bg-white/5 backdrop-blur-md border border-white/10';
          case 'solid': return 'bg-[#111827] border border-gray-800';
          case 'neon': return 'bg-black border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]';
          case 'minimal': return 'bg-transparent border-none';
          default: return 'bg-[#111827]';
      }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in" onClick={() => setActiveMenuId(null)}>
       {/* Search Area */}
       <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#0b0d10] rounded-2xl flex items-center px-5 py-3 border border-gray-800 focus-within:border-primary transition-all shadow-lg">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder={t.search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 text-sm"
                  />
              </div>
          </div>
      </div>

      {/* Categories */}
      <div className="category-scroll mb-8 pb-2">
        {categories.map(cat => (
          <div 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`category-item px-4 py-1 rounded-full text-sm font-bold transition-all ${filter === cat ? 'bg-primary text-black' : 'text-gray-400 hover:text-white bg-gray-900 border border-gray-800'}`}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filteredCharacters.map(char => (
          <div 
            key={char.id} 
            className={`group relative rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${getCardClasses()}`}
            // REMOVED OVERFLOW-HIDDEN FROM PARENT TO ALLOW MENU POPUP
          >
            {/* IMAGE CONTAINER WITH CLIPPING */}
            <div 
                onClick={() => onSelectCharacter(char.id)}
                className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative"
            >
                <img src={char.avatar} alt={char.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${char.isHidden ? 'grayscale opacity-50' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                
                {/* Stats Overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold font-brand text-xl truncate mb-1 shadow-black drop-shadow-md flex items-center gap-1">
                        {char.name}
                        {char.isHidden && <EyeOff size={14} className="text-red-500"/>}
                    </h3>
                    <p className="text-gray-300 text-xs line-clamp-2 leading-tight opacity-80">{char.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {char.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] uppercase font-bold bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
              
            {/* Card Options (3 DOTS) - OUTSIDE OVERFLOW HIDDEN CONTAINER */}
            <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveMenuId(activeMenuId === char.id ? null : char.id); 
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur rounded-full hover:bg-primary text-white hover:text-black transition-colors z-30 shadow-lg border border-white/10"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {/* DROPDOWN MENU - ABSOLUTE Z-50 */}
            {activeMenuId === char.id && (
                <div 
                    className="absolute top-10 right-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-fade-in" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                    onClick={(e) => { e.stopPropagation(); onEditCharacter(char); setActiveMenuId(null); }} 
                    className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"
                    >
                        <Edit2 size={12} /> {t.edit}
                    </button>
                    <button 
                    onClick={(e) => { e.stopPropagation(); onDuplicateCharacter(char); setActiveMenuId(null); }} 
                    className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"
                    >
                        <Copy size={12} /> {t.duplicate}
                    </button>
                    <button 
                    onClick={(e) => { e.stopPropagation(); onHideCharacter(char.id); setActiveMenuId(null); }} 
                    className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-orange-400 flex items-center gap-2"
                    >
                        <EyeOff size={12} /> {char.isHidden ? 'Mostrar' : t.hide}
                    </button>
                    <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onDeleteCharacter(char.id); 
                        setActiveMenuId(null); 
                    }} 
                    className="w-full text-left px-3 py-3 text-xs hover:bg-red-500/20 text-red-500 flex items-center gap-2 border-t border-gray-800"
                    >
                        <Trash2 size={12} /> {t.delete}
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredCharacters.length === 0 && (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl mt-10">
          <p>{t.empty}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;