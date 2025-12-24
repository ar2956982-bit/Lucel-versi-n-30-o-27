import React, { useState } from 'react';
import { Search, MoreVertical, Edit2, Copy, EyeOff, Trash2, Heart, Star, MessageCircle, Share2, Download } from 'lucide-react';
import { Character, CardStyle, AppSettings } from '../types';

interface DashboardProps {
  characters: Character[];
  onSelectCharacter: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onDuplicateCharacter: (char: Character) => void;
  onHideCharacter: (id: string) => void;
  onEditCharacter: (char: Character) => void;
  isHiddenModeActive: boolean;
  cardStyle: CardStyle;
  themePreset?: AppSettings['themePreset']; // Added themePreset for layout changes
  t: any; // Translations
  onToggleFavorite?: (id: string) => void;
  settings?: AppSettings; // Added settings for Category Styles
}

const Dashboard: React.FC<DashboardProps> = ({ 
  characters, onSelectCharacter, onDeleteCharacter, onDuplicateCharacter, onHideCharacter, onEditCharacter,
  isHiddenModeActive, cardStyle, t, onToggleFavorite, themePreset, settings
}) => {
  // Use Translation Keys for Categories
  const defaultCategories = [
      { key: 'cat_foryou', val: 'Para ti' },
      { key: 'cat_fav', val: 'Favoritos' },
      { key: 'cat_anime', val: 'Anime' },
      { key: 'cat_horror', val: 'Terror' },
      { key: 'cat_movies', val: 'Películas' },
      { key: 'cat_drama', val: 'Drama' },
      { key: 'cat_role', val: 'Rol' },
      { key: 'cat_hidden', val: 'Oculto' },
      { key: 'cat_series', val: 'Series' },
      { key: 'cat_fanart', val: 'Fanart' },
      { key: 'cat_oc', val: 'OC' }
  ];

  // Merge Defaults with Custom Categories from Settings
  const allCategories = [
      ...defaultCategories,
      ...(settings?.customCategories || []).map(c => ({ key: `custom_${c}`, val: c }))
  ];

  const [filter, setFilter] = useState(defaultCategories[0].val); // Default to 'Para ti' value
  const [search, setSearch] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredCharacters = characters.filter(c => {
    if (c.isHidden && !isHiddenModeActive) return false;
    
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    let matchesCategory = true;

    if (filter === 'Para ti') matchesCategory = true;
    else if (filter === 'Favoritos') matchesCategory = !!c.isFavorite;
    else matchesCategory = c.category === filter;
    
    return matchesSearch && matchesCategory;
  });

  // Card Style Classes (for Default Preset)
  const getCardClasses = () => {
      switch(cardStyle) {
          case 'glass': return 'bg-white/5 backdrop-blur-md border border-white/10';
          case 'solid': return 'bg-[#111827] border border-gray-800';
          case 'neon': return 'bg-black border border-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]';
          case 'minimal': return 'bg-transparent border-none';
          default: return 'bg-[#111827]';
      }
  };

  const handleHide = (id: string, isHidden: boolean) => {
      onHideCharacter(id);
      setActiveMenuId(null);
      if (!isHidden) {
          alert("Se hará visible si presionas en la palabra Lucel en el menú principal");
      }
  };

  const exportCharacter = (char: Character) => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${char.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setActiveMenuId(null);
  };

  // --- DYNAMIC CATEGORY STYLES ---
  const getCategoryClasses = (catVal: string) => {
      let classes = "transition-all cursor-pointer font-bold border ";
      
      // Shape
      if (settings?.categoryShape === 'square') classes += "rounded-md ";
      else if (settings?.categoryShape === 'rounded') classes += "rounded-xl ";
      else classes += "rounded-full "; // Default 'pill'

      // Size
      if (settings?.categorySize === 'sm') classes += "px-3 py-1 text-xs ";
      else if (settings?.categorySize === 'lg') classes += "px-6 py-3 text-base ";
      else classes += "px-4 py-1.5 text-sm "; // Default 'md'

      // Active State
      if (filter === catVal) classes += "bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105 ";
      else classes += "text-gray-400 hover:text-white bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800 ";

      return classes;
  };

  const renderContextMenu = (char: Character) => (
        <div 
            className="absolute top-10 right-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
        >
            <button onClick={(e) => { e.stopPropagation(); onEditCharacter(char); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"><Edit2 size={12} /> {t.edit}</button>
            <button onClick={(e) => { e.stopPropagation(); if(onToggleFavorite) onToggleFavorite(char.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-yellow-400 flex items-center gap-2"><Star size={12} className={char.isFavorite ? 'fill-yellow-400' : ''}/> {char.isFavorite ? 'Quitar Fav' : 'Añadir Fav'}</button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicateCharacter(char); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2"><Copy size={12} /> {t.duplicate}</button>
            <button onClick={(e) => { e.stopPropagation(); exportCharacter(char); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-green-400 flex items-center gap-2"><Download size={12} /> Exportar (JSON)</button>
            <button onClick={(e) => { e.stopPropagation(); handleHide(char.id, !!char.isHidden); }} className="w-full text-left px-3 py-3 text-xs hover:bg-white/10 text-orange-400 flex items-center gap-2"><EyeOff size={12} /> {char.isHidden ? t.show : t.hide}</button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-3 text-xs hover:bg-red-500/20 text-red-500 flex items-center gap-2 border-t border-gray-800"><Trash2 size={12} /> {t.delete}</button>
        </div>
  );

  // --- RENDER LOGIC BASED ON PRESET ---
  const renderCard = (char: Character) => {
      // 1. WHATSAPP STYLE (LIST VIEW)
      if (themePreset === 'whatsapp') {
          return (
              <div key={char.id} className="w-full flex items-center gap-4 p-3 hover:bg-white/5 border-b border-gray-800 cursor-pointer relative group" onClick={() => onSelectCharacter(char.id)}>
                  <img src={char.avatar} className={`w-12 h-12 rounded-full object-cover ${char.isHidden ? 'grayscale' : ''}`} />
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-white text-base truncate flex items-center gap-1">
                              {char.name} {char.isFavorite && <Star size={12} className="fill-yellow-400 text-yellow-400"/>}
                          </h3>
                          <span className="text-[10px] text-gray-500">{new Date().toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">{char.description}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }} className="text-gray-500 hover:text-white p-2 rounded-full"><MoreVertical size={16}/></button>
                  {activeMenuId === char.id && renderContextMenu(char)}
              </div>
          );
      }

      // 2. INSTAGRAM STYLE (POST VIEW)
      if (themePreset === 'instagram') {
          return (
              <div key={char.id} className="bg-black border border-gray-800 rounded-lg overflow-hidden mb-4 relative">
                  {/* Header */}
                  <div className="flex items-center justify-between p-3" onClick={() => onSelectCharacter(char.id)}>
                      <div className="flex items-center gap-2">
                          <img src={char.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-700"/>
                          <span className="text-sm font-bold text-white">{char.name}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }}><MoreVertical size={16}/></button>
                  </div>
                  {/* Image */}
                  <div className="aspect-square w-full cursor-pointer" onClick={() => onSelectCharacter(char.id)}>
                      <img src={char.avatar} className={`w-full h-full object-cover ${char.isHidden ? 'grayscale' : ''}`}/>
                  </div>
                  {/* Action Bar */}
                  <div className="p-3">
                      <div className="flex gap-4 text-white mb-2">
                          <Heart size={20} className={char.isFavorite ? 'text-red-500 fill-red-500' : ''}/>
                          <MessageCircle size={20}/>
                          <Share2 size={20}/>
                      </div>
                      <p className="text-xs text-white"><span className="font-bold">{char.name}</span> {char.description}</p>
                      <p className="text-[10px] text-gray-500 uppercase mt-1">HACE 2 HORAS</p>
                  </div>
                  {activeMenuId === char.id && renderContextMenu(char)}
              </div>
          );
      }

      // 3. FACEBOOK STYLE
      if (themePreset === 'facebook') {
          return (
              <div key={char.id} className="bg-[#242526] rounded-xl overflow-hidden shadow-lg relative cursor-pointer group" onClick={() => onSelectCharacter(char.id)}>
                  <div className="h-24 bg-gray-700 relative">
                      <img src={char.avatar} className="w-full h-full object-cover opacity-50 blur-sm"/>
                  </div>
                  <div className="absolute top-12 left-4 border-4 border-[#242526] rounded-full">
                      <img src={char.avatar} className="w-20 h-20 rounded-full object-cover"/>
                  </div>
                  <div className="pt-10 pb-4 px-4">
                      <h3 className="text-white font-bold text-lg">{char.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{char.description}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }} className="absolute top-2 right-2 text-white bg-black/50 p-1 rounded-full"><MoreVertical size={16}/></button>
                  {activeMenuId === char.id && renderContextMenu(char)}
              </div>
          );
      }

      // 4. CHARACTER.AI STYLE (Minimalist Row/Card)
      if (themePreset === 'character_ai') {
          return (
              <div key={char.id} className="bg-[#1f2937] rounded-none p-4 flex gap-4 hover:bg-[#374151] transition-colors cursor-pointer relative" onClick={() => onSelectCharacter(char.id)}>
                  <img src={char.avatar} className="w-16 h-16 rounded-2xl object-cover"/>
                  <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold">{char.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{char.description}</p>
                      <div className="flex gap-2 mt-2">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1"><MessageCircle size={10}/> 1.2m</span>
                      </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }} className="text-gray-400"><MoreVertical size={16}/></button>
                  {activeMenuId === char.id && renderContextMenu(char)}
              </div>
          );
      }

      // DEFAULT / CUSTOM / TELEGRAM / POLY.AI (Original Card Style)
      return (
          <div key={char.id} className={`group relative rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${getCardClasses()}`}>
            <div onClick={() => onSelectCharacter(char.id)} className="aspect-[3/4] w-full rounded-2xl overflow-hidden relative">
                <img src={char.avatar} alt={char.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${char.isHidden ? 'grayscale opacity-50' : ''}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold font-brand text-xl truncate mb-1 shadow-black drop-shadow-md flex items-center gap-1">
                        {char.name}
                        {char.isHidden && <EyeOff size={14} className="text-red-500"/>}
                        {char.isFavorite && <Star size={14} className="text-yellow-400 fill-yellow-400"/>}
                    </h3>
                    <p className="text-gray-300 text-xs line-clamp-2 leading-tight opacity-80">{char.description}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {char.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] uppercase font-bold bg-white/10 px-1.5 py-0.5 rounded text-gray-300">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === char.id ? null : char.id); }} className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur rounded-full hover:bg-primary text-white hover:text-black transition-colors z-30 shadow-lg border border-white/10"><MoreVertical className="w-4 h-4" /></button>
            {activeMenuId === char.id && renderContextMenu(char)}
          </div>
      );
  };

  // --- GRID CLASS LOGIC ---
  const getGridClasses = () => {
      if (themePreset === 'whatsapp' || themePreset === 'character_ai') return 'flex flex-col gap-1'; // List view
      if (themePreset === 'instagram') return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'; // Post view
      return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5'; // Default Grid
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
        {allCategories.map(cat => (
          <div 
            key={cat.key}
            onClick={() => setFilter(cat.val)}
            className={`category-item ${getCategoryClasses(cat.val)}`}
          >
            {t[cat.key] || cat.val}
          </div>
        ))}
      </div>

      {/* RENDER GRID OR LIST */}
      <div className={getGridClasses()}>
        {filteredCharacters.map(char => renderCard(char))}
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