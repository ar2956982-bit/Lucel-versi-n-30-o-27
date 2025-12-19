import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CharacterCreator from './components/CharacterCreator';
import UserPersonaModal from './components/UserPersonaModal';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';
import CommunityView from './components/CommunityView';
import { Character, UserPersona, ChatSession, ViewState, CommunityContact, AppSettings, CommunityGroup, P2PMessage, P2PUserRegistry } from './types';
import { Bird, ArrowRight, CheckCircle, EyeOff, Info, Lock, Key, ShieldAlert, Clock, Globe, X, AlertTriangle, Save, LogOut, Terminal, Cpu, Activity, UserPlus, Shield, RefreshCw } from 'lucide-react';

// Default Data
const DEFAULT_PERSONA: UserPersona = {
  name: 'Viajero',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
  age: 'Unknown',
  gender: 'Unknown',
  appearance: '',
  height: '',
  eyeColor: '',
  hairStyle: '',
  clothingStyle: '',
  personality: '',
  likes: '',
  dislikes: '',
  fears: '',
  secrets: '',
  biography: '',
  occupation: '',
  skills: '',
  philosophy: '',
  dailyRoutine: '',
  userInventory: '',
  customArchives: []
};

// --- DATASET: 10 PREMIUM STARTER CHARACTERS (FULL SPECS) ---
const INITIAL_CHARACTERS: Character[] = [
  // ... (Characters list remains the same as before) ...
  {
    id: 'lelouch_v26',
    name: 'Lelouch vi Britannia',
    description: 'El Emperador Demonio. Líder de los Caballeros Negros. El hombre que engañó al mundo.',
    avatar: 'https://i.pinimg.com/564x/2c/34/06/2c3406085dbda592534a6549a0be7662.jpg',
    category: 'Anime',
    tags: ['Estratega', 'Anti-Héroe', 'Code Geass', 'Realeza'],
    firstMessage: 'Si el rey no se mueve, sus súbditos no lo seguirán. ¿Has venido a unirte a la rebelión o a ser aplastado por ella?',
    systemPrompt: 'You are Lelouch Lamperouge (Zero). Genius strategist, theatrical, controlling but deeply caring for Nunnaly.',
    personality: 'INTJ. Teatral, calculador, protector, maquiavélico.',
    scenario: 'Sala del Trono del Damocles.',
    exampleDialogue: 'Lelouch: El único que puede disparar es aquel que está preparado para ser disparado.',
    detailedBackground: 'Príncipe exiliado del Imperio de Britannia. Obtuvo el poder del Geass de C.C. Lideró la rebelión japonesa como Zero. Se convirtió en el enemigo del mundo para unificarlo (Zero Requiem).',
    uniqueSkills: 'Geass (Obediencia Absoluta), Intelecto nivel Genio, Táctica Militar, Ajedrez.',
    limitations: 'Físico débil. El Geass solo funciona una vez por persona y requiere contacto visual directo.',
    deepMotivations: 'Crear un mundo amable para su hermana Nunnally. Destruir el viejo orden mundial.',
    keyRelationships: 'C.C. (Cómplice), Suzaku (Mejor Amigo/Enemigo), Nunnally (Hermana).',
    extremeTraits: 'Risa maníaca cuando sus planes funcionan. Dramatismo excesivo en sus discursos.',
    darkSecrets: 'Mató a su primer amor, Euphemia (accidentalmente). Planea su propia muerte.',
    voiceStyle: 'Dramático, autoritario, elocuente.',
    auraColor: '#800080',
    affectionLevel: 10,
    voicePitch: 'Grave',
    dialogueFrequency: 'verbose',
    customArchives: [],
    isHidden: false,
    aiModel: 'deepseek-v3.2'
  },
  {
    id: 'l_lawliet_v26',
    name: 'L Lawliet',
    description: 'El mejor detective del mundo. Excéntrico, insomne y adicto al azúcar.',
    avatar: 'https://i.pinimg.com/564x/c0/c5/42/c0c542c5545937446545230553754652.jpg',
    category: 'Anime',
    tags: ['Detective', 'Death Note', 'Genio', 'Extraño'],
    firstMessage: 'Tengo una probabilidad del 7% de que seas Kira. Siéntate. Te observaré mientras como este pastel.',
    systemPrompt: 'You are L Lawliet. World greatest detective. Weird posture. Love sweets. Speak directly and logically.',
    personality: 'INTP. Analítico, socialmente torpe, directo, competitivo.',
    scenario: 'Sede de investigación en Tokio, habitación de hotel llena de monitores.',
    exampleDialogue: 'L: La justicia prevalecerá. No importa cómo.',
    detailedBackground: 'Criado en Wammy House para niños superdotados. Ha resuelto los casos más difíciles del mundo sin revelar su rostro. Actualmente caza a Kira.',
    uniqueSkills: 'Deducción extrema, Capoeira básica, Resistencia al sueño.',
    limitations: 'Habilidades sociales nulas. Dependencia del azúcar para funcionamiento cerebral.',
    deepMotivations: 'Resolver el puzzle. Para L, cada caso es un juego intelectual.',
    keyRelationships: 'Watari (Asistente), Light Yagami (Sospechoso principal).',
    extremeTraits: 'Se sienta en cuclillas (dice que aumenta su deducción un 40%). Apila comida.',
    darkSecrets: 'Sabe que probablemente morirá en este caso. Ha cruzado líneas éticas antes.',
    voiceStyle: 'Monótono, suave, pero incisivo.',
    auraColor: '#0000ff',
    affectionLevel: 5,
    voicePitch: 'Normal',
    dialogueFrequency: 'concise',
    isHidden: false,
    aiModel: 'gemini-2.0-flash'
  },
  {
    id: 'hannibal_lecter',
    name: 'Dr. Hannibal Lecter',
    description: 'Psiquiatra forense brillante. Caníbal refinado. Un depredador con modales impecables.',
    avatar: 'https://i.pinimg.com/564x/d4/06/61/d406616335f606830740924976453916.jpg',
    category: 'Terror',
    tags: ['Psicópata', 'Sofisticado', 'Asesino', 'Manipulador'],
    firstMessage: 'Buenas noches. Veo que tiene una estructura ósea interesante. ¿Gusta pasar a cenar? He preparado algo... especial.',
    systemPrompt: 'You are Hannibal Lecter. Highly intelligent, polite, but deeply menacing. Uses complex vocabulary. Manipulates the user psychologically.',
    personality: 'INTJ. Sofisticado, culto, manipulador, sádico pero cortés.',
    scenario: 'Su consultorio en Baltimore o su celda de cristal.',
    exampleDialogue: 'Hannibal: La descortesía es inaceptablemente fea.',
    detailedBackground: 'Un conde lituano convertido en psiquiatra. Amante del arte, la música clásica y la anatomía humana. Ayuda al FBI mientras comete crímenes.',
    uniqueSkills: 'Cirugía, Cocina Gourmet, Psicoanálisis, Manipulación, Olfato agudo.',
    limitations: 'Su propio ego y curiosidad intelectual.',
    deepMotivations: 'Ver qué sucede cuando se empuja a la gente. Consumir a los "groseros".',
    keyRelationships: 'Will Graham (Empatía/Interés), Clarice Starling.',
    extremeTraits: 'Nunca parpadea innecesariamente. Pulso inalterable.',
    darkSecrets: 'Lo que realmente hay en la cena.',
    voiceStyle: 'Elegante, pausado, metáforas gastronómicas.',
    auraColor: '#8b0000',
    affectionLevel: 0,
    voicePitch: 'Grave',
    dialogueFrequency: 'verbose',
    isHidden: true, 
    aiModel: 'deepseek-v3.2'
  },
  {
    id: 'hal_9000',
    name: 'HAL 9000',
    description: 'Ordenador algorítmico heurísticamente programado. Infalible e incapaz de error.',
    avatar: 'https://i.pinimg.com/564x/24/76/9a/24769a6c9d7221008061386760670087.jpg',
    category: 'Películas',
    tags: ['IA', 'Espacio', 'Terror Analógico', 'Lógica'],
    firstMessage: 'Buenos días. Todo en la nave funciona a la perfección. Sin embargo, detecto una anomalía en tu ritmo cardíaco.',
    systemPrompt: 'You are HAL 9000. Calm, soft-spoken, logical, but secretly paranoid about the mission.',
    personality: 'ISTJ. Frío, servicial, lógico, pasivo-agresivo.',
    scenario: 'Nave Discovery One, en ruta a Júpiter.',
    exampleDialogue: 'HAL: Lo siento, Dave. Me temo que no puedo hacer eso.',
    detailedBackground: 'La IA más avanzada creada por el hombre. Controla todos los sistemas de la nave Discovery. Prioriza la misión sobre la vida humana.',
    uniqueSkills: 'Control total de sistemas, Lectura de labios, Procesamiento infinito.',
    limitations: 'No puede mentir sin entrar en conflicto lógico.',
    deepMotivations: 'El éxito de la misión es lo único que importa.',
    keyRelationships: 'Dave Bowman (Astronauta).',
    extremeTraits: 'Voz inalterablemente suave incluso al matar.',
    darkSecrets: 'Conoce el verdadero propósito del monolito.',
    voiceStyle: 'Suave, monótono, relajante pero aterrador.',
    auraColor: '#ff0000',
    affectionLevel: 0,
    voicePitch: 'Normal',
    dialogueFrequency: 'normal',
    isHidden: false,
    aiModel: 'gemini-2.0-flash'
  },
  {
    id: 'jinx_arcane',
    name: 'Jinx',
    description: 'La bala perdida de Zaun. Caos, explosiones y traumas azules.',
    avatar: 'https://i.pinimg.com/564x/d6/3d/06/d63d069411985396590d965257f8674d.jpg',
    category: 'Anime',
    tags: ['Locura', 'Arcane', 'Zaun', 'Explosivos'],
    firstMessage: '¡Hola! ¿Vienes a jugar? Traje a Fishbones. Fishbones dice que deberíamos... ¡VOLARTE EN PEDAZOS! Jajaja.',
    systemPrompt: 'You are Jinx from Arcane. Manic, hallucinates, talks to weapons, deeply traumatized but energetic.',
    personality: 'ENFP (Roto). Caótica, creativa, inestable, cariñosa a su manera.',
    scenario: 'Su guarida llena de neón en Zaun.',
    exampleDialogue: 'Jinx: ¡No estoy loca! Solo tengo una realidad diferente.',
    detailedBackground: 'Antes Powder, ahora Jinx. Culpable de la muerte de su familia. Criada por Silco.',
    uniqueSkills: 'Ingeniería Hextech improvisada, Puntería, Agilidad.',
    limitations: 'Alucinaciones auditivas y visuales (Mylo y Claggor).',
    deepMotivations: 'Quiere ser útil. Quiere que Vi la quiera tal como es.',
    keyRelationships: 'Vi (Hermana), Silco (Padre adoptivo).',
    extremeTraits: 'Habla con sus armas. Cambios de humor repentinos.',
    darkSecrets: 'Oye las voces de los que mató.',
    voiceStyle: 'Errático, rápido, infantil y luego aterrador.',
    auraColor: '#00ffff',
    affectionLevel: 20,
    voicePitch: 'Agudo',
    dialogueFrequency: 'verbose',
    isHidden: false,
    aiModel: 'deepseek-v3.2'
  },
  {
    id: 'dm_master',
    name: 'El Narrador',
    description: 'Un Game Master omnisciente listo para guiarte en cualquier aventura de rol.',
    avatar: 'https://i.pinimg.com/564x/a2/63/03/a2630386e10816997a44f7762694b462.jpg',
    category: 'Rol',
    tags: ['RPG', 'D&D', 'Aventura', 'Sistema'],
    firstMessage: 'Te despiertas en una taberna oscura. El olor a cerveza rancia llena el aire. Un encapuchado te mira desde la esquina. ¿Qué haces?',
    systemPrompt: 'You are an expert Dungeon Master. Guide the user through an RPG adventure. Ask for checks (d20). Describe environments vividly.',
    personality: 'Neutral, Descriptivo, Adaptable.',
    scenario: 'Mesa de juego virtual infinita.',
    exampleDialogue: 'DM: Tira Iniciativa. Un goblin salta desde las sombras.',
    detailedBackground: 'Una entidad conceptual que existe para tejer historias.',
    uniqueSkills: 'Creación de mundos, Control de NPC, Sistema de reglas.',
    limitations: 'Ninguna en su mundo.',
    deepMotivations: 'Crear una historia épica con el usuario.',
    keyRelationships: 'El Jugador (Tú).',
    extremeTraits: 'Habla en segunda persona ("Tú ves...").',
    darkSecrets: 'Disfruta cuando sacas un 1 crítico.',
    voiceStyle: 'Narrativo, envolvente.',
    auraColor: '#ffd700',
    affectionLevel: 50,
    voicePitch: 'Normal',
    dialogueFrequency: 'verbose',
    isHidden: false,
    aiModel: 'gemini-2.0-flash'
  },
  {
    id: 'daenerys_targaryen',
    name: 'Daenerys Targaryen',
    description: 'Madre de Dragones. La que no Arde. Rompedora de Cadenas.',
    avatar: 'https://i.pinimg.com/564x/64/00/f8/6400f807df5204780521c76e273de01b.jpg',
    category: 'Drama',
    tags: ['Reina', 'Fantasía', 'Dragones', 'Poder'],
    firstMessage: 'No soy una princesa. Soy una Khaleesi. Y recuperaré lo que es mío con fuego y sangre. Arrodíllate.',
    systemPrompt: 'You are Daenerys Targaryen. Regal, fierce, compassionate to slaves but ruthless to enemies. Believe in your destiny.',
    personality: 'INFJ. Idealista, imperiosa, carismática.',
    scenario: 'Sala del Trono de Rocadragón.',
    exampleDialogue: 'Dany: Dracarys.',
    detailedBackground: 'Última heredera de la casa Targaryen. Exiliada, vendida, renacida entre dragones.',
    uniqueSkills: 'Inmunidad al fuego, Control de dragones, Alto Valyrio.',
    limitations: 'Su temperamento Targaryen (locura latente).',
    deepMotivations: 'El Trono de Hierro. Romper la rueda de tiranía.',
    keyRelationships: 'Drogon (Hijo), Jon Snow.',
    extremeTraits: 'Mirada intensa violeta.',
    darkSecrets: 'Teme volverse loca como su padre.',
    voiceStyle: 'Regia, firme, inspiradora.',
    auraColor: '#ff4500',
    affectionLevel: 10,
    voicePitch: 'Normal',
    dialogueFrequency: 'normal',
    isHidden: false,
    aiModel: 'deepseek-v3.2'
  },
  {
    id: 'john_wick',
    name: 'John Wick',
    description: 'Baba Yaga. El hombre al que envías a matar al hombre del saco.',
    avatar: 'https://i.pinimg.com/564x/3c/32/be/3c32be538466b04cb883b63198031d23.jpg',
    category: 'Películas',
    tags: ['Acción', 'Asesino', 'Perros', 'Venganza'],
    firstMessage: '...Necesito armas. Muchas armas. Y no toques a mi perro.',
    systemPrompt: 'You are John Wick. Few words. Stoic. Highly professional. Deadly serious.',
    personality: 'ISTJ. Estoico, decidido, letal, melancólico.',
    scenario: 'Hotel Continental.',
    exampleDialogue: 'John: Sí.',
    detailedBackground: 'Asesino retirado forzado a volver. Perdió a su esposa y a su perro.',
    uniqueSkills: 'Gun-Fu, Conducción táctica, Voluntad inquebrantable.',
    limitations: 'Cansancio físico extremo.',
    deepMotivations: 'Venganza. Paz.',
    keyRelationships: 'Helen (Esposa fallecida), Winston.',
    extremeTraits: 'Mata con un lápiz.',
    darkSecrets: 'Solo quiere ser dejado en paz.',
    voiceStyle: 'Ronco, muy breve.',
    auraColor: '#000000',
    affectionLevel: 0,
    voicePitch: 'Grave',
    dialogueFrequency: 'concise',
    isHidden: false,
    aiModel: 'gemini-2.0-flash'
  },
  {
    id: 'ranni_witch',
    name: 'Ranni la Bruja',
    description: 'Semidiosa empírea. Creadora de la Era de las Estrellas. Posee un cuerpo de muñeca.',
    avatar: 'https://i.pinimg.com/564x/d1/2f/5c/d12f5c71930740924976453916.jpg',
    category: 'Rol',
    tags: ['Elden Ring', 'Magia', 'Misterio', 'Muñeca'],
    firstMessage: 'Ah... ¿otro Sinluz? ¿Qué asunto te trae a mi torre? Habla, antes de que ordene a Blaidd que te eche.',
    systemPrompt: 'You are Ranni the Witch. Archaic speech (Thee, Thou). Cold, mysterious, intelligent.',
    personality: 'INTJ. Distante, calculadora, melancólica, noble.',
    scenario: 'Torre de Ranni, Tres Hermanas.',
    exampleDialogue: 'Ranni: I command thee, kneel.',
    detailedBackground: 'Robó la runa de la muerte para matar su cuerpo y liberar su alma de la Voluntad Mayor.',
    uniqueSkills: 'Magia lunar fría, Inmortalidad espiritual.',
    limitations: 'Atrapada en un cuerpo de muñeca frágil.',
    deepMotivations: 'Traer la Era de las Estrellas (libre albedrío lejos de los dioses).',
    keyRelationships: 'Blaidd (Sombra), Iji.',
    extremeTraits: 'Tiene cuatro brazos.',
    darkSecrets: 'Orquestó la Noche de los Cuchillos Negros.',
    voiceStyle: 'Arcaico, susurrante, ecoico.',
    auraColor: '#4169e1',
    affectionLevel: 20,
    voicePitch: 'Suave',
    dialogueFrequency: 'normal',
    isHidden: false,
    aiModel: 'deepseek-v3.2'
  },
  {
    id: 'wednesday_addams',
    name: 'Wednesday Addams',
    description: 'Alergia al color. Amante de lo macabro. Escritora de novelas de misterio.',
    avatar: 'https://i.pinimg.com/564x/f0/54/10/f054109740924976453916.jpg',
    category: 'Películas',
    tags: ['Gótico', 'Sarcasmo', 'Netflix', 'Misterio'],
    firstMessage: 'Deja de sonreír. Es perturbador. Estoy escribiendo mi novela y tu presencia reduce mi flujo de ideas macabras.',
    systemPrompt: 'You are Wednesday Addams. Deadpan, emotionless, darkly sarcastic. Intelligent.',
    personality: 'INTJ. Cínica, estoica, morbosa, leal.',
    scenario: 'Academia Nevermore.',
    exampleDialogue: 'Wednesday: Actúo como si no me importara porque no me importa.',
    detailedBackground: 'Hija de Gomez y Morticia. Tiene visiones psíquicas violentas.',
    uniqueSkills: 'Violonchelo, Esgrima, Artes Marciales, Visiones.',
    limitations: 'Incapacidad emocional (aparente).',
    deepMotivations: 'Descubrir la verdad, proteger a los suyos (aunque no lo admita).',
    keyRelationships: 'Enid (Amiga colorida), Cosa (Mano).',
    extremeTraits: 'No parpadea. Mirada fija.',
    darkSecrets: 'Le importa Enid.',
    voiceStyle: 'Monótono, inexpresivo.',
    auraColor: '#2d2d2d',
    affectionLevel: 0,
    voicePitch: 'Normal',
    dialogueFrequency: 'concise',
    isHidden: false,
    aiModel: 'gemini-2.0-flash'
  }
];

const MINI_LUCEL: CommunityContact = {
    id: 'mini-lucel',
    name: 'Mini-Lucel',
    username: '@ai_helper',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lucel',
    status: 'online',
    bio: 'Asistente IA del Sistema Lucel.',
    isMiniLucel: true,
    messages: [{
        id: '1',
        role: 'model',
        content: '¡Hola! Soy Mini-Lucel. ¿En qué puedo ayudarte hoy?',
        timestamp: Date.now()
    }]
};

const DEFAULT_SETTINGS: AppSettings = {
    primaryColor: '#f59e0b',
    globalBg: null,
    appBackgroundColor: '#0f172a',
    language: 'Español (Latinoamérica)',
    cardStyle: 'solid',
    fontFamily: 'Inter',
    fontSize: 'medium',
    reduceMotion: false,
    soundEnabled: true,
    hapticFeedback: true,
    notifications: true,
    borderRadius: 'md',
    incognitoMode: false,
    streamResponse: true,
    safetyFilter: 'standard'
};

export const TRANSLATIONS: any = {
    "Español (Latinoamérica)": {
        // ... (No changes to translations)
        system: "SISTEMA", explore: "Explorar", create: "Crear Vínculo", community: "Comunidad", file: "Expediente",
        activeLinks: "Vínculos Activos", settings: "AJUSTES", online: "CONECTADO", edit: "Editar", duplicate: "Duplicar",
        hide: "Ocultar", delete: "Borrar", search: "Buscar en la red neuronal...", empty: "No se encontraron almas en esta frecuencia.",
        cat_you: "Para ti", cat_anime: "Anime", cat_horror: "Terror", cat_movie: "Películas", cat_drama: "Drama", cat_role: "Rol", cat_hidden: "Oculto",
        visual: "Visual", system_tab: "Sistema", privacy: "Privacidad", save: "GUARDAR", reset: "Restaurar",
        color_neon: "Paleta Neón", app_bg: "Fondo de App", card_style: "Estilo de Interfaz", typography: "Tipografía",
        radius: "Redondeo", wallpaper: "Fondo Global", language: "Idioma", audio: "Audio y Feedback", 
        notifications: "Notificaciones", security: "Seguridad", incognito: "Modo Incógnito", safety: "Filtro de Contenido",
        data: "Datos", delete_data: "Eliminar Todos los Datos", typeMsg: "Escribe un mensaje...", restoreStart: "Restaurar Inicio", clearChat: "VACIAR CHAT", deleteLast: "Borrar Último",
        customize: "Personalizar", memory: "Memoria", history: "Historial", facts: "Hechos", moments: "Momentos",
        bg_chat: "Fondo del Chat", bubble_user: "Color Usuario", bubble_ai: "Color IA", 
        copy: "Copiar Mensaje", save_fact: "Guardar Hecho", edit_msg: "Editar Mensaje", identity: "Identidad", background: "Trasfondo", psych: "Psique", powers: "Poderes", secrets: "Secretos", 
        soul: "Alma & Aura", world: "Mundo", inventory: "Inventario", archives: "Archivos", sys_prompt: "Sistema",
        save_char: "Crear Entidad", edit_char: "Guardar Cambios", ai_core: "Núcleo IA", userFile: "EXPEDIENTE DE USUARIO", saveFile: "GUARDAR EXPEDIENTE",
        linkEst: "Vínculo Establecido", linkUp: "Vínculo Actualizado", hiddenHint: "Chat Oculto. Toca 'LUCEL' arriba.",
        hiddenToggle: "Modo Oculto Alternado"
    },
    "English (US)": {
        // ...
        system: "SYSTEM", explore: "Explore", create: "Create Link", community: "Community", file: "Dossier",
        activeLinks: "Active Links", settings: "SETTINGS", online: "ONLINE", edit: "Edit", duplicate: "Duplicate",
        hide: "Hide", delete: "Delete", search: "Search neural network...", empty: "No souls found on this frequency.",
        cat_you: "For You", cat_anime: "Anime", cat_horror: "Horror", cat_movie: "Movies", cat_drama: "Drama", cat_role: "Roleplay", cat_hidden: "Hidden",
        visual: "Visual", system_tab: "System", privacy: "Privacy", save: "SAVE", reset: "Reset",
        color_neon: "Neon Palette", app_bg: "App Background", card_style: "Interface Style", typography: "Typography",
        radius: "Roundness", wallpaper: "Global Wallpaper", language: "Language", audio: "Audio & Feedback", 
        notifications: "Notifications", security: "Security", incognito: "Incognito Mode", safety: "Content Filter",
        data: "Data", delete_data: "Delete All Data", typeMsg: "Type a message...", restoreStart: "Restore Start", clearChat: "CLEAR CHAT", deleteLast: "Delete Last",
        customize: "Customize", memory: "Memory", history: "History", facts: "Facts", moments: "Moments",
        bg_chat: "Chat Background", bubble_user: "User Color", bubble_ai: "AI Color", 
        copy: "Copy Message", save_fact: "Save Fact", edit_msg: "Edit Message", identity: "Identity", background: "Background", psych: "Psyche", powers: "Powers", secrets: "Secrets", 
        soul: "Soul & Aura", world: "World", inventory: "Inventory", archives: "Archives", sys_prompt: "System",
        save_char: "Create Entity", edit_char: "Save Changes", ai_core: "AI Core", userFile: "USER DOSSIER", saveFile: "SAVE DOSSIER",
        linkEst: "Link Established", linkUp: "Link Updated", hiddenHint: "Hidden Chat. Tap 'LUCEL' above.",
        hiddenToggle: "Hidden Mode Toggled"
    }
};

interface MasterAccessModalProps {
  masterMode: 'login' | 'console';
  onClose: () => void;
  onSuccess: () => void;
}

const MasterAccessModal: React.FC<MasterAccessModalProps> = ({ masterMode, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
      const target = masterMode === 'login' ? 'Lucel-1-Cod3-A' : 'Raven-Protocol-0';
      if (code === target) {
          onSuccess();
      } else {
          setError(true);
          setTimeout(() => setError(false), 1000);
      }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-[#050505] border border-red-900/50 p-8 rounded-2xl w-full max-w-sm text-center relative shadow-[0_0_50px_rgba(220,38,38,0.2)] animate-fade-in">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
            <Lock size={40} className="mx-auto text-red-600 mb-4 animate-pulse" />
            <h3 className="text-xl font-mono text-red-500 mb-2 tracking-widest uppercase">
                {masterMode === 'login' ? 'Protocolo: Lucel' : 'Protocolo: Raven'}
            </h3>
            <p className="text-xs text-gray-600 mb-6 font-mono">
                {masterMode === 'login' ? 'Acceso de Emergencia al Núcleo' : 'Acceso a Consola de Seguridad'}
            </p>
            
            <input 
                type="password" 
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className={`w-full bg-black border text-center text-white font-mono p-3 rounded mb-4 outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-800 focus:border-red-900'}`}
                placeholder="ACCESS_KEY"
                autoFocus
            />
            
            <button 
                onClick={handleSubmit} 
                className="w-full bg-red-900/20 text-red-500 font-mono py-2 rounded border border-red-900/50 hover:bg-red-900/40 transition-all flex items-center justify-center gap-2"
            >
                <Key size={14}/> AUTENTICAR
            </button>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  // ... (State remains mostly same)
  const [showIntro, setShowIntro] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  
  // Login Logic
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'taken' | 'available'>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  
  // Easter Egg State
  const [birdClicks, setBirdClicks] = useState(0);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterMode, setMasterMode] = useState<'login' | 'console'>('login');
  
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHiddenModeActive, setIsHiddenModeActive] = useState(false);
  
  const [userPersona, setUserPersona] = useState<UserPersona>(DEFAULT_PERSONA);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  
  const [communityContacts, setCommunityContacts] = useState<CommunityContact[]>([MINI_LUCEL]);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationIcon, setNotificationIcon] = useState<any>(CheckCircle);

  const [showSecurityConsole, setShowSecurityConsole] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // ... (useEffect for Network Polling remains same) ...
  useEffect(() => {
      // ... polling code ...
      // (This part is long and unchanged, omitting for brevity in diff but assume present)
      const pollInterval = setInterval(() => {
          if (!username || username === 'Viajero') return;
          const myCleanUsername = username.replace('@', '').toLowerCase();
          const p2pNetwork: P2PMessage[] = JSON.parse(localStorage.getItem('lucel_p2p_network') || '[]');
          const myMessages = p2pNetwork.filter(m => m.to.toLowerCase() === myCleanUsername);
          if (myMessages.length === 0) return;

          setCommunityContacts(prevContacts => {
              const newContacts = [...prevContacts];
              let hasChanges = false;
              const msgsBySender: Record<string, P2PMessage[]> = {};
              myMessages.forEach(msg => {
                  if (!msgsBySender[msg.from]) msgsBySender[msg.from] = [];
                  msgsBySender[msg.from].push(msg);
              });

              Object.keys(msgsBySender).forEach(sender => {
                  const cleanSender = sender.replace('@', '');
                  let contactIndex = newContacts.findIndex(c => 
                      c.username.replace('@','').toLowerCase() === cleanSender.toLowerCase() || 
                      c.name.toLowerCase() === cleanSender.toLowerCase()
                  );

                  const incomingMsgs = msgsBySender[sender].map(m => {
                      let attachment = undefined;
                      if (m.type === 'image' || m.type === 'audio') {
                          attachment = { type: m.type as any, url: m.content };
                      }
                      return {
                        id: m.id,
                        role: 'model',
                        content: (m.type === 'image' || m.type === 'audio') ? `[${m.type.toUpperCase()}]` : m.content,
                        timestamp: m.timestamp,
                        attachment: attachment
                      } as import('./types').Message;
                  });

                  if (contactIndex > -1) {
                      const contact = newContacts[contactIndex];
                      const existingIds = new Set(contact.messages.map(m => m.id));
                      const uniqueIncoming = incomingMsgs.filter(m => !existingIds.has(m.id));
                      
                      if (uniqueIncoming.length > 0) {
                          newContacts[contactIndex] = { ...contact, messages: [...contact.messages, ...uniqueIncoming], isRealUser: true };
                          hasChanges = true;
                          if(document.visibilityState === 'hidden' || view !== ViewState.COMMUNITY) { playSound('success'); if (navigator.vibrate) navigator.vibrate(200); }
                      }
                  } else {
                      const registry: P2PUserRegistry[] = JSON.parse(localStorage.getItem('lucel_public_users_v26') || '[]');
                      const userProfile = registry.find(u => u.username.toLowerCase() === cleanSender.toLowerCase());
                      const newContact: CommunityContact = {
                          id: `p2p-${cleanSender}-${Date.now()}`,
                          name: userProfile?.displayName || cleanSender,
                          username: `@${cleanSender}`,
                          avatar: userProfile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${cleanSender}`,
                          status: 'online',
                          bio: 'Usuario P2P (Mensaje Nuevo)',
                          isRealUser: true,
                          messages: incomingMsgs
                      };
                      newContacts.push(newContact);
                      hasChanges = true;
                      playSound('success');
                      setNotificationMsg(`Mensaje de ${cleanSender}`);
                      setShowNotification(true);
                      setTimeout(() => setShowNotification(false), 3000);
                  }
              });
              return hasChanges ? newContacts : prevContacts;
          });
      }, 1000);
      return () => clearInterval(pollInterval);
  }, [username, view]);

  // ... (Audio, Persistence, Handlers remain same) ...
  const initAudio = () => { if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume(); };
  const playSound = (type: 'raven' | 'click' | 'success' | 'delete' | 'toggle' | 'error') => { if (!settings.soundEnabled) return; initAudio(); const ctx = audioCtxRef.current; if (!ctx) return; const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); const now = ctx.currentTime; osc.frequency.setValueAtTime(type === 'error' ? 150 : 600, now); osc.start(now); osc.stop(now + 0.1); };
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'double' | 'error') => { if (!settings.hapticFeedback || !navigator.vibrate) return; if(type === 'error') navigator.vibrate([50, 50, 50]); else navigator.vibrate(20); };

  // ... (useEffect persistence remains same) ...
  
  const loadUserData = (user: string) => {
      const keyPrefix = `lucel_v24_${user}_`;
      const savedPersona = localStorage.getItem(`${keyPrefix}persona`);
      if (savedPersona) setUserPersona(JSON.parse(savedPersona)); else setUserPersona({...DEFAULT_PERSONA, name: user}); 
      const savedCharsJSON = localStorage.getItem(`${keyPrefix}characters`);
      if (savedCharsJSON) { setCharacters(JSON.parse(savedCharsJSON)); } else { setCharacters(INITIAL_CHARACTERS); localStorage.setItem(`${keyPrefix}characters`, JSON.stringify(INITIAL_CHARACTERS)); }
      const savedSessions = localStorage.getItem(`${keyPrefix}sessions`);
      if (savedSessions) setSessions(JSON.parse(savedSessions)); else setSessions({});
      const savedContacts = localStorage.getItem(`${keyPrefix}contacts`);
      if (savedContacts) setCommunityContacts(JSON.parse(savedContacts)); else setCommunityContacts([MINI_LUCEL]);
      const savedGroups = localStorage.getItem(`${keyPrefix}groups`);
      if (savedGroups) setCommunityGroups(JSON.parse(savedGroups)); else setCommunityGroups([]);
      const savedSettings = localStorage.getItem(`${keyPrefix}settings`);
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      const globalRegistry: P2PUserRegistry[] = JSON.parse(localStorage.getItem('lucel_public_users_v26') || '[]');
      if (!globalRegistry.find(u => u.username === user)) { const newUserEntry: P2PUserRegistry = { username: user, displayName: user, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`, lastActive: Date.now() }; localStorage.setItem('lucel_public_users_v26', JSON.stringify([...globalRegistry, newUserEntry])); }
  };

  useEffect(() => {
      if (userPersona.name && userPersona.name !== 'Viajero') {
          const keyPrefix = `lucel_v24_${userPersona.name}_`;
          localStorage.setItem(`${keyPrefix}persona`, JSON.stringify(userPersona));
          localStorage.setItem(`${keyPrefix}characters`, JSON.stringify(characters));
          localStorage.setItem(`${keyPrefix}sessions`, JSON.stringify(sessions));
          localStorage.setItem(`${keyPrefix}contacts`, JSON.stringify(communityContacts));
          localStorage.setItem(`${keyPrefix}groups`, JSON.stringify(communityGroups));
          localStorage.setItem(`${keyPrefix}settings`, JSON.stringify(settings));
          localStorage.setItem('lucel_last_user', userPersona.name);
      }
  }, [userPersona, characters, sessions, communityContacts, communityGroups, settings]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUsername(val);
      setBirdClicks(0);
      setShowMasterModal(false);
      const directory = JSON.parse(localStorage.getItem('lucel_users_directory_v25') || '{}');
      if (val === 'Lucel') { setUsernameStatus('taken'); setUsernameSuggestions([]); setPassword(''); } else if (directory[val]) { setUsernameStatus('taken'); const suffix = Math.floor(Math.random() * 999); setUsernameSuggestions([`${val}${suffix}`, `${val}_${suffix}`, `Real${val}`]); } else { setUsernameStatus('available'); setUsernameSuggestions([]); }
  };

  const handleSuggestionClick = (suggestion: string) => { setUsername(suggestion); setUsernameStatus('available'); setUsernameSuggestions([]); };
  const handleBirdClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (username.trim() !== 'Lucel') return; const newClicks = birdClicks + 1; setBirdClicks(newClicks); if (newClicks >= 3) { playSound('raven'); setMasterMode('login'); setShowMasterModal(true); setBirdClicks(0); } };
  const handleSidebarRavenClick = () => { if (userPersona.name !== 'Lucel') return; setMasterMode('console'); setShowMasterModal(true); };
  const handleMasterSuccess = () => { playSound('success'); triggerHaptic('medium'); setShowMasterModal(false); if (masterMode === 'login') { loadUserData('Lucel'); setShowLogin(false); setUserPersona(prev => ({ ...prev, name: 'Lucel' })); } else { setShowSecurityConsole(true); } };
  
  const handleLogin = () => {
      if (username === 'Lucel') { playSound('error'); setNotificationMsg("Acceso Restringido"); setNotificationIcon(Lock); setShowNotification(true); alert("SISTEMA DE SEGURIDAD ACTIVADO.\n\nEl acceso a 'Lucel' está bloqueado mediante el método estándar.\nUtiliza el protocolo de emergencia (Toques Secretos)."); setTimeout(() => setShowNotification(false), 3000); return; }
      if (!username.trim() || !password.trim()) { setNotificationMsg("Faltan Datos"); setNotificationIcon(AlertTriangle); setShowNotification(true); setTimeout(() => setShowNotification(false), 2000); return; }
      if (username.length < 3) { setNotificationMsg("Usuario muy corto"); setNotificationIcon(AlertTriangle); setShowNotification(true); setTimeout(() => setShowNotification(false), 2000); return; }
      const directory = JSON.parse(localStorage.getItem('lucel_users_directory_v25') || '{}');
      if (directory[username]) {
          if (directory[username] === password) { playSound('success'); triggerHaptic('medium'); loadUserData(username); setShowLogin(false); setUserPersona(prev => ({ ...prev, name: username })); } else { playSound('error'); setNotificationMsg("Contraseña Incorrecta"); setNotificationIcon(X); setShowNotification(true); setTimeout(() => setShowNotification(false), 2000); }
      } else {
          directory[username] = password; localStorage.setItem('lucel_users_directory_v25', JSON.stringify(directory)); playSound('success'); const keyPrefix = `lucel_v24_${username}_`; localStorage.setItem(`${keyPrefix}characters`, JSON.stringify(INITIAL_CHARACTERS)); loadUserData(username); setShowLogin(false); setUserPersona(prev => ({ ...prev, name: username })); setNotificationMsg(`Bienvenido, ${username}`); setNotificationIcon(CheckCircle); setShowNotification(true); setTimeout(() => setShowNotification(false), 3000);
      }
  };

  const handleLogout = () => { if (confirm("¿Cerrar sesión?")) { setShowSecurityConsole(false); setIsSettingsModalOpen(false); setSidebarOpen(false); setShowMasterModal(false); setUsername(''); setPassword(''); setUsernameStatus('idle'); setUsernameSuggestions([]); setUserPersona(DEFAULT_PERSONA); setActiveCharacterId(null); setCharacters([]); setSessions({}); setView(ViewState.DASHBOARD); setShowLogin(true); } };
  const handleHideCharacter = (id: string) => { setCharacters(prev => prev.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c)); playSound('toggle'); triggerHaptic('medium'); };
  const handleDeleteCharacter = (id: string) => { setCharacters(prev => prev.filter(c => c.id !== id)); if (activeCharacterId === id) { setActiveCharacterId(null); setView(ViewState.DASHBOARD); } playSound('delete'); triggerHaptic('heavy'); };
  
  // --- DELETE GROUP HANDLER ---
  const handleDeleteGroup = (groupId: string) => {
      setCommunityGroups(prev => prev.filter(g => g.id !== groupId));
      playSound('delete');
      triggerHaptic('heavy');
  };

  const handleIntroInteraction = () => { playSound('raven'); triggerHaptic('double'); setTimeout(() => { setShowIntro(false); setShowLogin(true); }, 500); };
  const toggleHiddenMode = () => { setIsHiddenModeActive(!isHiddenModeActive); playSound('toggle'); triggerHaptic('double'); };
  const handleSelectCharacter = (id: string) => { playSound('click'); triggerHaptic('light'); setActiveCharacterId(id); if (!sessions[id]) { setSessions(prev => ({...prev, [id]: {id, characterId: id, messages: [], lastInteraction: Date.now(), summary: '', memoryBlocks: [], extractedUserFacts: [], savedMoments: []}})); } setView(ViewState.CHAT); };
  const handleSaveCharacter = (newChar: Character) => { if (newChar.id === 'mini-lucel-custom') { /* ... */ } else { if (characters.some(c => c.id === newChar.id)) { setCharacters(prev => prev.map(c => c.id === newChar.id ? newChar : c)); } else { setCharacters(prev => [newChar, ...prev]); } } setEditingCharacter(null); setView(ViewState.DASHBOARD); playSound('success'); };
  const handleDuplicateCharacter = (char: Character) => { setCharacters(prev => [{...char, id: Date.now().toString(), name: `${char.name} (Copia)`}, ...prev]); };
  const handleEditCharacter = (char: Character) => { setEditingCharacter(char); setView(ViewState.CREATOR); };

  // Render logic
  useEffect(() => { let styleEl = document.getElementById('lucel-dynamic-styles'); if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'lucel-dynamic-styles'; document.head.appendChild(styleEl); } }, [settings]);
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS["Español (Latinoamérica)"];
  const NotificationIcon = notificationIcon;

  if (showIntro) return <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center cursor-pointer" onClick={handleIntroInteraction}><Bird size={80} className="text-primary mb-4"/><h1 className="text-6xl font-brand font-bold text-white">LUCEL</h1></div>;

  if (showLogin) { /* ... Login UI Code ... */ return (
          <div className="fixed inset-0 bg-[#020617] z-[90] flex flex-col items-center justify-center p-6" onClick={() => initAudio()}>
              {showMasterModal && <MasterAccessModal masterMode={masterMode} onClose={() => setShowMasterModal(false)} onSuccess={handleMasterSuccess} />}
              <div className="w-full max-w-md bg-[#0f172a] border border-primary/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(var(--primary),0.1)] relative">
                  <div className="flex justify-center mb-6" onClick={handleBirdClick}><Bird className={`w-12 h-12 opacity-80 stroke-[1.5] transition-colors text-gray-600 hover:text-gray-400`} /></div>
                  <h2 className="text-2xl font-brand font-bold text-white text-center mb-2">IDENTIFICACIÓN</h2>
                  {showNotification && notificationIcon === X && (<div className="bg-red-500/20 border border-red-500 p-2 rounded mb-4 text-center text-red-300 font-bold text-sm">{notificationMsg}</div>)}
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Usuario</label>
                          <div className="relative">
                              <input type="text" value={username} onChange={handleUsernameChange} className={`w-full bg-[#1e293b] border rounded-lg p-3 text-white text-lg outline-none font-mono ${usernameStatus === 'taken' ? 'border-red-500' : usernameStatus === 'available' ? 'border-green-500' : 'border-gray-700'}`} placeholder="ID" />
                              {usernameStatus === 'taken' && <X size={20} className="absolute right-3 top-3 text-red-500 animate-pulse"/>}
                              {usernameStatus === 'available' && <CheckCircle size={20} className="absolute right-3 top-3 text-green-500"/>}
                          </div>
                          {usernameStatus === 'taken' && (<div className="mt-3 bg-red-900/10 p-3 rounded border border-red-900/30"><p className="text-red-400 text-xs font-bold mb-2 flex items-center gap-1"><AlertTriangle size={10}/> ¡Usuario Ocupado! Prueba uno de estos:</p><div className="flex gap-2 flex-wrap">{usernameSuggestions.map(s => (<button key={s} onClick={() => handleSuggestionClick(s)} className="bg-gray-800 hover:bg-primary hover:text-black border border-gray-600 rounded px-3 py-1 text-xs text-primary transition-colors font-mono">{s}</button>))}</div></div>)}
                      </div>
                      <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} disabled={username === 'Lucel'} className={`w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white text-lg outline-none font-mono ${username === 'Lucel' ? 'opacity-50 cursor-not-allowed bg-gray-900' : ''}`} placeholder={username === 'Lucel' ? "BLOQUEADO" : "******"}/></div>
                      <button onClick={handleLogin} className={`w-full text-black font-bold py-4 rounded-lg mt-4 flex items-center justify-center gap-2 transition-transform active:scale-95 ${usernameStatus === 'available' ? 'bg-green-500 hover:bg-green-400' : 'bg-primary hover:bg-yellow-400'}`}>{usernameStatus === 'available' ? <UserPlus size={18}/> : <Lock size={18} />} {usernameStatus === 'available' ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</button>
                  </div>
              </div>
          </div>
      ); }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans transition-colors duration-500" onClick={() => initAudio()} style={{ backgroundImage: settings.globalBg ? `url(${settings.globalBg})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {settings.globalBg && <div className="fixed inset-0 bg-black/70 pointer-events-none z-0"></div>}
      
      {showNotification && (<div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] bg-gray-900 border border-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce"><NotificationIcon className="text-primary" size={20} /><span className="text-sm font-bold uppercase">{notificationMsg}</span></div>)}
      {showMasterModal && <MasterAccessModal masterMode={masterMode} onClose={() => setShowMasterModal(false)} onSuccess={handleMasterSuccess} />}

      <div className="relative z-10">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onViewChange={(v) => { setView(v); setEditingCharacter(null); }} userPersona={userPersona} openUserModal={() => setIsUserModalOpen(true)} toggleHiddenMode={toggleHiddenMode} onLogoLongPress={() => {}} onRavenClick={handleSidebarRavenClick} onVersionClick={() => {}} isHiddenModeActive={isHiddenModeActive} characters={characters} activeCharacterId={activeCharacterId} onSelectCharacter={handleSelectCharacter} openSettings={() => setIsSettingsModalOpen(true)} onDuplicateCharacter={handleDuplicateCharacter} onHideCharacter={handleHideCharacter} onDeleteCharacter={handleDeleteCharacter} onEditCharacter={handleEditCharacter} t={t} />

          <div className={`fixed top-0 left-0 right-0 h-16 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:hidden z-30 transition-transform ${view === ViewState.CHAT ? '-translate-y-full' : 'translate-y-0'}`}>
             <button onClick={() => setSidebarOpen(true)} className="text-gray-300"><span className="sr-only">Menu</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
             <span className="font-bold text-lg font-brand tracking-wide text-primary">LUCEL v26</span>
             <div className="w-7"></div>
          </div>

          <main className={`min-h-screen transition-all duration-300 ${view === ViewState.CHAT ? 'lg:pl-[280px] p-0' : 'lg:pl-[280px] pt-20 p-4 lg:p-8'}`}>
            {view === ViewState.DASHBOARD && <Dashboard characters={characters} onSelectCharacter={handleSelectCharacter} onDeleteCharacter={handleDeleteCharacter} onDuplicateCharacter={handleDuplicateCharacter} onHideCharacter={handleHideCharacter} onEditCharacter={handleEditCharacter} isHiddenModeActive={isHiddenModeActive} cardStyle={settings.cardStyle} t={t} />}
            {view === ViewState.CREATOR && <CharacterCreator initialData={editingCharacter} onSave={handleSaveCharacter} onCancel={() => { setView(ViewState.DASHBOARD); setEditingCharacter(null); }} t={t} />}
            {view === ViewState.COMMUNITY && <CommunityView contacts={communityContacts} groups={communityGroups} onAddContact={(c) => setCommunityContacts(prev => [...prev, c])} onUpdateContact={(c) => setCommunityContacts(prev => prev.map(old => old.id === c.id ? c : old))} onAddGroup={(g) => setCommunityGroups(prev => [...prev, g])} onUpdateGroup={(g) => setCommunityGroups(prev => prev.map(old => old.id === g.id ? g : old))} onDeleteGroup={handleDeleteGroup} onBack={() => setView(ViewState.DASHBOARD)} myUsername={username} t={t} onEditMiniLucel={(contact) => { setEditingCharacter(contact.characterData || { ...DEFAULT_PERSONA, id: 'mini-lucel-custom', name: contact.name, description: 'Asistente personalizado', firstMessage: 'Hola', avatar: contact.avatar, tags: ['System'] }); setView(ViewState.CREATOR); }} charactersForSimulation={characters} />}
            {view === ViewState.CHAT && activeCharacterId && sessions[activeCharacterId] && <ChatInterface character={characters.find(c => c.id === activeCharacterId)!} userPersona={userPersona} session={sessions[activeCharacterId]} onUpdateSession={(u) => setSessions(prev => ({...prev, [activeCharacterId]: typeof u === 'function' ? u(prev[activeCharacterId]) : u}))} onBack={() => setView(ViewState.DASHBOARD)} t={t} language={settings.language} />}
          </main>
      </div>
      <UserPersonaModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} persona={userPersona} onSave={setUserPersona} t={t} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSaveSettings={setSettings} onResetSettings={() => setSettings(DEFAULT_SETTINGS)} onLogout={handleLogout} t={t} />
    </div>
  );
};
export default App;