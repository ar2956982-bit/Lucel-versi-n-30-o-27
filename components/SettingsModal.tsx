import React, { useState, useEffect } from 'react';
import { X, Palette, Image as ImageIcon, Globe, Monitor, Layout, Type, MousePointer, ShieldCheck, Save, RotateCcw, Volume2, Bell, Eye, Zap, Database, Pipette, LogOut } from 'lucide-react';
import { AppSettings, CardStyle, FontFamily } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
  onLogout: () => void; // Added Logout Prop
  t: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings: initialSettings, onSaveSettings, onResetSettings, onLogout, t
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'system' | 'privacy'>('visual');
  const [tempSettings, setTempSettings] = useState<AppSettings>(initialSettings);

  // Sync when opening
  useEffect(() => {
    if (isOpen) setTempSettings(initialSettings);
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const updateTemp = (updates: Partial<AppSettings>) => {
    setTempSettings(prev => ({ ...prev, ...updates }));
    if (updates.hapticFeedback !== undefined && updates.hapticFeedback === true) {
        if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateTemp({ globalBg: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const languages = [
      "Español (Latinoamérica)", 
      "English (US)", 
      "Français", 
      "Português (Brasil)"
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b0d10] border border-primary/50 rounded-2xl w-full max-w-3xl shadow-[0_0_50px_rgba(var(--primary),0.2)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black rounded-t-2xl">
          <h2 className="text-xl font-bold text-primary font-brand flex items-center gap-2">
            <Monitor className="animate-pulse" /> {t.settings || "CONFIGURACIÓN"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
            <button onClick={() => setActiveTab('visual')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'visual' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>{t.visual}</button>
            <button onClick={() => setActiveTab('system')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'system' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>{t.system_tab}</button>
            <button onClick={() => setActiveTab('privacy')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider ${activeTab === 'privacy' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>{t.privacy}</button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {activeTab === 'visual' && (
              <>
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Palette size={16} className="text-primary" /> {t.color_neon}
                    </label>
                    <div className="grid grid-cols-8 gap-3">
                    {['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e', '#ffffff', '#000000', '#ff5722', '#795548', '#607d8b', '#ffeb3b'].map(color => (
                        <button
                        key={color}
                        onClick={() => updateTemp({ primaryColor: color })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${tempSettings.primaryColor === color ? 'border-white shadow-[0_0_10px_white]' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                        />
                    ))}
                    </div>
                </div>

                 <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Pipette size={16} className="text-primary" /> {t.app_bg}
                    </label>
                    <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
                        <input 
                            type="color" 
                            value={tempSettings.appBackgroundColor || '#0f172a'}
                            onChange={(e) => updateTemp({ appBackgroundColor: e.target.value })}
                            className="w-12 h-12 rounded cursor-pointer border-none bg-transparent"
                        />
                        <div className="flex-1">
                            <p className="text-white font-bold">Solid Color</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Layout size={16} className="text-primary" /> {t.card_style}
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {(['glass', 'solid', 'neon', 'minimal', 'holographic', 'cyberpunk'] as CardStyle[]).map(style => (
                            <button
                                key={style}
                                onClick={() => updateTemp({ cardStyle: style })}
                                className={`p-4 rounded-lg border text-sm font-bold capitalize transition-all ${tempSettings.cardStyle === style ? 'border-primary bg-primary/10 text-primary' : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-600'}`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                        <Type size={16} className="text-primary" /> {t.typography}
                        </label>
                        <select 
                            value={tempSettings.fontFamily}
                            onChange={(e) => updateTemp({ fontFamily: e.target.value as any })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary"
                        >
                            <option value="Inter">Modern (Inter)</option>
                            <option value="Roboto">Classic (Roboto)</option>
                            <option value="Courier New">Terminal (Courier)</option>
                            <option value="Rajdhani">Cyber (Rajdhani)</option>
                        </select>
                    </div>
                     <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                        <Layout size={16} className="text-primary" /> {t.radius}
                        </label>
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                             {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                                 <button key={r} onClick={() => updateTemp({ borderRadius: r as any })} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${tempSettings.borderRadius === r ? 'bg-primary text-black' : 'text-gray-500'}`}>{r}</button>
                             ))}
                        </div>
                    </div>
                 </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <ImageIcon size={16} className="text-primary" /> {t.wallpaper}
                    </label>
                    <div className="flex flex-col gap-3">
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-primary hover:bg-white/5 transition-all overflow-hidden relative group">
                            {tempSettings.globalBg ? (
                                <img src={tempSettings.globalBg} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            ) : null}
                            <div className="z-10 flex flex-col items-center">
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary" />
                                <span className="text-xs text-gray-500 font-bold uppercase">Upload HD</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        {tempSettings.globalBg && (
                            <button onClick={() => updateTemp({ globalBg: null })} className="text-xs text-red-400 hover:text-red-300 text-center font-bold uppercase tracking-wider">{t.delete}</button>
                        )}
                    </div>
                </div>
              </>
          )}

          {activeTab === 'system' && (
              <>
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Globe size={16} className="text-primary" /> {t.language}
                    </label>
                    <select 
                    value={tempSettings.language}
                    onChange={(e) => updateTemp({ language: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary"
                    >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Volume2 size={16} className="text-primary" /> {t.audio}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                         <div onClick={() => updateTemp({ soundEnabled: !tempSettings.soundEnabled })} className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between ${tempSettings.soundEnabled ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900'}`}>
                             <span className="text-sm font-bold">SFX</span>
                             <div className={`w-3 h-3 rounded-full ${tempSettings.soundEnabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                         </div>
                         <div onClick={() => updateTemp({ hapticFeedback: !tempSettings.hapticFeedback })} className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between ${tempSettings.hapticFeedback ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900'}`}>
                             <span className="text-sm font-bold">Haptic</span>
                             <div className={`w-3 h-3 rounded-full ${tempSettings.hapticFeedback ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                         </div>
                    </div>
                </div>

                 <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Bell size={16} className="text-primary" /> {t.notifications}
                    </label>
                     <div onClick={() => updateTemp({ notifications: !tempSettings.notifications })} className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between ${tempSettings.notifications ? 'border-green-500 bg-green-500/10' : 'border-gray-800 bg-gray-900'}`}>
                        <span className="text-sm font-bold">Status</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${tempSettings.notifications ? 'bg-green-500' : 'bg-gray-600'}`}>
                             <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${tempSettings.notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                     </div>
                </div>

                <div className="space-y-4 border-t border-gray-800 pt-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <LogOut size={16} className="text-red-500" /> Sesión
                    </label>
                    <button 
                        onClick={() => { onClose(); onLogout(); }} 
                        className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <LogOut size={18} /> CERRAR SESIÓN (Volver al Inicio)
                    </button>
                </div>
              </>
          )}

          {activeTab === 'privacy' && (
              <>
                 <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <ShieldCheck size={16} className="text-primary" /> {t.security}
                    </label>
                    
                    <div onClick={() => updateTemp({ incognitoMode: !tempSettings.incognitoMode })} className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between ${tempSettings.incognitoMode ? 'border-purple-500 bg-purple-500/10' : 'border-gray-800 bg-gray-900'}`}>
                             <div>
                                <span className="text-sm font-bold block text-white">{t.incognito}</span>
                             </div>
                             <Eye size={20} className={tempSettings.incognitoMode ? 'text-purple-400' : 'text-gray-600'} />
                    </div>

                    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900">
                         <span className="text-sm font-bold block text-white mb-2">{t.safety}</span>
                         <div className="flex bg-black rounded p-1">
                             {(['none', 'standard', 'strict'] as const).map(f => (
                                 <button key={f} onClick={() => updateTemp({ safetyFilter: f })} className={`flex-1 py-1 text-xs uppercase font-bold rounded ${tempSettings.safetyFilter === f ? 'bg-primary text-black' : 'text-gray-500'}`}>{f}</button>
                             ))}
                         </div>
                    </div>
                 </div>
                
                 <div className="space-y-4 border-t border-gray-800 pt-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase">
                    <Database size={16} className="text-primary" /> {t.data}
                    </label>
                    <button className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-bold">
                        {t.delete_data}
                    </button>
                 </div>
              </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-800 bg-black/40 flex justify-between gap-4">
             <button 
                onClick={() => {
                    onResetSettings();
                    onClose(); 
                }}
                className="px-6 py-3 rounded-lg border border-red-900/50 text-red-400 font-bold hover:bg-red-900/20 flex items-center gap-2 transition-colors"
             >
                 <RotateCcw size={18} /> {t.reset}
             </button>
             <button 
                onClick={() => { onSaveSettings(tempSettings); onClose(); }}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-yellow-400 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
             >
                 <Save size={18} /> {t.save}
             </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;