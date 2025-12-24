import React, { useState, useEffect, useRef } from 'react';
import { X, Palette, Image as ImageIcon, Globe, Monitor, Layout, Type, MousePointer, ShieldCheck, Save, RotateCcw, Volume2, Bell, Eye, Zap, Database, Pipette, LogOut, Brush, Smartphone, MessageCircle, Sidebar, PanelTop, Plus, Trash, DownloadCloud, UploadCloud, AlertTriangle, Clipboard, ClipboardCopy, Search, FileText, Key, Check, Copy, HardDrive, Cpu, Loader2, FileJson, Share2, FileCode, Binary, FileType, ExternalLink } from 'lucide-react';
import { AppSettings, CardStyle, FontFamily } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
  onLogout: () => void;
  t: any;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, settings: initialSettings, onSaveSettings, onResetSettings, onLogout, t
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'styles' | 'system' | 'privacy' | 'data'>('visual');
  const [tempSettings, setTempSettings] = useState<AppSettings>(initialSettings);
  const [newCatInput, setNewCatInput] = useState('');
  
  // --- FILE SYSTEM REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processStatus, setProcessStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTempSettings(initialSettings);
        setProcessStatus('idle');
        setStatusMsg('');
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const updateTemp = (updates: Partial<AppSettings>) => {
    setTempSettings(prev => ({ ...prev, ...updates }));
    if (updates.hapticFeedback === true && navigator.vibrate) navigator.vibrate(50);
  };

  const handleAddCategory = () => {
      if(newCatInput.trim()) {
          updateTemp({ customCategories: [...(tempSettings.customCategories || []), newCatInput.trim()] });
          setNewCatInput('');
      }
  };

  const handleRemoveCategory = (cat: string) => {
      updateTemp({ customCategories: (tempSettings.customCategories || []).filter(c => c !== cat) });
  };

  const applyPreset = (preset: AppSettings['themePreset']) => {
      let newSettings: Partial<AppSettings> = { themePreset: preset };
      switch (preset) {
          case 'whatsapp':
              newSettings = { primaryColor: '#25D366', appBackgroundColor: '#0b141a', sidebarColor: '#111b21', topbarColor: '#202c33', cardStyle: 'solid', fontFamily: 'Inter', borderRadius: 'lg', categoryShape: 'rounded' }; break;
          case 'instagram':
              newSettings = { primaryColor: '#E1306C', appBackgroundColor: '#000000', sidebarColor: '#000000', topbarColor: '#000000', cardStyle: 'minimal', fontFamily: 'Inter', borderRadius: 'md', categoryShape: 'square' }; break;
          case 'facebook':
              newSettings = { primaryColor: '#1877F2', appBackgroundColor: '#18191a', sidebarColor: '#242526', topbarColor: '#242526', cardStyle: 'solid', fontFamily: 'Inter', borderRadius: 'full', categoryShape: 'pill' }; break;
          case 'character_ai':
              newSettings = { primaryColor: '#3b82f6', appBackgroundColor: '#111827', sidebarColor: '#1f2937', topbarColor: '#1f2937', cardStyle: 'solid', fontFamily: 'Roboto', borderRadius: 'none', categoryShape: 'pill' }; break;
          case 'poly_ai':
              newSettings = { primaryColor: '#d946ef', appBackgroundColor: '#2a0a3b', sidebarColor: '#1a0526', topbarColor: '#4c1d95', cardStyle: 'neon', fontFamily: 'Rajdhani', borderRadius: 'lg', categoryShape: 'rounded' }; break;
          case 'telegram':
              newSettings = { primaryColor: '#229ED9', appBackgroundColor: '#0f172a', sidebarColor: '#1e293b', topbarColor: '#229ED9', cardStyle: 'glass', fontFamily: 'Inter', borderRadius: 'md', categoryShape: 'pill' }; break;
          case 'custom': default: break;
      }
      updateTemp(newSettings);
  };

  // --- NEW: PORTABLE DOWNLOAD PAGE GENERATOR ---
  const generateDownloadPage = (jsonData: string, fileName: string) => {
      // Creamos un HTML string que contiene los datos y el código para autodescargarse
      // Esto crea una "mini web" segura donde el navegador no se bloquea
      return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lucel Download Center</title>
    <style>
        body { background-color: #050505; color: white; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .card { background: #111; border: 1px solid #333; padding: 40px; border-radius: 20px; box-shadow: 0 0 50px rgba(245, 158, 11, 0.2); max-width: 90%; width: 400px; }
        h1 { color: #f59e0b; margin-bottom: 10px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
        p { color: #888; font-size: 12px; margin-bottom: 30px; }
        .btn { background: #f59e0b; color: black; border: none; padding: 15px 30px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s; display: inline-block; text-decoration: none; }
        .btn:hover { transform: scale(1.05); background: #ffb300; }
        .data-info { background: #222; padding: 10px; border-radius: 5px; font-size: 10px; color: #555; margin-top: 20px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Archivo Listo</h1>
        <p>Tu copia de seguridad de Lucel ha sido generada con éxito.</p>
        
        <a id="downloadBtn" class="btn">DESCARGAR AHORA</a>
        
        <div class="data-info">
            ARCHIVO: ${fileName}<br>
            TAMAÑO: ${(jsonData.length / 1024).toFixed(2)} KB
        </div>
        <p style="margin-top: 20px; color: #444;">Si la descarga no inicia automáticamente, toca el botón.</p>
    </div>

    <script>
        // Inyectamos los datos de forma segura
        const rawData = ${JSON.stringify(jsonData)};
        const fileName = "${fileName}";
        
        function triggerDownload() {
            const blob = new Blob([rawData], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.getElementById('downloadBtn');
            a.href = url;
            a.download = fileName;
            
            // Intento de autodescarga
            a.click();
        }

        // Ejecutar al cargar
        window.onload = () => {
            setTimeout(triggerDownload, 500);
        };
    </script>
</body>
</html>`;
  };

  const downloadBackup = (format: 'json' | 'txt' | 'lucel' | 'bin') => {
      try {
          setProcessStatus('processing');
          setStatusMsg('Empaquetando memoria...');

          setTimeout(() => {
              // 1. Recopilar Datos
              const allData: Record<string, any> = {};
              let count = 0;
              for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('lucel_')) {
                      allData[key] = localStorage.getItem(key);
                      count++;
                  }
              }

              // 2. Estructura Segura
              const backupObject = {
                  signature: "LUCEL_BACKUP_V26",
                  timestamp: Date.now(),
                  version: "26.0",
                  data: allData
              };

              // 3. Generar contenido JSON
              const jsonContent = JSON.stringify(backupObject, null, 2);
              
              // 4. Nombre del archivo
              const date = new Date().toISOString().slice(0,10).replace(/-/g, '');
              const fileName = `LUCEL_BACKUP_${date}.${format}`;

              // 5. AQUÍ ESTÁ LA MAGIA: Generar la "Web de Descarga"
              // En lugar de bajar el archivo directo, bajamos una página HTML que contiene el archivo
              const htmlPage = generateDownloadPage(jsonContent, fileName);
              
              const pageBlob = new Blob([htmlPage], { type: "text/html" });
              const pageUrl = URL.createObjectURL(pageBlob);

              // 6. Abrir la "Web de Descarga" en nueva pestaña
              const newWindow = window.open(pageUrl, '_blank');
              
              if (!newWindow) {
                  alert("⚠️ El navegador bloqueó la ventana emergente.\nPor favor permite ventanas emergentes para descargar.");
              }

              setProcessStatus('success');
              setStatusMsg('Abriendo Centro de Descarga...');
              
              // Limpieza
              setTimeout(() => {
                  URL.revokeObjectURL(pageUrl);
              }, 60000); // Damos 1 minuto para que la nueva pestaña cargue
          }, 500);
          
      } catch (e) {
          console.error(e);
          setProcessStatus('error');
          setStatusMsg('Error al generar archivo.');
      }
  };

  const triggerImport = () => {
      fileInputRef.current?.click();
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
          processFile(files[0]);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
  };

  const processFile = (file: File) => {
      setProcessStatus('processing');
      setStatusMsg('Leyendo archivo...');
      setProgress(0);

      const reader = new FileReader();
      
      reader.onload = async (event) => {
          try {
              const content = event.target?.result as string;
              
              setStatusMsg('Analizando datos...');
              
              let parsedData: any = {};
              try {
                  parsedData = JSON.parse(content);
              } catch (parseError) {
                  throw new Error("El archivo no tiene formato válido (JSON).");
              }

              // Lógica inteligente de detección
              let itemsToRestore: Record<string, string> = {};

              // 1. Formato Nuevo V26
              if (parsedData.signature && parsedData.data) {
                  itemsToRestore = parsedData.data;
              } 
              // 2. Formato Antiguo / Plano
              else {
                  if (!Object.keys(parsedData).some(k => k.startsWith('lucel_'))) {
                      if (!confirm("⚠️ Este archivo no parece ser de Lucel. ¿Continuar?")) {
                          setProcessStatus('idle'); setStatusMsg(''); return;
                      }
                  }
                  itemsToRestore = parsedData;
              }

              const keys = Object.keys(itemsToRestore).filter(k => k.startsWith('lucel_'));
              const totalItems = keys.length;

              if (totalItems === 0) throw new Error("Archivo vacío.");

              setStatusMsg('Restaurando...');
              
              // Limpieza segura
              const currentKeys = [];
              for(let i=0; i<localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if(k && k.startsWith('lucel_')) currentKeys.push(k);
              }
              currentKeys.forEach(k => localStorage.removeItem(k));
              
              // Escritura segura por lotes (Anti-Crash)
              let currentIndex = 0;
              const BATCH_SIZE = 50; 

              const processBatch = () => {
                  try {
                      const limit = Math.min(currentIndex + BATCH_SIZE, totalItems);
                      for (let i = currentIndex; i < limit; i++) {
                          const key = keys[i];
                          const value = itemsToRestore[key];
                          const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
                          localStorage.setItem(key, valueToStore);
                      }
                      currentIndex = limit;
                      const percent = Math.round((currentIndex / totalItems) * 100);
                      setProgress(percent);
                      setStatusMsg(`Restaurando... ${percent}%`);

                      if (currentIndex < totalItems) {
                          requestAnimationFrame(processBatch);
                      } else {
                          setProcessStatus('success');
                          setStatusMsg('¡COMPLETADO!');
                          alert(`¡DATOS RESTAURADOS! (${totalItems} items)\nLa aplicación se reiniciará.`);
                          window.location.reload();
                      }
                  } catch (err: any) {
                      setProcessStatus('error');
                      setStatusMsg('Error Crítico.');
                      alert("Error durante la restauración: " + err.message);
                  }
              };
              setTimeout(processBatch, 100);

          } catch (err: any) {
              setProcessStatus('error');
              setStatusMsg('Archivo inválido.');
              alert("Error al leer el archivo: " + err.message);
          }
      };
      reader.readAsText(file);
  };

  const languages = ["Español (Latinoamérica)", "English (US)", "Français", "Português (Brasil)"];

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
        <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('visual')} className={`flex-1 min-w-[80px] py-4 text-xs md:text-sm font-bold uppercase tracking-wider ${activeTab === 'visual' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>{t.visual}</button>
            <button onClick={() => setActiveTab('styles')} className={`flex-1 min-w-[80px] py-4 text-xs md:text-sm font-bold uppercase tracking-wider ${activeTab === 'styles' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>ESTILOS</button>
            <button onClick={() => setActiveTab('system')} className={`flex-1 min-w-[80px] py-4 text-xs md:text-sm font-bold uppercase tracking-wider ${activeTab === 'system' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500'}`}>{t.system_tab}</button>
            <button onClick={() => setActiveTab('data')} className={`flex-1 min-w-[80px] py-4 text-xs md:text-sm font-bold uppercase tracking-wider ${activeTab === 'data' ? 'text-green-400 border-b-2 border-green-500 bg-green-900/10' : 'text-gray-500'}`}>{t.data || "DATOS"}</button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
          
          {/* VISUAL TAB */}
          {activeTab === 'visual' && (
              <>
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase"><Palette size={16} className="text-primary" /> {t.color_neon}</label>
                    <div className="grid grid-cols-8 gap-3">
                    {['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e', '#ffffff', '#000000', '#ff5722', '#795548', '#607d8b', '#ffeb3b'].map(color => (
                        <button key={color} onClick={() => updateTemp({ primaryColor: color, themePreset: 'custom' })} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${tempSettings.primaryColor === color ? 'border-white shadow-[0_0_10px_white]' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><Pipette size={12}/> Fondo General</label>
                        <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-lg border border-gray-800">
                            <input type="color" value={tempSettings.appBackgroundColor || '#0f172a'} onChange={(e) => updateTemp({ appBackgroundColor: e.target.value, themePreset: 'custom' })} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"/>
                            <span className="text-xs text-gray-500 font-mono">{tempSettings.appBackgroundColor}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><Sidebar size={12}/> Barra Lateral</label>
                        <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-lg border border-gray-800">
                            <input type="color" value={tempSettings.sidebarColor || '#020617'} onChange={(e) => updateTemp({ sidebarColor: e.target.value, themePreset: 'custom' })} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"/>
                            <span className="text-xs text-gray-500 font-mono">{tempSettings.sidebarColor}</span>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"><PanelTop size={12}/> Barra Superior</label>
                        <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-lg border border-gray-800">
                            <input type="color" value={tempSettings.topbarColor || '#020617'} onChange={(e) => updateTemp({ topbarColor: e.target.value, themePreset: 'custom' })} className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"/>
                            <span className="text-xs text-gray-500 font-mono">{tempSettings.topbarColor}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-800">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase"><Layout size={16} className="text-primary" /> Diseño de Categorías</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-2">FORMA</label>
                            <select value={tempSettings.categoryShape || 'pill'} onChange={(e) => updateTemp({ categoryShape: e.target.value as any })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs outline-none">
                                <option value="pill">Píldora</option>
                                <option value="square">Cuadrado</option>
                                <option value="rounded">Bordes Suaves</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 block mb-2">TAMAÑO</label>
                            <select value={tempSettings.categorySize || 'md'} onChange={(e) => updateTemp({ categorySize: e.target.value as any })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white text-xs outline-none">
                                <option value="sm">Pequeño</option>
                                <option value="md">Mediano</option>
                                <option value="lg">Grande</option>
                            </select>
                        </div>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-2">
                        <label className="text-[10px] font-bold text-gray-500 block mb-2 uppercase">Categorías Personalizadas</label>
                        <div className="flex gap-2 mb-3">
                            <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)} placeholder="Nueva..." className="flex-1 bg-black border border-gray-700 rounded p-2 text-xs text-white outline-none"/>
                            <button onClick={handleAddCategory} className="bg-primary text-black p-2 rounded hover:bg-yellow-400"><Plus size={14}/></button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(tempSettings.customCategories || []).map(cat => (
                                <span key={cat} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded flex items-center gap-1">
                                    {cat} <button onClick={() => handleRemoveCategory(cat)}><X size={10} className="hover:text-red-500"/></button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === 'styles' && (
              <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => applyPreset('whatsapp')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><MessageCircle size={24} className="text-[#25D366]"/><span className="font-bold text-white text-sm">WhatsApp</span></button>
                      <button onClick={() => applyPreset('instagram')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"></div><span className="font-bold text-white text-sm">Instagram</span></button>
                      <button onClick={() => applyPreset('facebook')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center font-bold text-white text-xs">f</div><span className="font-bold text-white text-sm">Facebook</span></button>
                      <button onClick={() => applyPreset('poly_ai')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><Zap size={24} className="text-[#d946ef]"/><span className="font-bold text-white text-sm">Poly.AI</span></button>
                       <button onClick={() => applyPreset('character_ai')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><Type size={24} className="text-blue-400"/><span className="font-bold text-white text-sm">Character.AI</span></button>
                       <button onClick={() => applyPreset('telegram')} className="p-4 rounded-xl border border-gray-800 bg-gray-900 flex flex-col items-center gap-2"><div className="bg-[#229ED9] w-6 h-6 rounded-full"></div><span className="font-bold text-white text-sm">Telegram</span></button>
                  </div>
              </div>
          )}

          {activeTab === 'system' && (
              <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase"><Globe size={16} className="text-primary" /> {t.language}</label>
                  <select value={tempSettings.language} onChange={(e) => updateTemp({ language: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none">
                      {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                  <div className="space-y-4 border-t border-gray-800 pt-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase"><LogOut size={16} className="text-red-500" /> Sesión</label>
                    <button onClick={() => { onClose(); onLogout(); }} className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"><LogOut size={18} /> CERRAR SESIÓN</button>
                </div>
              </div>
          )}

          {/* NEW DATA TAB - MULTI FORMAT */}
          {activeTab === 'data' && (
              <div className="space-y-8 animate-fade-in pb-10">
                  
                  {/* EXPORT SECTION */}
                  <div className="space-y-6">
                      <div className="flex items-start gap-3">
                          <DownloadCloud className="text-yellow-400" size={24}/>
                          <div>
                              <h4 className="text-sm font-bold text-yellow-400 uppercase">GUARDAR MEMORIA (Generar Web)</h4>
                              <p className="text-[10px] text-gray-400 max-w-sm">
                                Crea un <b>Centro de Descarga</b> temporal en una nueva pestaña.
                                <br/>Evita errores de memoria en celulares.
                              </p>
                          </div>
                      </div>

                      <div className="bg-yellow-900/10 p-4 rounded-xl border border-yellow-600/30 flex flex-col space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => downloadBackup('json')} className="flex flex-col items-center justify-center p-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-bold transition-all shadow-lg active:scale-95 group">
                                  <FileJson size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
                                  <span className="text-xs">GENERAR .JSON</span>
                                  <span className="text-[9px] opacity-70">Recomendado</span>
                              </button>
                              <button onClick={() => downloadBackup('txt')} className="flex flex-col items-center justify-center p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 group">
                                  <FileText size={24} className="mb-2 group-hover:scale-110 transition-transform"/>
                                  <span className="text-xs">GENERAR .TXT</span>
                                  <span className="text-[9px] opacity-70">Texto Plano</span>
                              </button>
                          </div>
                          <div className="flex items-center gap-2 bg-yellow-900/20 p-2 rounded border border-yellow-900/40">
                              <ExternalLink size={12} className="text-yellow-500"/>
                              <p className="text-[10px] text-yellow-200">Se abrirá una nueva pestaña para descargar el archivo.</p>
                          </div>
                          {statusMsg && <p className="text-center text-xs text-yellow-500 font-mono animate-pulse">{statusMsg}</p>}
                      </div>
                  </div>

                  <div className="border-t border-gray-800"></div>

                  {/* IMPORT SECTION */}
                  <div className="space-y-6">
                      <div className="flex items-start gap-3">
                          <UploadCloud className="text-blue-400" size={24}/>
                          <div>
                              <h4 className="text-sm font-bold text-blue-400 uppercase">CARGAR MEMORIA (Importar)</h4>
                              <p className="text-[10px] text-gray-400">
                                  Arrastra aquí cualquier archivo (.json, .txt, .lucel) para restaurar.
                              </p>
                          </div>
                      </div>

                      <div 
                          className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center text-center space-y-4 transition-all ${isDragging ? 'bg-blue-500/20 border-blue-400 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-blue-900/10 border-blue-500/30'}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                      >
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              accept=".json,.txt,.lucel,.bin" 
                              className="hidden" 
                              onChange={handleFileSelect} 
                          />
                          
                          {processStatus === 'processing' ? (
                              <div className="w-full bg-black/50 rounded-full h-4 border border-blue-500/50 overflow-hidden relative">
                                   <div 
                                      className="h-full bg-blue-500 transition-all duration-300 ease-out flex items-center justify-center text-[9px] text-white font-bold"
                                      style={{ width: `${progress}%` }}
                                   >
                                      {progress}%
                                   </div>
                              </div>
                          ) : (
                              <div className="text-blue-300 flex flex-col items-center gap-3 pointer-events-none">
                                  <UploadCloud size={40} className={isDragging ? 'animate-bounce text-white' : ''}/>
                                  <div className="flex flex-col">
                                      <span className="text-sm font-black uppercase tracking-widest">{isDragging ? '¡SUELTA EL ARCHIVO!' : 'ARRASTRA AQUÍ'}</span>
                                      <span className="text-[10px] text-blue-400/70">o toca el botón de abajo</span>
                                  </div>
                              </div>
                          )}
                          
                          {processStatus === 'processing' && (
                              <p className="text-xs text-blue-300 animate-pulse font-mono">{statusMsg}</p>
                          )}

                          <button 
                            onClick={triggerImport} 
                            disabled={processStatus === 'processing'}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 mt-4"
                          >
                              {processStatus === 'processing' ? <Loader2 size={18} className="animate-spin"/> : <HardDrive size={18}/>} 
                              ELEGIR ARCHIVO
                          </button>
                      </div>
                  </div>
              </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-black/40 flex justify-between gap-4">
             <button onClick={() => { onResetSettings(); onClose(); }} className="px-6 py-3 rounded-lg border border-red-900/50 text-red-400 font-bold hover:bg-red-900/20 flex items-center gap-2 transition-colors"><RotateCcw size={18} /> {t.reset}</button>
             <button onClick={() => { onSaveSettings(tempSettings); onClose(); }} className="flex-1 px-6 py-3 rounded-lg bg-primary text-black font-bold hover:bg-yellow-400 flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"><Save size={18} /> {t.save}</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;