

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isMemory?: boolean; // If saved to "Moments"
  attachment?: {
      type: 'image' | 'file' | 'location' | 'poll' | 'sticker' | 'audio' | 'system';
      url?: string;
      data?: any;
  };
}

export interface CustomArchive {
  id: string;
  title: string;
  content: string;
  date: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  tags: string[];
  
  // Advanced Fields (Original)
  firstMessage: string;
  systemPrompt: string;
  scenario: string;
  personality: string;
  exampleDialogue: string;
  
  isHidden?: boolean; // For the "Hidden Chats" feature

  // New Deep RPG Fields
  detailedBackground?: string;       // Historia de Fondo Detallada
  uniqueSkills?: string;             // Habilidades Únicas
  limitations?: string;              // Limitaciones
  deepMotivations?: string;          // Motivaciones Personales Profundas
  keyRelationships?: string;         // Relaciones Clave Preexistentes
  extremeTraits?: string;            // Rasgos de Personalidad Extremos
  darkSecrets?: string;              // Secretos Oscuros o Revelaciones
  voiceStyle?: string;               // Estilo de voz/escritura
  
  // V10: Soul & Aura
  auraColor?: string;
  affectionLevel?: number; // 0-100
  voicePitch?: string; // "Low", "High", etc.
  dialogueFrequency?: 'verbose' | 'concise' | 'normal';

  // V14: AI Specific Archives
  customArchives?: CustomArchive[];

  // V22: AI Core Selection
  // Updated model choice to gemini-3-flash-preview
  aiModel?: 'gemini-3-flash-preview' | 'deepseek-v3.2';
}

// Custom Theme for individual chats
export interface ChatTheme {
  backgroundImage?: string; // Data URL from gallery
  userBubbleColor?: string;
  aiBubbleColor?: string;
  // V11 Extended
  bubbleShape?: 'rounded' | 'square' | 'message';
  opacity?: number;
  showTimestamps?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  // V12
  backgroundOpacity?: number; // Opacity of the background image overlay
  bubbleBorder?: boolean;
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  lastInteraction: number;
  
  // Right Sidebar Data
  summary: string; // DEPRECATED: Use memoryBlocks[0]
  memoryBlocks: string[]; // V26: Multi-block infinite memory
  extractedUserFacts: string[]; // "Datos a detalles sobre lo que la IA sabe de ti"
  savedMoments: Message[]; // "Carpeta de Momentos"
  
  // V8: Chat Personalization
  theme?: ChatTheme;
}

export interface UserPersona {
  // Basic
  name: string;
  avatar: string;
  age: string;
  gender: string;
  
  // Appearance
  appearance: string;
  height: string;
  eyeColor: string;
  hairStyle: string;
  clothingStyle: string;
  scarsOrTattoos?: string; 

  // Psychology
  personality: string;
  likes: string;
  dislikes: string;
  fears: string;
  mbti?: string; 
  alignment?: string; 
  hobbies?: string;
  
  // V15: Deep User Data
  philosophy?: string; // Moral compass, beliefs
  dailyRoutine?: string; // What they usually do
  userInventory?: string; // Items they carry always
  
  // Deep Context
  secrets: string;
  biography: string;
  occupation: string;
  skills: string;
  communicationStyle?: string; 
  pastTrauma?: string; 
  
  // V9: Custom File System
  customArchives?: CustomArchive[];
}

export interface CommunityPrivacy {
    showPhoto: 'everyone' | 'contacts' | 'nobody';
    showLastSeen: 'everyone' | 'contacts' | 'nobody';
    showInfo: 'everyone' | 'contacts' | 'nobody';
}

export interface CommunityContact {
  id: string;
  name: string;
  username: string; // CHANGED from number to username
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastSeen?: string;
  messages: Message[];
  bio?: string; // V10
  isMiniLucel?: boolean; // V16
  isRealUser?: boolean; // V27: True if this is a real human user P2P
  chatTheme?: ChatTheme; // V16
  isBlocked?: boolean; // V31: Block functionality
  
  // V23: Full Character Data for Mini-Lucel customization
  characterData?: Character;
}

export interface CommunityGroup {
  id: string;
  name: string;
  avatar: string;
  description: string;
  members: string[]; // List of names/usernames
  admins: string[]; // V16: List of admins
  messages: Message[];
  inviteLink?: string; // V16
  chatTheme?: ChatTheme; // V16
  
  // V29: Advanced Group Settings (WhatsApp Style)
  settings?: {
      editInfo: 'everyone' | 'admins'; // Who can change subject, icon, description
      sendMessages: 'everyone' | 'admins';
      approveMembers: boolean;
  };
  creationDate?: number;
}

// V27: P2P Network Types
export interface P2PMessage {
    id: string;
    from: string; // Username
    to: string; // Username
    content: string;
    timestamp: number;
    type: 'text' | 'image' | 'audio' | 'system';
}

export interface P2PUserRegistry {
    username: string;
    displayName: string;
    avatar: string;
    lastActive: number;
    // V28 Profile Extensions
    bio?: string;
    location?: string;
    website?: string;
    tags?: string[];
    banner?: string;
}

// V28: Global & Status
export interface GlobalPost {
    id: string;
    userId: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: number;
    likes: number;
    replies: number;
    isVerified?: boolean; // For AI Characters
}

export interface UserStatus {
    id: string;
    userId: string;
    username: string;
    userAvatar: string;
    media: string; // Base64
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
    viewed?: boolean;
    // V30: Status Privacy
    privacy?: 'everyone' | 'contacts' | 'private';
}

export type CardStyle = 'glass' | 'solid' | 'neon' | 'minimal' | 'holographic' | 'cyberpunk';
export type FontFamily = 'Inter' | 'Roboto' | 'Courier New' | 'Rajdhani';

export interface AppSettings {
  // Visual
  primaryColor: string;
  secondaryColor?: string; // V10
  globalBg: string | null;
  appBackgroundColor: string; // V12: Solid background color
  cardStyle: CardStyle;
  fontFamily: FontFamily;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'; // V10
  
  // System
  language: string;
  reduceMotion: boolean;
  soundEnabled: boolean; // V10
  hapticFeedback: boolean; // V10
  notifications: boolean; // V10
  
  // Privacy & Advanced
  incognitoMode: boolean; // V10
  streamResponse: boolean; // V10
  safetyFilter: 'none' | 'standard' | 'strict'; // V10
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  CREATOR = 'CREATOR',
  COMMUNITY = 'COMMUNITY'
}