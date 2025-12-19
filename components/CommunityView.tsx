import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, MessageCircle, Phone, Video, Search, UserPlus, MoreVertical, Lock, Send, ArrowLeft, CircleDashed, AtSign, Globe, Wifi, Users2, User, Camera, Image, FileText, MapPin, BarChart2, Smile, Shield, MoreHorizontal, Settings, Trash, LogOut, Link, Palette, CheckCircle, X, Code, Terminal, Bell, Edit2, Cpu, Heart, Share2, Map, Layout, Bird, Wallpaper, Bookmark, Clock, UserCheck, Mic, ShieldAlert, Crown, LogOut as LogoutIcon, Ban, Flag, ChevronRight, Eye, EyeOff, Maximize2, Minimize2, Grid } from 'lucide-react';
import { CommunityContact, Message, CommunityGroup, ChatTheme, CommunityPrivacy, P2PMessage, P2PUserRegistry, GlobalPost, UserStatus, Character } from '../types';
import { generateCommunityResponse } from '../services/geminiService';

const SOURCE_CODE_MOCK = `
// CORE KERNEL: LUCEL NEURAL LINK
// Version: 26.0.4 (DeepSeek Integration)

import { NeuralEngine } from '@lucel/core';

class LucelSystem {
    constructor() {
        this.status = 'ONLINE';
        this.memory = new InfiniteContext();
        this.security = 'ENCRYPTED';
    }

    async connectToUser(userId: string) {
        console.log(\`Connecting to neural interface: \${userId}...\`);
        await this.handshake();
        return true;
    }
}
`;

interface CommunityViewProps {
  contacts: CommunityContact[];
  groups: CommunityGroup[];
  onAddContact: (contact: CommunityContact) => void;
  onUpdateContact: (contact: CommunityContact) => void;
  onAddGroup: (group: CommunityGroup) => void;
  onUpdateGroup: (group: CommunityGroup) => void; // Used for updates
  onDeleteGroup?: (groupId: string) => void; // Added for true deletion
  onBack: () => void;
  myUsername: string;
  t: any;
  onEditMiniLucel?: (contact: CommunityContact) => void; 
  charactersForSimulation?: Character[]; 
}

const CommunityView: React.FC<CommunityViewProps> = ({ 
    contacts, groups, onAddContact, onUpdateContact, onAddGroup, onUpdateGroup, onDeleteGroup, onBack, myUsername, t, onEditMiniLucel, charactersForSimulation
}) => {
  // Tabs: 'chats' | 'groups' | 'global' | 'profile'
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'global' | 'profile'>('chats');
  
  // VIEW SETTINGS (RESIZE) - Default larger
  const [viewConfig, setViewConfig] = useState({ width: 'max-w-7xl', height: 'h-[90vh]' });
  const [showViewSettings, setShowViewSettings] = useState(false);

  // Modals
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // For existing groups
  
  // Info Panels (Right Side / Overlay)
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Chat State
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Search in Chat
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // Editing State for Group Info
  const [isEditingGroupInfo, setIsEditingGroupInfo] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  // Menus
  const [activeContextMenu, setActiveContextMenu] = useState<string | null>(null); // For sidebar list items
  const [activeMemberMenu, setActiveMemberMenu] = useState<string | null>(null); // For group member list
  
  // Inputs
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // For handling real file uploads
  const groupAvatarInputRef = useRef<HTMLInputElement>(null); // For group avatar

  // New Contact Logic
  const [newContactUsername, setNewContactUsername] = useState('');
  const [contactSearchResult, setContactSearchResult] = useState<P2PUserRegistry | null>(null);
  const [isSearchingContact, setIsSearchingContact] = useState(false);

  // New Group Flow
  const [newGroupStep, setNewGroupStep] = useState(1); 
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);

  // Profile Edit
  const [myBio, setMyBio] = useState('Disponible');
  const [myDisplayName, setMyDisplayName] = useState(myUsername);
  const [myAvatar, setMyAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${myUsername}`);
  const [myWebsite, setMyWebsite] = useState('');
  const [myLocation, setMyLocation] = useState('');
  const [myTags, setMyTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // --- DEV MODE STATE ---
  const [devClicks, setDevClicks] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [isDevModeUnlocked, setIsDevModeUnlocked] = useState(false);
  const [devTab, setDevTab] = useState<'code' | 'news' | 'custom'>('code');

  // --- GLOBAL CHAT & STATUS STATE ---
  const [globalFeed, setGlobalFeed] = useState<GlobalPost[]>([]);
  const [globalInput, setGlobalInput] = useState('');
  const [statusUpdates, setStatusUpdates] = useState<UserStatus[]>([]);
  const [viewingStatus, setViewingStatus] = useState<UserStatus | null>(null);
  const [globalBg, setGlobalBg] = useState<string | null>(null);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);
  
  // Status Privacy State
  const [statusPrivacy, setStatusPrivacy] = useState<'everyone' | 'contacts' | 'private'>('everyone');

  // Load Global Data & Statuses
  useEffect(() => {
      const savedFeed = localStorage.getItem('lucel_global_feed');
      if (savedFeed) setGlobalFeed(JSON.parse(savedFeed));

      const savedStatus = localStorage.getItem('lucel_statuses');
      if (savedStatus) setStatusUpdates(JSON.parse(savedStatus));

      const savedGlobalBg = localStorage.getItem('lucel_global_bg');
      if (savedGlobalBg) setGlobalBg(savedGlobalBg);
  }, []);

  // Derived
  const selectedContact = contacts.find(c => c.id === selectedContactId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Derive if I am a member of the selected group
  const isMeInGroup = selectedGroup ? selectedGroup.members.includes(myUsername) : false;

  // Filter messages for search
  const visibleMessages = (selectedContact ? selectedContact.messages : selectedGroup?.messages || []).filter(msg => {
      if (!isSearchingInChat || !chatSearchTerm) return true;
      return msg.content.toLowerCase().includes(chatSearchTerm.toLowerCase());
  });

  // Scroll to bottom
  useEffect(() => {
    if (!isSearchingInChat) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedContact?.messages, selectedGroup?.messages, isTyping, globalFeed, isSearchingInChat]);

  // --- GROUP MANAGEMENT LOGIC ---

  const getGroupRole = (groupId: string, username: string) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return 'none';
      if (group.admins.includes(username)) return 'admin';
      if (group.members.includes(username)) return 'member';
      return 'none';
  };

  const handleUpdateGroupInfo = () => {
      if (!selectedGroup) return;
      const iAmAdmin = selectedGroup.admins.includes(myUsername);
      const settings = selectedGroup.settings || { editInfo: 'everyone' };
      
      if (settings.editInfo === 'admins' && !iAmAdmin) {
          alert("Solo los administradores pueden editar la info de este grupo.");
          return;
      }

      onUpdateGroup({
          ...selectedGroup,
          name: editGroupName,
          description: editGroupDesc
      });
      setIsEditingGroupInfo(false);
  };

  const handleToggleGroupPermission = (setting: 'editInfo' | 'sendMessages') => {
      if (!selectedGroup) return;
      const iAmAdmin = selectedGroup.admins.includes(myUsername);
      
      if (!iAmAdmin) {
          alert("Solo los administradores pueden cambiar estos ajustes.");
          return;
      }

      const currentSettings = selectedGroup.settings || { editInfo: 'everyone', sendMessages: 'everyone', approveMembers: false };
      const newVal = (currentSettings[setting] === 'admins') ? 'everyone' : 'admins';

      onUpdateGroup({
          ...selectedGroup,
          settings: {
              ...currentSettings,
              [setting]: newVal
          }
      });
  };

  const handleGroupAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedGroup) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateGroup({ ...selectedGroup, avatar: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleMakeAdmin = (username: string) => {
      if (!selectedGroup) return;
      if (!selectedGroup.admins.includes(username)) {
          onUpdateGroup({
              ...selectedGroup,
              admins: [...selectedGroup.admins, username]
          });
      }
      setActiveMemberMenu(null);
  };

  const handleDismissAdmin = (username: string) => {
      if (!selectedGroup) return;
      onUpdateGroup({
          ...selectedGroup,
          admins: selectedGroup.admins.filter(a => a !== username)
      });
      setActiveMemberMenu(null);
  };

  const handleRemoveFromGroup = (username: string) => {
      if (!selectedGroup) return;
      onUpdateGroup({
          ...selectedGroup,
          members: selectedGroup.members.filter(m => m !== username),
          admins: selectedGroup.admins.filter(a => a !== username)
      });
      setActiveMemberMenu(null);
  };

  // TRUE WHATSAPP STYLE EXIT - SIMPLIFIED "INVISIBLE" LOGIC
  const handleLeaveGroup = () => {
      if (!selectedGroup) return;
      if (confirm("¿Salir del grupo? Desaparecerá de tu lista.")) {
          
          // 1. Remove me from logic (backend simulation)
          const newMembers = selectedGroup.members.filter(m => m !== myUsername);
          const newAdmins = selectedGroup.admins.filter(a => a !== myUsername);
          
          // Add system message "User left" (simulated for others)
          const leaveMsg: Message = {
              id: Date.now().toString(),
              role: 'model',
              content: `${myUsername} salió del grupo`,
              timestamp: Date.now(),
              attachment: { type: 'system' as any } 
          };

          // Update the group state globally (so others see I left)
          onUpdateGroup({
              ...selectedGroup,
              members: newMembers,
              admins: newAdmins,
              messages: [...selectedGroup.messages, leaveMsg]
          });

          // 2. IMMEDIATE LOCAL DELETION (INVISIBILITY)
          if (onDeleteGroup) {
              onDeleteGroup(selectedGroup.id);
          }
          
          // 3. Close UI
          setSelectedGroupId(null);
          setShowGroupInfo(false);
          setActiveTab('groups');
      }
  };

  const handleAddMemberToGroup = (username: string) => {
      if (!selectedGroup) return;
      if (!selectedGroup.members.includes(username)) {
          // Add system message
          const addMsg: Message = {
              id: Date.now().toString(),
              role: 'model',
              content: `${myUsername} añadió a ${username}`,
              timestamp: Date.now(),
              attachment: { type: 'system' as any }
          };

          onUpdateGroup({
              ...selectedGroup,
              members: [...selectedGroup.members, username],
              messages: [...selectedGroup.messages, addMsg]
          });
      }
  };

  // --- CONTACT ACTIONS (BLOCKING) ---
  const handleBlockContact = () => {
      if (!selectedContact) return;
      const isBlocked = selectedContact.isBlocked;
      if (confirm(isBlocked ? `¿Desbloquear a ${selectedContact.name}?` : `¿Bloquear a ${selectedContact.name}? No podrás enviarle mensajes.`)) {
          onUpdateContact({
              ...selectedContact,
              isBlocked: !isBlocked
          });
      }
  };

  // --- MEMBER CONTEXT MENU ACTIONS ---
  
  const handleMemberSendMessage = (memberName: string) => {
      setActiveMemberMenu(null);
      setShowGroupInfo(false); // Close group info
      
      // Find existing contact
      let contact = contacts.find(c => c.name === memberName);
      
      if (!contact) {
          // Create temp contact
          const newContact: CommunityContact = {
              id: `temp-${Date.now()}`,
              name: memberName,
              username: `@${memberName.replace(' ', '')}`,
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${memberName}`,
              status: 'online',
              messages: [],
              bio: 'Miembro del grupo',
              isRealUser: true
          };
          onAddContact(newContact);
          contact = newContact;
      }
      
      setSelectedContactId(contact.id);
      setSelectedGroupId(null);
      setActiveTab('chats');
  };

  const handleMemberViewProfile = (memberName: string) => {
      setActiveMemberMenu(null);
      let contact = contacts.find(c => c.name === memberName);
      if (contact) {
          setSelectedContactId(contact.id);
          setSelectedGroupId(null);
          setShowContactInfo(true); 
      } else {
          alert("Añade a este usuario a tus contactos primero para ver su perfil.");
      }
  };

  // --- STANDARD HANDLERS ---

  const handleProfileClick = () => {
      if (selectedContact?.isMiniLucel) {
          if (myUsername !== 'Lucel') return;
          setDevClicks(prev => {
              const newCount = prev + 1;
              if (newCount === 3) {
                  setShowPasswordModal(true);
                  return 0;
              }
              return newCount;
          });
      }
  };

  const verifyPassword = () => {
      if (devPassword === 'Lucel-1-Cod3-A') {
          setIsDevModeUnlocked(true);
          setShowPasswordModal(false);
          setDevPassword('');
      } else {
          alert("Acceso Denegado");
          setDevPassword('');
      }
  };

  const handleCustomizeMiniLucel = () => {
      if (myUsername !== 'Lucel') {
          alert("ACCESO DENEGADO.");
          return;
      }
      const miniLucel = contacts.find(c => c.isMiniLucel);
      if (miniLucel && onEditMiniLucel) {
          onEditMiniLucel(miniLucel);
          setIsDevModeUnlocked(false); 
      }
  };

  const handleSearchContact = () => {
      if (!newContactUsername) return;
      setIsSearchingContact(true);
      const searchTerm = newContactUsername.replace('@', '');
      
      const publicRegistry: P2PUserRegistry[] = JSON.parse(localStorage.getItem('lucel_public_users_v26') || '[]');
      const found = publicRegistry.find(u => u.username === searchTerm);

      if (found) {
          setContactSearchResult(found);
      } else {
          setContactSearchResult(null);
      }
      setIsSearchingContact(false);
  };

  const handleAddContact = (asRealUser: boolean) => {
      if (!newContactUsername) return;
      
      let name = newContactUsername;
      let avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
      
      if (asRealUser && contactSearchResult) {
          name = contactSearchResult.displayName;
          avatar = contactSearchResult.avatar;
      }

      onAddContact({
          id: Date.now().toString(),
          name: name,
          username: newContactUsername.startsWith('@') ? newContactUsername : `@${newContactUsername}`,
          avatar: avatar,
          status: 'online',
          messages: [],
          bio: asRealUser ? 'Usuario P2P' : 'Usuario Simulado',
          isRealUser: asRealUser
      });
      setShowAddContactModal(false);
      setNewContactUsername('');
      setContactSearchResult(null);
  };

  const handleGlobalBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const bg = reader.result as string;
              setGlobalBg(bg);
              localStorage.setItem('lucel_global_bg', bg);
              setShowGlobalMenu(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleDirectMessage = (userId: string, username: string, avatar: string) => {
      let existingContact = contacts.find(c => c.username.replace('@','') === userId || c.name === username);
      if (!existingContact) {
          const newContact: CommunityContact = {
              id: Date.now().toString(),
              name: username,
              username: `@${username.replace(' ', '')}`,
              avatar: avatar,
              status: 'online',
              messages: [],
              bio: 'Conectado desde Global',
              isRealUser: true 
          };
          onAddContact(newContact);
          existingContact = newContact;
      }
      setSelectedContactId(existingContact.id);
      setSelectedGroupId(null);
      setActiveTab('chats');
  };

  const handleStatusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const newStatus: UserStatus = {
                  id: Date.now().toString(),
                  userId: myUsername,
                  username: myDisplayName,
                  userAvatar: myAvatar,
                  media: reader.result as string,
                  type: file.type.startsWith('video') ? 'video' : 'image',
                  timestamp: Date.now(),
                  viewed: false,
                  privacy: statusPrivacy 
              };
              const updatedStatuses = [newStatus, ...statusUpdates];
              setStatusUpdates(updatedStatuses);
              localStorage.setItem('lucel_statuses', JSON.stringify(updatedStatuses));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCreateGroup = () => {
      if (!newGroupName) return;
      const finalMembers = [myUsername, ...newGroupMembers];
      onAddGroup({
          id: Date.now().toString(),
          name: newGroupName,
          description: newGroupDesc || 'Sin descripción',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${newGroupName}`,
          members: finalMembers,
          admins: [myUsername], 
          messages: [],
          inviteLink: `lucel.app/g/${Math.random().toString(36).substring(7)}`,
          creationDate: Date.now(),
          settings: { editInfo: 'everyone', sendMessages: 'everyone', approveMembers: false }
      });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupMembers([]);
      setNewGroupStep(1);
  };
  
  const toggleGroupMember = (username: string) => {
    if (newGroupMembers.includes(username)) {
        setNewGroupMembers(prev => prev.filter(u => u !== username));
    } else {
        setNewGroupMembers(prev => [...prev, username]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
          const base64Data = reader.result as string;
          const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'file';
          handleSend(type, base64Data);
      };
      reader.readAsDataURL(file);
  };

  const triggerFileUpload = (accept: string) => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = accept;
          fileInputRef.current.click();
      }
  };

  const handleSend = async (attachmentType?: string, attachmentData?: string) => {
      if (!input.trim() && !attachmentType) return;

      const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: input, 
          timestamp: Date.now(),
          attachment: attachmentType ? { 
              type: attachmentType as any, 
              url: attachmentData || '' 
          } : undefined
      };

      if (selectedContact) {
          if (selectedContact.isBlocked) {
              alert("No puedes enviar mensajes a un contacto bloqueado.");
              return;
          }

          const updatedContact = { ...selectedContact, messages: [...selectedContact.messages, userMsg] };
          onUpdateContact(updatedContact);
          setInput('');
          setShowAttachMenu(false);
          
          if (selectedContact.isRealUser) {
              const p2pMsg: P2PMessage = {
                  id: userMsg.id,
                  from: myUsername,
                  to: selectedContact.username.replace('@', ''),
                  content: attachmentType ? (attachmentData || '') : userMsg.content,
                  timestamp: Date.now(),
                  type: attachmentType as any || 'text'
              };
              const network: P2PMessage[] = JSON.parse(localStorage.getItem('lucel_p2p_network') || '[]');
              localStorage.setItem('lucel_p2p_network', JSON.stringify([...network, p2pMsg]));
          } else {
              setIsTyping(true);
              setTimeout(async () => {
                const replyText = await generateCommunityResponse(selectedContact, userMsg.content, selectedContact.messages, myUsername);
                const replyMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: replyText, timestamp: Date.now() };
                onUpdateContact({ ...updatedContact, messages: [...updatedContact.messages, replyMsg] });
                setIsTyping(false);
              }, 1500);
          }

      } else if (selectedGroup) {
          if (!isMeInGroup) {
              alert("No puedes enviar mensajes porque ya no eres participante del grupo.");
              return;
          }

          const updatedGroup = { ...selectedGroup, messages: [...selectedGroup.messages, userMsg] };
          onUpdateGroup(updatedGroup);
          setInput('');
          setShowAttachMenu(false);

          const network: P2PMessage[] = JSON.parse(localStorage.getItem('lucel_p2p_network') || '[]');
          const newPackets: P2PMessage[] = [];
          selectedGroup.members.forEach(member => {
              if (member !== myUsername) {
                  newPackets.push({
                      id: `${userMsg.id}-${member}`, 
                      from: myUsername,
                      to: member, 
                      content: attachmentType ? (attachmentData || '') : `[Grupo: ${selectedGroup.name}] ${userMsg.content}`,
                      timestamp: Date.now(),
                      type: attachmentType as any || 'text'
                  });
              }
          });
          localStorage.setItem('lucel_p2p_network', JSON.stringify([...network, ...newPackets]));

          // --- MINI-LUCEL GROUP AUTO-REPLY ---
          if (selectedGroup.members.includes('Mini-Lucel') || selectedGroup.members.some(m => m.toLowerCase().includes('lucel'))) {
              if (!attachmentType) {
                  setTimeout(async () => {
                      const miniLucelContact = contacts.find(c => c.isMiniLucel) || contacts[0];
                      const replyText = await generateCommunityResponse(
                          miniLucelContact,
                          userMsg.content,
                          selectedGroup.messages,
                          myUsername
                      );
                      const aiMsg: Message = {
                          id: (Date.now() + 1).toString(),
                          role: 'model',
                          content: replyText,
                          timestamp: Date.now()
                      };
                      const groupWithAiReply = { 
                          ...updatedGroup, 
                          messages: [...updatedGroup.messages, aiMsg] 
                      };
                      onUpdateGroup(groupWithAiReply);
                  }, 2000);
              }
          }
      }
  };

  const handlePostGlobal = () => {
      if (!globalInput.trim()) return;

      const newPost: GlobalPost = {
          id: Date.now().toString(),
          userId: myUsername,
          username: myDisplayName,
          avatar: myAvatar,
          content: globalInput,
          timestamp: Date.now(),
          likes: 0,
          replies: 0,
          isVerified: myUsername === 'Lucel' // Verify Lucel
      };

      const updatedFeed = [...globalFeed, newPost];
      setGlobalFeed(updatedFeed);
      localStorage.setItem('lucel_global_feed', JSON.stringify(updatedFeed));
      setGlobalInput('');
  };

  const handleAddTag = () => {
      if(tagInput.trim() && !myTags.includes(tagInput.trim())) {
          setMyTags([...myTags, tagInput.trim()]);
          setTagInput('');
      }
  };

  return (
    <div className={`mx-auto p-2 lg:p-4 animate-fade-in flex flex-col md:flex-row gap-4 lg:gap-6 relative transition-all duration-300 ${viewConfig.width} ${viewConfig.height}`} onClick={() => setActiveContextMenu(null)}>
       <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
       <input type="file" ref={groupAvatarInputRef} className="hidden" accept="image/*" onChange={handleGroupAvatarUpload} />

       {/* Sidebar / List */}
       <div className={`${(selectedContact || selectedGroup) ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex-col h-full shadow-lg`}>
           {/* Header */}
           <div className="bg-black/40 border-b border-gray-800 relative">
               <div className="flex items-center justify-between p-4">
                   <h2 className="text-xl font-brand font-bold text-white flex items-center gap-2">
                       <Globe className="text-primary w-5 h-5" /> RED LUCEL
                   </h2>
                   <div className="flex gap-2">
                        {/* VIEW SETTINGS BUTTON */}
                        <div className="relative">
                            <button onClick={() => setShowViewSettings(!showViewSettings)} className="text-gray-400 hover:text-white p-1 rounded"><Settings size={18}/></button>
                            {showViewSettings && (
                                <div className="absolute right-0 top-8 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-2 text-xs">
                                    <p className="text-gray-500 font-bold mb-2">TAMAÑO</p>
                                    <div className="space-y-1">
                                        <button onClick={() => setViewConfig({...viewConfig, width: 'max-w-5xl'})} className={`w-full text-left p-1 rounded ${viewConfig.width === 'max-w-5xl' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Compacto</button>
                                        <button onClick={() => setViewConfig({...viewConfig, width: 'max-w-7xl'})} className={`w-full text-left p-1 rounded ${viewConfig.width === 'max-w-7xl' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Estándar</button>
                                        <button onClick={() => setViewConfig({...viewConfig, width: 'max-w-[1600px]'})} className={`w-full text-left p-1 rounded ${viewConfig.width === 'max-w-[1600px]' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Ultra Ancho</button>
                                        <button onClick={() => setViewConfig({...viewConfig, width: 'w-full'})} className={`w-full text-left p-1 rounded ${viewConfig.width === 'w-full' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Pantalla Completa</button>
                                    </div>
                                    <div className="border-t border-gray-800 my-2"></div>
                                    <p className="text-gray-500 font-bold mb-2">ALTURA</p>
                                    <div className="space-y-1">
                                        <button onClick={() => setViewConfig({...viewConfig, height: 'h-[70vh]'})} className={`w-full text-left p-1 rounded ${viewConfig.height === 'h-[70vh]' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Pequeña</button>
                                        <button onClick={() => setViewConfig({...viewConfig, height: 'h-[90vh]'})} className={`w-full text-left p-1 rounded ${viewConfig.height === 'h-[90vh]' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Grande</button>
                                        <button onClick={() => setViewConfig({...viewConfig, height: 'h-full'})} className={`w-full text-left p-1 rounded ${viewConfig.height === 'h-full' ? 'bg-primary text-black' : 'text-white hover:bg-gray-800'}`}>Máxima</button>
                                    </div>
                                </div>
                            )}
                        </div>
                       <button onClick={onBack} className="md:hidden text-gray-400">Exit</button>
                   </div>
               </div>
               <div className="flex overflow-x-auto no-scrollbar">
                   <button onClick={() => setActiveTab('chats')} className={`flex-1 min-w-[80px] py-3 text-xs font-bold border-b-2 ${activeTab === 'chats' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>CHATS</button>
                   <button onClick={() => setActiveTab('groups')} className={`flex-1 min-w-[80px] py-3 text-xs font-bold border-b-2 ${activeTab === 'groups' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>GRUPOS</button>
                   <button onClick={() => setActiveTab('global')} className={`flex-1 min-w-[80px] py-3 text-xs font-bold border-b-2 ${activeTab === 'global' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-500'}`}>MUNDO</button>
                   <button onClick={() => setActiveTab('profile')} className={`flex-1 min-w-[80px] py-3 text-xs font-bold border-b-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>PERFIL</button>
               </div>
           </div>

           <div className="flex-1 overflow-y-auto bg-[#0b0d10]">
               {activeTab === 'chats' && (
                   <div className="p-2 space-y-1">
                       <button onClick={() => {setShowAddContactModal(true); setContactSearchResult(null); setNewContactUsername('');}} className="w-full py-3 mb-2 bg-primary/10 border border-primary/20 text-primary rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-primary/20 transition-colors">
                           <UserPlus size={16} /> Nuevo Contacto
                       </button>
                       {contacts.map(contact => (
                           <div key={contact.id} className="relative group">
                               <div onClick={() => { setSelectedContactId(contact.id); setSelectedGroupId(null); setShowGroupInfo(false); setShowContactInfo(false); }} className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${selectedContactId === contact.id ? 'bg-primary/10' : 'hover:bg-gray-800'}`}>
                                   <div className="relative">
                                       <img src={contact.avatar} className="w-12 h-12 rounded-full border border-gray-700" />
                                       {contact.isMiniLucel && <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5"><Smile size={10} className="text-white"/></div>}
                                       {contact.isRealUser && <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5"><Wifi size={10} className="text-white"/></div>}
                                       {contact.isBlocked && <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"><Ban size={16} className="text-red-500"/></div>}
                                   </div>
                                   <div className="flex-1 overflow-hidden">
                                       <div className="flex justify-between">
                                           <span className="font-bold text-gray-200 flex items-center gap-1">
                                               {contact.name}
                                               {contact.isMiniLucel && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded">AI</span>}
                                           </span>
                                           <span className="text-[10px] text-gray-500">{contact.messages.length > 0 ? new Date(contact.messages[contact.messages.length-1].timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                                       </div>
                                       <p className="text-xs text-gray-500 truncate">
                                           {contact.isBlocked ? 'Bloqueado' : contact.messages.length > 0 
                                            ? (contact.messages[contact.messages.length-1].attachment ? '[Adjunto]' : contact.messages[contact.messages.length-1].content) 
                                            : contact.bio}
                                       </p>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               )}

               {activeTab === 'groups' && (
                   <div className="p-2 space-y-1">
                       <button onClick={() => { setShowCreateGroupModal(true); setNewGroupStep(1); }} className="w-full py-3 mb-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center justify-center gap-2 font-bold hover:bg-green-500/20 transition-colors">
                           <Users2 size={16} /> Crear Grupo
                       </button>
                       {groups.map(group => {
                           const amIMember = group.members.includes(myUsername);
                           return (
                           <div key={group.id} className="relative group/item">
                               <div onClick={() => { setSelectedGroupId(group.id); setSelectedContactId(null); setShowGroupInfo(false); setShowContactInfo(false); }} className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${selectedGroupId === group.id ? 'bg-green-500/10' : 'hover:bg-gray-800'}`}>
                                   <img src={group.avatar} className={`w-12 h-12 rounded-full border border-gray-700 ${!amIMember ? 'grayscale' : ''}`} />
                                   <div className="flex-1 overflow-hidden">
                                       <div className="flex justify-between">
                                           <span className="font-bold text-gray-200">{group.name}</span>
                                       </div>
                                       <p className="text-xs text-gray-500 truncate">
                                           {!amIMember ? 'Saliste del grupo' : group.messages.length > 0 
                                            ? (group.messages[group.messages.length-1].attachment ? '[Adjunto]' : group.messages[group.messages.length-1].content)
                                            : `${group.members.length} miembros`}
                                       </p>
                                   </div>
                               </div>
                               
                               {/* SIDEBAR CONTEXT MENU FOR GROUPS */}
                               <button onClick={(e) => { e.stopPropagation(); setActiveContextMenu(activeContextMenu === group.id ? null : group.id); }} className="absolute right-2 top-4 text-gray-500 hover:text-white p-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity">
                                   <MoreVertical size={16}/>
                               </button>
                               {activeContextMenu === group.id && (
                                   <div className="absolute right-0 top-10 w-40 bg-black border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                       {amIMember ? (
                                           <button onClick={() => { handleLeaveGroup(); setActiveContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-900/20 text-red-400 flex items-center gap-2"><LogOut size={12}/> Salir del grupo</button>
                                       ) : (
                                           <button onClick={() => { if(onDeleteGroup) onDeleteGroup(group.id); setActiveContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-900/20 text-red-400 flex items-center gap-2"><Trash size={12}/> Eliminar grupo</button>
                                       )}
                                   </div>
                               )}
                           </div>
                       )})}
                   </div>
               )}

               {/* GLOBAL TAB - RESTORED EPIC LOOK */}
               {activeTab === 'global' && (
                    <div className="flex flex-col h-full relative">
                        {/* Status Bar */}
                        <div className="p-4 border-b border-gray-800 flex gap-4 overflow-x-auto no-scrollbar bg-black/20 shrink-0 items-center">
                            <div className="flex flex-col gap-2 min-w-[70px]">
                                <label className="flex flex-col items-center gap-1 cursor-pointer">
                                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-primary transition-colors bg-gray-900">
                                        <Plus size={20} className="text-gray-400"/>
                                    </div>
                                    <span className="text-[10px] text-gray-400">Tu Estado</span>
                                    <input type="file" accept="image/*,video/*" onChange={handleStatusUpload} className="hidden" />
                                </label>
                                {/* PRIVACY TOGGLE */}
                                <button 
                                    onClick={() => setStatusPrivacy(prev => prev === 'everyone' ? 'contacts' : prev === 'contacts' ? 'private' : 'everyone')}
                                    className="flex items-center justify-center gap-1 text-[9px] bg-gray-800 rounded px-1 py-0.5 text-gray-400 hover:text-white"
                                >
                                    {statusPrivacy === 'everyone' && <><Globe size={10}/> Todos</>}
                                    {statusPrivacy === 'contacts' && <><Users size={10}/> Amigos</>}
                                    {statusPrivacy === 'private' && <><Lock size={10}/> Solo Yo</>}
                                </button>
                            </div>

                            {statusUpdates.map(status => (
                                <div key={status.id} className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]" onClick={() => setViewingStatus(status)}>
                                    <div className={`w-14 h-14 rounded-full p-0.5 ${status.viewed ? 'bg-gray-600' : 'bg-gradient-to-tr from-primary to-purple-600'}`}>
                                        <img src={status.userAvatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                                    </div>
                                    <span className="text-[10px] text-gray-300 truncate w-14 text-center">{status.username}</span>
                                </div>
                            ))}
                        </div>

                        {/* Global Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6" style={{ backgroundImage: globalBg ? `url(${globalBg})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {globalBg && <div className="fixed inset-0 bg-black/50 pointer-events-none"></div>}
                            
                            {/* Global Menu */}
                            <div className="absolute top-2 right-2 z-20">
                                <button onClick={() => setShowGlobalMenu(!showGlobalMenu)} className="p-2 bg-black/50 rounded-full text-white hover:bg-primary hover:text-black transition-colors"><MoreVertical size={16}/></button>
                                {showGlobalMenu && (
                                    <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-fade-in">
                                        <label className="w-full text-left px-4 py-3 text-xs hover:bg-white/10 text-white flex items-center gap-2 cursor-pointer">
                                            <Wallpaper size={14} /> Fondo de Pantalla
                                            <input type="file" accept="image/*" className="hidden" onChange={handleGlobalBgUpload} />
                                        </label>
                                        <button onClick={() => { setGlobalBg(null); localStorage.removeItem('lucel_global_bg'); setShowGlobalMenu(false); }} className="w-full text-left px-4 py-3 text-xs hover:bg-red-900/20 text-red-400 flex items-center gap-2 border-t border-gray-800">
                                            <Trash size={14} /> Quitar Fondo
                                        </button>
                                    </div>
                                )}
                            </div>

                            {globalFeed.slice().reverse().map(post => (
                                <div key={post.id} className="relative z-10 flex gap-3 animate-fade-in border-b border-gray-800/50 pb-4 bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                                    <img src={post.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary/50"/>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-white text-base">{post.username}</span>
                                            {post.isVerified && <CheckCircle size={14} className="text-blue-400" />}
                                            {post.userId === 'Lucel' && <Bird size={14} className="text-primary fill-primary animate-pulse-slow ml-1" />}
                                            <span className="text-xs text-gray-500 ml-auto">@{post.userId} • {new Date(post.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-gray-200 text-sm mt-1 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                        <div className="flex gap-6 mt-3 text-gray-400 border-t border-white/10 pt-2">
                                            <button className="flex items-center gap-2 text-xs hover:text-red-500 transition-colors"><Heart size={16}/> {post.likes}</button>
                                            <button onClick={() => handleDirectMessage(post.userId, post.username, post.avatar)} className="flex items-center gap-2 text-xs hover:text-blue-500 transition-colors"><MessageCircle size={16}/> Mensaje</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* EXPANDED GLOBAL INPUT */}
                        <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur shrink-0 z-20">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3">
                                    <img src={myAvatar} className="w-10 h-10 rounded-full border border-gray-700 mt-1"/>
                                    <div className="flex-1 bg-gray-800 rounded-xl p-3 border border-gray-700 focus-within:border-primary transition-all shadow-inner">
                                        <textarea 
                                            value={globalInput}
                                            onChange={(e) => setGlobalInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostGlobal(); }}}
                                            placeholder="¿Qué está pasando en la red?..."
                                            className="w-full bg-transparent text-white outline-none text-sm placeholder-gray-500 h-16 resize-none"
                                        />
                                        <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
                                            <span className="text-[10px] text-gray-500">Visible para todos</span>
                                            <button onClick={handlePostGlobal} className="bg-primary text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-yellow-400 flex items-center gap-2 transition-transform active:scale-95 ml-auto shadow-lg shadow-primary/20">
                                                <Send size={14}/> Publicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
               )}

               {/* Profile Tab Implementation (RESTORED FULLY & EXPANDED) */}
               {activeTab === 'profile' && (
                   <div className="p-6 flex flex-col items-center h-full overflow-y-auto">
                       {/* Profile Header */}
                       <div className="w-full h-32 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl mb-[-40px] relative overflow-hidden shadow-lg">
                           <div className="absolute inset-0 bg-black/20"></div>
                           <div className="absolute top-2 right-2 text-white/50 text-[10px]">ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                       </div>
                       
                       <div className="w-32 h-32 rounded-full border-4 border-gray-900 p-1 mb-4 relative group z-10 bg-gray-900 shadow-xl">
                           <img src={myAvatar} className="w-full h-full rounded-full bg-gray-800 object-cover" />
                           <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <Camera className="text-white" size={24} />
                           </div>
                           <input type="file" accept="image/*" onChange={(e) => {
                               if(e.target.files?.[0]) {
                                   const r = new FileReader();
                                   r.onload = () => setMyAvatar(r.result as string);
                                   r.readAsDataURL(e.target.files[0]);
                               }
                           }} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                       </div>
                       
                       {/* Name & ID */}
                       <div className="text-center w-full border-b border-gray-800 pb-6 mb-6">
                           <div className="flex items-center justify-center gap-2 mb-1">
                               <input 
                                   value={myDisplayName}
                                   onChange={(e) => setMyDisplayName(e.target.value)}
                                   className="bg-transparent text-2xl font-bold text-center text-white border-b border-transparent focus:border-primary outline-none w-auto max-w-[200px]"
                               />
                               <Edit2 size={14} className="text-gray-500" />
                               {myUsername === 'Lucel' && <Bird size={20} className="text-primary fill-primary" />}
                           </div>
                           <p className="text-gray-500 text-sm font-mono">@{myUsername}</p>
                       </div>

                       {/* Bio & Details - EXPANDED WIDTH */}
                       <div className="w-full space-y-6">
                           <div>
                               <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Estado / Info</label>
                               <div className="bg-gray-800 rounded-lg flex items-center p-3 border border-gray-700">
                                   <Smile size={16} className="text-primary mr-3" />
                                   <input 
                                       value={myBio}
                                       onChange={(e) => setMyBio(e.target.value)}
                                       className="bg-transparent text-white text-sm w-full outline-none"
                                   />
                               </div>
                           </div>

                           <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ubicación</label>
                                <div className="bg-gray-800 rounded-lg flex items-center p-3 border border-gray-700">
                                   <MapPin size={16} className="text-green-500 mr-3" />
                                   <input 
                                       value={myLocation}
                                       onChange={(e) => setMyLocation(e.target.value)}
                                       placeholder="¿Dónde estás?"
                                       className="bg-transparent text-white text-sm w-full outline-none"
                                   />
                               </div>
                           </div>

                           <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Sitio Web</label>
                                <div className="bg-gray-800 rounded-lg flex items-center p-3 border border-gray-700">
                                   <Link size={16} className="text-blue-500 mr-3" />
                                   <input 
                                       value={myWebsite}
                                       onChange={(e) => setMyWebsite(e.target.value)}
                                       placeholder="https://..."
                                       className="bg-transparent text-white text-sm w-full outline-none"
                                   />
                               </div>
                           </div>

                           <div>
                               <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Etiquetas</label>
                               <div className="flex flex-wrap gap-2 mb-2">
                                   {myTags.map(tag => (
                                       <span key={tag} className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300 flex items-center gap-1">
                                           #{tag} <button onClick={() => setMyTags(myTags.filter(t => t !== tag))}><X size={10}/></button>
                                       </span>
                                   ))}
                               </div>
                               <div className="flex gap-2">
                                   <input 
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    placeholder="Añadir etiqueta..."
                                    className="bg-gray-800 rounded px-3 py-2 text-sm text-white outline-none border border-gray-700 flex-1"
                                    onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                   />
                                   <button onClick={handleAddTag} className="bg-gray-700 p-2 rounded text-white hover:bg-gray-600"><Plus size={16}/></button>
                               </div>
                           </div>
                       </div>
                   </div>
               )}
           </div>
       </div>

       {/* CHAT AREA */}
       {(selectedContact || selectedGroup) && (
       <div className={`${(!selectedContact && !selectedGroup) ? 'hidden md:flex' : 'flex'} flex-1 bg-black border border-gray-800 rounded-xl flex-col relative overflow-hidden h-full shadow-2xl transition-all duration-300 ${showGroupInfo || showContactInfo ? 'mr-[350px]' : ''}`}>
            {/* Header */}
            <div className="h-16 border-b border-gray-800 bg-[#1f293b] flex items-center justify-between px-4 shrink-0 z-20 relative">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                    if (selectedGroup) {
                        setShowGroupInfo(true);
                        setIsEditingGroupInfo(false);
                    } else if (selectedContact) {
                        setShowContactInfo(true);
                    }
                }}>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedContactId(null); setSelectedGroupId(null); }} className="md:hidden text-gray-400"><ArrowLeft /></button>
                    <img src={selectedContact ? selectedContact.avatar : selectedGroup?.avatar} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                            {selectedContact ? selectedContact.name : selectedGroup?.name}
                            {selectedContact?.isBlocked && <Ban size={12} className="text-red-500"/>}
                        </h4>
                        <p className="text-xs text-primary truncate max-w-[200px]">
                            {selectedContact 
                                ? (selectedContact.isBlocked ? 'Bloqueado' : isTyping ? 'Escribiendo...' : selectedContact.status) 
                                : selectedGroup?.members.length + " miembros"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setIsSearchingInChat(!isSearchingInChat); setChatSearchTerm(''); }} className={`p-2 hover:text-white ${isSearchingInChat ? 'text-primary' : 'text-gray-300'}`}><Search size={20} /></button>
                    {selectedGroup && <button onClick={() => setShowGroupInfo(!showGroupInfo)} className="p-2 text-gray-300 hover:text-white"><MoreVertical size={20} /></button>}
                    {!selectedGroup && <button onClick={() => setShowContactInfo(!showContactInfo)} className="p-2 text-gray-300 hover:text-white"><Settings size={20} /></button>}
                </div>
            </div>

            {/* Chat Search Bar */}
            {isSearchingInChat && (
                <div className="p-2 bg-[#1f293b] border-b border-gray-700 flex items-center gap-2 animate-fade-in-down">
                    <Search size={16} className="text-gray-400"/>
                    <input 
                        autoFocus 
                        value={chatSearchTerm} 
                        onChange={e => setChatSearchTerm(e.target.value)} 
                        placeholder="Buscar en el chat..." 
                        className="bg-transparent text-white text-sm outline-none flex-1"
                    />
                    <button onClick={() => setIsSearchingInChat(false)}><X size={16} className="text-gray-400"/></button>
                </div>
            )}

            {/* Messages */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b0d10] custom-scrollbar relative"
                style={{
                    backgroundImage: (selectedContact?.chatTheme?.backgroundImage || selectedGroup?.chatTheme?.backgroundImage) ? `url(${selectedContact?.chatTheme?.backgroundImage || selectedGroup?.chatTheme?.backgroundImage})` : 'radial-gradient(#1f293b 1px, transparent 1px)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {(selectedContact?.chatTheme?.backgroundImage || selectedGroup?.chatTheme?.backgroundImage) && <div className="absolute inset-0 bg-black/50 fixed pointer-events-none"></div>}
                
                <div className="relative z-10 space-y-2">
                    {/* Only show messages matching search */}
                    {visibleMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.attachment?.type === 'system' ? (
                                <div className="w-full flex justify-center my-2">
                                    <span className="bg-gray-800/80 text-gray-400 text-[10px] px-3 py-1 rounded-full border border-gray-700/50">{msg.content}</span>
                                </div>
                            ) : (
                                <div 
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${msg.role === 'user' ? 'text-white rounded-tr-none' : 'bg-[#1f2c34] text-gray-200 rounded-tl-none'}`}
                                    style={{ backgroundColor: msg.role === 'user' ? (selectedContact?.chatTheme?.userBubbleColor || selectedGroup?.chatTheme?.userBubbleColor || '#005c4b') : undefined }}
                                >
                                    {msg.attachment ? (
                                        <div className="mb-2">
                                            {msg.attachment.type === 'image' && <img src={msg.attachment.url} className="rounded-lg max-h-60 border border-white/10" />}
                                            {msg.attachment.type === 'audio' && <audio src={msg.attachment.url} controls className="w-full h-8" />}
                                            {(msg.attachment.type !== 'image' && msg.attachment.type !== 'audio') && (
                                                <div className="p-2 bg-black/20 rounded text-xs flex items-center gap-2">
                                                    <FileText size={14}/> [Adjunto: {msg.attachment.type}]
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                    <div className="text-[9px] text-white/50 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input with Real Media Handling */}
            {selectedContact?.isBlocked ? (
                <div className="p-4 bg-[#1f293b] text-center text-red-400 text-sm font-bold border-t border-gray-700">
                    Has bloqueado a este contacto. Toca para desbloquear.
                    <button onClick={handleBlockContact} className="block mx-auto mt-2 text-white bg-red-600 px-4 py-1 rounded text-xs">Desbloquear</button>
                </div>
            ) : (selectedGroup && !isMeInGroup) ? (
                <div className="p-4 bg-[#1f293b] text-center text-gray-400 text-sm border-t border-gray-700 italic">
                    No puedes enviar mensajes a este grupo porque ya no eres participante.
                </div>
            ) : (
                <div className="p-3 bg-[#1f293b] flex items-center gap-2 border-t border-gray-700 shrink-0 relative z-20">
                    <div className="relative">
                        <button onClick={() => setShowAttachMenu(!showAttachMenu)} className={`p-2 rounded-full transition-colors ${showAttachMenu ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}>
                            <Plus size={20} className={showAttachMenu ? 'rotate-45 transition-transform' : 'transition-transform'}/>
                        </button>
                        {showAttachMenu && (
                            <div className="absolute bottom-12 left-0 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col gap-2 w-40 animate-fade-in-up">
                                <button onClick={() => triggerFileUpload('image/*')} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded text-sm text-white"><div className="bg-purple-500 p-1.5 rounded-full"><Image size={14}/></div> Galería</button>
                                <button onClick={() => triggerFileUpload('audio/*')} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded text-sm text-white"><div className="bg-red-500 p-1.5 rounded-full"><Mic size={14}/></div> Audio</button>
                                <button onClick={() => triggerFileUpload('*/*')} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded text-sm text-white"><div className="bg-blue-500 p-1.5 rounded-full"><FileText size={14}/></div> Documento</button>
                            </div>
                        )}
                    </div>

                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} type="text" placeholder="Mensaje..." className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 text-white outline-none placeholder-gray-500 text-sm" />
                    <button onClick={() => handleSend()} className="p-2.5 bg-[#00a884] text-white rounded-full hover:brightness-110 shadow-lg"><Send size={18} /></button>
                </div>
            )}
       </div>
       )}

       {/* --- RIGHT SIDE INFO PANELS (OVERLAY) --- */}
       
       {/* GROUP INFO PANEL (WhatsApp Style) */}
       {selectedGroup && showGroupInfo && (
           <div className="absolute right-0 top-0 bottom-0 w-[350px] bg-[#0b0d10] border-l border-gray-800 z-40 flex flex-col shadow-2xl animate-slide-in-right">
               <div className="h-16 flex items-center gap-4 px-4 border-b border-gray-800 bg-[#1f293b]">
                   <button onClick={() => setShowGroupInfo(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                   <span className="font-bold text-white">Info. del grupo</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                   {/* Header Image */}
                   <div className="flex flex-col items-center mb-6 relative group">
                       <img src={selectedGroup.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 mb-3" />
                       {isMeInGroup && (
                           <button onClick={() => groupAvatarInputRef.current?.click()} className="absolute bottom-14 right-24 bg-primary text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                               <Camera size={16}/>
                           </button>
                       )}
                   </div>

                   {/* Info Card */}
                   <div className="bg-gray-900 rounded-xl p-4 mb-4">
                       {isEditingGroupInfo ? (
                           <div className="space-y-3">
                               <input value={editGroupName} onChange={e => setEditGroupName(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-gray-700" placeholder="Nombre" />
                               <textarea value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} className="w-full bg-black p-2 rounded text-white border border-gray-700" placeholder="Descripción" rows={3}/>
                               <div className="flex justify-end gap-2">
                                   <button onClick={() => setIsEditingGroupInfo(false)} className="text-red-400 text-xs font-bold">Cancelar</button>
                                   <button onClick={handleUpdateGroupInfo} className="text-green-400 text-xs font-bold">Guardar</button>
                               </div>
                           </div>
                       ) : (
                           <>
                               <div className="flex justify-between items-start mb-2">
                                   <h2 className="text-xl font-bold text-white">{selectedGroup.name}</h2>
                                   {(isMeInGroup && (selectedGroup.settings?.editInfo === 'everyone' || selectedGroup.admins.includes(myUsername))) && (
                                       <button onClick={() => setIsEditingGroupInfo(true)} className="text-primary hover:text-white"><Edit2 size={16}/></button>
                                   )}
                               </div>
                               <p className="text-sm text-gray-400">Grupo · {selectedGroup.members.length} miembros</p>
                               <p className="text-sm text-gray-300 mt-3">{selectedGroup.description}</p>
                           </>
                       )}
                   </div>

                   {/* Group Settings */}
                   <div className="bg-gray-900 rounded-xl p-4 mb-4 space-y-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase">Configuración</h3>
                       <div className="flex justify-between items-center">
                           <span className="text-sm text-white">Editar Info. del Grupo</span>
                           <button onClick={() => handleToggleGroupPermission('editInfo')} disabled={!isMeInGroup} className={`text-xs px-2 py-1 rounded ${selectedGroup.settings?.editInfo === 'admins' ? 'bg-primary text-black' : 'bg-gray-700 text-white'}`}>
                               {selectedGroup.settings?.editInfo === 'admins' ? 'Solo Admins' : 'Todos'}
                           </button>
                       </div>
                       <div className="flex justify-between items-center">
                           <span className="text-sm text-white">Enviar Mensajes</span>
                           <button onClick={() => handleToggleGroupPermission('sendMessages')} disabled={!isMeInGroup} className={`text-xs px-2 py-1 rounded ${selectedGroup.settings?.sendMessages === 'admins' ? 'bg-primary text-black' : 'bg-gray-700 text-white'}`}>
                               {selectedGroup.settings?.sendMessages === 'admins' ? 'Solo Admins' : 'Todos'}
                           </button>
                       </div>
                   </div>

                   {/* Members List */}
                   <div className="bg-gray-900 rounded-xl p-4 mb-4">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xs font-bold text-gray-500 uppercase">{selectedGroup.members.length} participantes</h3>
                           {isMeInGroup && <button onClick={() => setShowAddMemberModal(true)} className="text-green-400 hover:text-green-300 flex items-center gap-1 text-xs font-bold"><UserPlus size={14}/> Añadir</button>}
                       </div>
                       
                       <div className="space-y-3">
                           {selectedGroup.members.map(member => {
                               const role = getGroupRole(selectedGroup.id, member);
                               const isMe = member === myUsername;
                               return (
                                   <div key={member} className="flex items-center justify-between group/member relative">
                                       <div className="flex items-center gap-3">
                                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${member}`} className="w-10 h-10 rounded-full bg-gray-800"/>
                                           <div>
                                               <p className="text-sm font-bold text-white flex items-center gap-1">
                                                   {member} {isMe && '(Tú)'} 
                                                   {role === 'admin' && <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 rounded border border-green-500/30">Admin</span>}
                                               </p>
                                               <p className="text-[10px] text-gray-500">{contacts.find(c => c.name === member)?.bio || 'Disponible'}</p>
                                           </div>
                                       </div>
                                       
                                       {/* Context Menu Trigger - Only if MeInGroup */}
                                       {!isMe && isMeInGroup && (
                                           <button onClick={() => setActiveMemberMenu(activeMemberMenu === member ? null : member)} className="text-gray-500 hover:text-white p-1">
                                               <MoreVertical size={16}/>
                                           </button>
                                       )}

                                       {/* Member Context Menu */}
                                       {activeMemberMenu === member && (
                                           <div className="absolute right-8 top-0 w-40 bg-black border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                               {/* ACTUAL FUNCTIONAL BUTTONS */}
                                               <button onClick={() => handleMemberSendMessage(member)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white flex items-center gap-2"><MessageCircle size={12}/> Enviar mensaje</button>
                                               <button onClick={() => handleMemberViewProfile(member)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-white flex items-center gap-2"><User size={12}/> Ver perfil</button>
                                               
                                               {/* Admin Actions */}
                                               {selectedGroup.admins.includes(myUsername) && (
                                                   <>
                                                       <div className="border-t border-gray-800 my-1"></div>
                                                       {role !== 'admin' ? (
                                                           <button onClick={() => handleMakeAdmin(member)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-green-400 flex items-center gap-2"><Crown size={12}/> Hacer Admin</button>
                                                       ) : (
                                                           <button onClick={() => handleDismissAdmin(member)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 text-yellow-400 flex items-center gap-2"><Shield size={12}/> Quitar Admin</button>
                                                       )}
                                                       <button onClick={() => handleRemoveFromGroup(member)} className="w-full text-left px-3 py-2 text-xs hover:bg-red-900/20 text-red-400 flex items-center gap-2"><Ban size={12}/> Eliminar</button>
                                                   </>
                                               )}
                                           </div>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                   </div>

                   {/* Exit Group / Delete Group */}
                   <div className="space-y-2">
                       {isMeInGroup ? (
                           <button onClick={handleLeaveGroup} className="w-full py-3 bg-red-900/10 text-red-500 rounded-lg flex items-center gap-3 justify-center hover:bg-red-900/20 transition-colors font-bold text-sm">
                               <LogOut size={18}/> Salir del grupo
                           </button>
                       ) : (
                           <button onClick={() => onDeleteGroup && onDeleteGroup(selectedGroup.id)} className="w-full py-3 bg-red-900/10 text-red-500 rounded-lg flex items-center gap-3 justify-center hover:bg-red-900/20 transition-colors font-bold text-sm">
                               <Trash size={18}/> Eliminar grupo
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* CONTACT INFO PANEL (Instagram Style) */}
       {selectedContact && showContactInfo && (
           <div className="absolute right-0 top-0 bottom-0 w-[350px] bg-[#0b0d10] border-l border-gray-800 z-40 flex flex-col shadow-2xl animate-slide-in-right">
               <div className="h-16 flex items-center gap-4 px-4 border-b border-gray-800 bg-[#1f293b]">
                   <button onClick={() => setShowContactInfo(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                   <span className="font-bold text-white">Info. del contacto</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                   <div className="flex flex-col items-center mb-6">
                       <img src={selectedContact.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 mb-3" />
                       <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
                       <p className="text-gray-500 text-sm">{selectedContact.username}</p>
                   </div>

                   <div className="bg-gray-900 rounded-xl p-4 mb-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Info</h3>
                       <p className="text-white text-sm">{selectedContact.bio || 'Sin info.'}</p>
                       <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
                   </div>

                   {/* ACTUAL MEDIA GALLERY */}
                   <div className="bg-gray-900 rounded-xl p-4 mb-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Archivos, enlaces y docs</h3>
                       <div className="grid grid-cols-3 gap-2">
                           {selectedContact.messages.filter(m => m.attachment?.type === 'image').slice(0, 6).map((m, i) => (
                               <div key={i} className="aspect-square bg-gray-800 rounded flex items-center justify-center overflow-hidden cursor-pointer">
                                   <img src={m.attachment?.url} className="w-full h-full object-cover" />
                               </div>
                           ))}
                           {selectedContact.messages.filter(m => m.attachment?.type === 'image').length === 0 && (
                               <div className="col-span-3 text-center text-xs text-gray-600 py-4">Sin fotos.</div>
                           )}
                       </div>
                   </div>

                   <div className="space-y-2">
                        <button onClick={handleBlockContact} className="w-full py-3 bg-gray-900 rounded-lg flex items-center justify-between px-4 text-sm text-red-400 hover:bg-gray-800">
                           <span className="flex items-center gap-2">
                               {selectedContact.isBlocked ? <><CheckCircle size={16}/> Desbloquear</> : <><Ban size={16}/> Bloquear</>} 
                               a {selectedContact.name}
                           </span>
                        </button>
                   </div>
               </div>
           </div>
       )}
       
       {(!selectedContact && !selectedGroup) && (activeTab === 'global' || activeTab === 'profile') && (
           <div className="hidden md:flex flex-1 items-center justify-center flex-col bg-black border border-gray-800 rounded-xl p-8">
               <Globe size={64} className="text-gray-700 mb-4 animate-pulse-slow" />
               <h3 className="text-2xl font-bold text-gray-500">Lucel Global Network</h3>
               <p className="text-gray-600 text-sm mt-2">Connecting minds across the neural web.</p>
           </div>
       )}

       {/* CREATE GROUP MODAL - REAL MEMBERS */}
       {showCreateGroupModal && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
               <div className="bg-gray-900 border border-green-500 p-6 rounded-xl w-full max-w-sm">
                   {newGroupStep === 1 ? (
                       <>
                           <h3 className="text-white font-bold mb-4">Crear Nuevo Grupo</h3>
                           <input placeholder="Nombre del Grupo" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} className="w-full bg-gray-800 p-3 rounded text-white mb-4 outline-none border border-gray-700" />
                           <div className="flex justify-end gap-2">
                               <button onClick={() => setShowCreateGroupModal(false)} className="px-4 py-2 text-gray-400">Cancelar</button>
                               <button onClick={() => setNewGroupStep(2)} className="px-4 py-2 bg-green-600 text-white rounded font-bold">Siguiente</button>
                           </div>
                       </>
                   ) : (
                       <>
                           <h3 className="text-white font-bold mb-4">Añadir Miembros</h3>
                           <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                               {contacts.map(c => (
                                   <div key={c.id} onClick={() => toggleGroupMember(c.name)} className={`p-2 rounded flex items-center justify-between cursor-pointer ${newGroupMembers.includes(c.name) ? 'bg-green-900/40 border border-green-500' : 'bg-gray-800'}`}>
                                       <div className="flex items-center gap-2">
                                           <img src={c.avatar} className="w-8 h-8 rounded-full"/>
                                           <span className="text-sm text-white">{c.name}</span>
                                       </div>
                                       {newGroupMembers.includes(c.name) && <CheckCircle size={16} className="text-green-500"/>}
                                   </div>
                               ))}
                           </div>
                           <button onClick={handleCreateGroup} className="w-full py-3 bg-green-600 text-white rounded font-bold">Crear Grupo Real</button>
                       </>
                   )}
               </div>
           </div>
       )}

       {/* ADD MEMBER MODAL (For existing groups) */}
       {showAddMemberModal && selectedGroup && (
           <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-gray-900 border border-green-500 p-6 rounded-xl w-full max-w-sm">
                   <h3 className="text-white font-bold mb-4">Añadir a {selectedGroup.name}</h3>
                   <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                       {contacts.filter(c => !selectedGroup.members.includes(c.name)).map(c => (
                           <div key={c.id} onClick={() => handleAddMemberToGroup(c.name)} className="p-2 rounded flex items-center justify-between cursor-pointer bg-gray-800 hover:bg-gray-700">
                               <div className="flex items-center gap-2">
                                   <img src={c.avatar} className="w-8 h-8 rounded-full"/>
                                   <span className="text-sm text-white">{c.name}</span>
                               </div>
                               <Plus size={16} className="text-green-500"/>
                           </div>
                       ))}
                       {contacts.filter(c => !selectedGroup.members.includes(c.name)).length === 0 && (
                           <p className="text-gray-500 text-sm text-center">Todos tus contactos ya están en el grupo.</p>
                       )}
                   </div>
                   <button onClick={() => setShowAddMemberModal(false)} className="w-full py-2 bg-gray-700 text-white rounded">Cerrar</button>
               </div>
           </div>
       )}

       {/* STATUS VIEWER MODAL */}
       {viewingStatus && (
           <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center">
               <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
                    <img src={viewingStatus.userAvatar} className="w-10 h-10 rounded-full border border-white"/>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">{viewingStatus.username}</span>
                        <span className="text-gray-300 text-xs">{new Date(viewingStatus.timestamp).toLocaleTimeString()}</span>
                    </div>
               </div>
               <button onClick={() => setViewingStatus(null)} className="absolute top-4 right-4 z-50 text-white"><X size={32}/></button>
               
               <div className="w-full max-w-md h-full flex items-center justify-center">
                   {viewingStatus.type === 'video' ? (
                       <video src={viewingStatus.media} controls autoPlay className="max-h-full max-w-full" />
                   ) : (
                       <img src={viewingStatus.media} className="max-h-full max-w-full object-contain" />
                   )}
               </div>
           </div>
       )}

       {/* Add Contact Modal */}
       {showAddContactModal && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
               <div className="bg-gray-900 border border-primary p-6 rounded-xl w-full max-w-sm">
                   <h3 className="text-white font-bold mb-4">Añadir Contacto Global</h3>
                   <div className="flex gap-2 mb-4">
                       <input 
                        placeholder="Buscar ID (ej: @neo)" 
                        value={newContactUsername} 
                        onChange={e => setNewContactUsername(e.target.value)} 
                        className="flex-1 bg-gray-800 p-2 rounded text-white outline-none border border-gray-700 focus:border-primary" 
                       />
                       <button onClick={handleSearchContact} className="bg-gray-700 p-2 rounded hover:bg-gray-600">
                           <Search size={20} className={isSearchingContact ? 'animate-spin' : ''}/>
                       </button>
                   </div>
                   {contactSearchResult ? (
                       <div className="bg-gray-800 p-3 rounded mb-4 flex items-center gap-3 border border-green-500/50">
                           <img src={contactSearchResult.avatar} className="w-10 h-10 rounded-full"/>
                           <div>
                               <p className="font-bold text-white text-sm">{contactSearchResult.displayName}</p>
                               <p className="text-xs text-green-400">Usuario Real Detectado</p>
                           </div>
                       </div>
                   ) : (
                       <div className="mb-4">
                           <p className="text-xs text-gray-500">Si no encuentras al usuario, puedes añadirlo como contacto simulado (IA).</p>
                       </div>
                   )}
                   <div className="flex gap-2">
                       <button onClick={() => setShowAddContactModal(false)} className="flex-1 bg-gray-700 p-2 rounded text-white text-sm">Cancelar</button>
                       {contactSearchResult ? (
                           <button onClick={() => handleAddContact(true)} className="flex-1 bg-green-600 text-white p-2 rounded font-bold text-sm flex items-center justify-center gap-1">
                               <Wifi size={14}/> Añadir P2P
                           </button>
                       ) : (
                           <button onClick={() => handleAddContact(false)} className="flex-1 bg-primary text-black p-2 rounded font-bold text-sm">
                               Añadir IA
                           </button>
                       )}
                   </div>
               </div>
           </div>
       )}

       {/* --- DEV MODE PASSWORD MODAL --- */}
       {showPasswordModal && (
           <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
               <div className="bg-[#050505] border border-red-900/50 p-8 rounded-2xl w-full max-w-sm text-center shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                   <Lock size={40} className="mx-auto text-red-600 mb-4 animate-pulse" />
                   <h3 className="text-xl font-mono text-red-500 mb-2 tracking-widest">ACCESO RESTRINGIDO</h3>
                   <p className="text-xs text-gray-600 mb-6 font-mono">Introduce la clave maestra de desarrollador.</p>
                   <input 
                    type="password" 
                    value={devPassword}
                    onChange={e => setDevPassword(e.target.value)}
                    className="w-full bg-black border border-gray-800 text-center text-white font-mono p-3 rounded mb-4 focus:border-red-500 outline-none"
                    placeholder="KEY-XXX-XXX"
                   />
                   <button onClick={verifyPassword} className="w-full bg-red-900/20 text-red-500 font-mono py-2 rounded border border-red-900/50 hover:bg-red-900/40 transition-all">AUTENTICAR</button>
                   <button onClick={() => {setShowPasswordModal(false); setDevClicks(0);}} className="mt-4 text-xs text-gray-500 hover:text-white">Cancelar</button>
               </div>
           </div>
       )}

       {/* --- DEVELOPER PANEL (GOD MODE) --- */}
       {isDevModeUnlocked && (
           <div className="fixed inset-0 z-[90] bg-[#0a0a0a] flex flex-col">
               <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-black">
                   <h2 className="text-sm font-mono text-green-500 flex items-center gap-2"><Terminal size={14}/> LUCEL_DEV_CONSOLE_V24</h2>
                   <button onClick={() => setIsDevModeUnlocked(false)} className="text-red-500 hover:text-red-400 font-mono text-xs">[CLOSE_SESSION]</button>
               </div>
               <div className="flex flex-1 overflow-hidden">
                   <div className="w-64 border-r border-gray-800 bg-black/50 p-4">
                       <button onClick={() => setDevTab('code')} className={`w-full text-left py-2 px-3 rounded font-mono text-xs mb-1 ${devTab === 'code' ? 'bg-green-900/20 text-green-400' : 'text-gray-500'}`}>/src/source_code</button>
                       <button onClick={() => setDevTab('news')} className={`w-full text-left py-2 px-3 rounded font-mono text-xs mb-1 ${devTab === 'news' ? 'bg-blue-900/20 text-blue-400' : 'text-gray-500'}`}>/sys/news_feed</button>
                       <button onClick={() => setDevTab('custom')} className={`w-full text-left py-2 px-3 rounded font-mono text-xs mb-1 ${devTab === 'custom' ? 'bg-purple-900/20 text-purple-400' : 'text-gray-500'}`}>/usr/custom_override</button>
                   </div>
                   <div className="flex-1 p-6 bg-[#050505] overflow-y-auto font-mono text-xs">
                       {devTab === 'code' && (
                           <div className="space-y-4">
                               <h3 className="text-gray-400 mb-2 border-b border-gray-800 pb-2">VIEWING: App.tsx (Live)</h3>
                               <pre className="text-green-600 whitespace-pre-wrap leading-relaxed">{SOURCE_CODE_MOCK}</pre>
                               <div className="mt-8 border-t border-gray-800 pt-6">
                                   <button 
                                    onClick={handleCustomizeMiniLucel}
                                    className="w-full py-3 bg-primary/20 border border-primary text-primary hover:bg-primary/30 transition-all font-bold flex items-center justify-center gap-2"
                                   >
                                       <Cpu size={16}/> [SYSTEM_OVERRIDE]: REWRITE_CORE_IDENTITY (Mini-Lucel)
                                   </button>
                                   <p className="text-gray-500 mt-2 text-center">Caution: This modifies the base personality matrix of the system assistant.</p>
                               </div>
                           </div>
                       )}
                       {devTab === 'news' && (
                           <div className="space-y-6">
                               <div className="border-l-2 border-blue-500 pl-4">
                                   <span className="text-blue-500 font-bold block mb-1">2025-12-01: DEEPSEEK V3.2 INTEGRATION</span>
                                   <p className="text-gray-400">Kernel updated to support DeepSeek V3.2 architecture. Neural bridge established. Latency optimized by 40%.</p>
                               </div>
                           </div>
                       )}
                       {devTab === 'custom' && (
                           <div className="text-center py-20">
                               <Settings size={40} className="mx-auto text-purple-500 mb-4 animate-spin-slow"/>
                               <p className="text-purple-400">GLOBAL PARAMETER OVERRIDE</p>
                           </div>
                       )}
                   </div>
               </div>
           </div>
       )}

    </div>
  );
};

export default CommunityView;