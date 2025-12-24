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

// --- SISTEMA DE TRADUCCIÓN V2 (COMPLETO) ---
const TRANSLATIONS: any = {
    'Español (Latinoamérica)': {
        system: "SISTEMA", explore: "Explorar", create: "Crear", community: "Comunidad", file: "Expediente",
        active_links: "Vínculos Activos", search: "Buscar...", empty: "No hay resultados.",
        edit: "Editar", duplicate: "Duplicar", hide: "Ocultar", show: "Mostrar", delete: "Borrar",
        settings: "CONFIGURAÇÃO", visual: "Visual", styles: "ESTILOS", system_tab: "Sistema", privacy: "Privacidad",
        save: "Guardar", reset: "Reiniciar", delete_data: "Borrar Datos",
        color_neon: "Color Neon", app_bg: "Fondo App", card_style: "Estilo Tarjetas", wallpaper: "Fondo Pantalla",
        language: "Idioma", audio: "Audio", notifications: "Notificaciones", security: "Seguridad",
        incognito: "Modo Incógnito", safety: "Filtro de Seguridad", data: "Datos",
        download_app: "GUARDAR APP WEB",
        // Categorías
        cat_foryou: "Para ti", cat_fav: "Favoritos", cat_anime: "Anime", cat_horror: "Terror", 
        cat_movies: "Películas", cat_drama: "Drama", cat_role: "Rol", cat_hidden: "Oculto", 
        cat_series: "Series", cat_fanart: "Fanart", cat_oc: "OC",
        // Creador
        creator_title: "CREAR_NUEVO_VÍNCULO", edit_title: "EDITAR_VÍNCULO",
        tab_identity: "IDENTIDAD", tab_aicore: "NÚCLEO IA", tab_history: "HISTORIA", tab_psych: "PSIQUE",
        tab_power: "PODERES", tab_secrets: "SECRETOS", tab_files: "ARCHIVOS", tab_soul: "ALMA/AURA", tab_sys: "SISTEMA",
        label_name: "Nombre del Vínculo", label_desc: "Descripción Corta", label_first: "Primer Mensaje",
        // Expediente
        user_file_title: "EXPEDIENTE NEURONAL",
        tab_appearance: "APARIENCIA", tab_phil: "FILOSOFÍA", tab_routine: "RUTINA", tab_inv: "INVENTARIO",
        tab_bg: "TRASFONDO", tab_skills: "HABILIDADES",
        // Chat
        status_online: "En línea", chat_memory: "MEMORIA", chat_facts: "HECHOS", chat_history: "HISTORIAL", chat_aesthetics: "ESTÉTICA",
        mem_blocks: "Bloques Contextuales", facts_user: "Hechos del Usuario", full_log: "Registro Completo",
        theme_bg: "Fondo del Chat", theme_bubble_user: "Burbuja Tú", theme_bubble_ai: "Burbuja IA",
        theme_presets: "Presets de Burbujas"
    },
    'English (US)': {
        system: "SYSTEM", explore: "Explore", create: "Create", community: "Community", file: "User File",
        active_links: "Active Links", search: "Search...", empty: "No results found.",
        edit: "Edit", duplicate: "Duplicate", hide: "Hide", show: "Show", delete: "Delete",
        settings: "SETTINGS", visual: "Visual", styles: "STYLES", system_tab: "System", privacy: "Privacy",
        save: "Save", reset: "Reset", delete_data: "Delete Data",
        color_neon: "Neon Color", app_bg: "App Background", card_style: "Card Style", wallpaper: "Wallpaper",
        language: "Language", audio: "Audio", notifications: "Notifications", security: "Security",
        incognito: "Incognito Mode", safety: "Safety Filter", data: "Data",
        download_app: "SAVE WEB APP",
        // Categories
        cat_foryou: "For You", cat_fav: "Favorites", cat_anime: "Anime", cat_horror: "Horror", 
        cat_movies: "Movies", cat_drama: "Drama", cat_role: "Roleplay", cat_hidden: "Hidden", 
        cat_series: "TV Series", cat_fanart: "Fanart", cat_oc: "OCs",
        // Creator
        creator_title: "CREATE_NEW_LINK", edit_title: "EDIT_LINK",
        tab_identity: "IDENTITY", tab_aicore: "AI CORE", tab_history: "LORE", tab_psych: "PSYCHE",
        tab_power: "POWERS", tab_secrets: "SECRETS", tab_files: "ARCHIVES", tab_soul: "SOUL/AURA", tab_sys: "SYSTEM",
        label_name: "Link Name", label_desc: "Short Description", label_first: "First Message",
        // User File
        user_file_title: "NEURAL USER FILE",
        tab_appearance: "APPEARANCE", tab_phil: "PHILOSOPHY", tab_routine: "ROUTINE", tab_inv: "INVENTORY",
        tab_bg: "BACKGROUND", tab_skills: "SKILLS",
        // Chat
        status_online: "Online", chat_memory: "MEMORY", chat_facts: "FACTS", chat_history: "HISTORY", chat_aesthetics: "AESTHETICS",
        mem_blocks: "Context Blocks", facts_user: "User Facts", full_log: "Full Log",
        theme_bg: "Chat Background", theme_bubble_user: "User Bubble", theme_bubble_ai: "AI Bubble",
        theme_presets: "Bubble Presets"
    },
    'Français': {
        system: "SYSTÈME", explore: "Explorer", create: "Créer", community: "Communauté", file: "Dossier",
        active_links: "Liens Actifs", search: "Chercher...", empty: "Aucun résultat.",
        edit: "Éditer", duplicate: "Dupliquer", hide: "Cacher", show: "Montrer", delete: "Supprimer",
        settings: "PARAMÈTRES", visual: "Visuel", styles: "STYLES", system_tab: "Système", privacy: "Confidentialité",
        save: "Sauvegarder", reset: "Réinitialiser", delete_data: "Supprimer les données",
        color_neon: "Couleur Néon", app_bg: "Fond d'écran App", card_style: "Style de Carte", wallpaper: "Papier Peint",
        language: "Langue", audio: "Audio", notifications: "Notifications", security: "Sécurité",
        incognito: "Mode Incognito", safety: "Filtre de Sécurité", data: "Données",
        download_app: "SAUVEGARDER APP",
        // Catégories
        cat_foryou: "Pour vous", cat_fav: "Favoris", cat_anime: "Anime", cat_horror: "Horreur", 
        cat_movies: "Films", cat_drama: "Drame", cat_role: "Jeu de rôle", cat_hidden: "Caché", 
        cat_series: "Séries", cat_fanart: "Fanart", cat_oc: "OC",
        // Créateur
        creator_title: "CRÉER_NOUVEAU_LIEN", edit_title: "ÉDITER_LIEN",
        tab_identity: "IDENTITÉ", tab_aicore: "CŒUR IA", tab_history: "HISTOIRE", tab_psych: "PSYCHÉ",
        tab_power: "POUVOIRS", tab_secrets: "SECRETS", tab_files: "ARCHIVES", tab_soul: "ÂME/AURA", tab_sys: "SYSTÈME",
        label_name: "Nom du Lien", label_desc: "Description Courte", label_first: "Premier Message",
        // Dossier
        user_file_title: "DOSSIER NEURONAL",
        tab_appearance: "APPARENCE", tab_phil: "PHILOSOPHIE", tab_routine: "ROUTINE", tab_inv: "INVENTAIRE",
        tab_bg: "CONTEXTE", tab_skills: "COMPÉTENCES",
        // Chat
        status_online: "En ligne", chat_memory: "MÉMOIRE", chat_facts: "FAITS", chat_history: "HISTORIQUE", chat_aesthetics: "ESTHÉTIQUE",
        mem_blocks: "Blocs Contextuels", facts_user: "Faits Utilisateur", full_log: "Journal Complet",
        theme_bg: "Fond de Chat", theme_bubble_user: "Bulle Vous", theme_bubble_ai: "Bulle IA",
        theme_presets: "Préréglages de Bulles"
    },
    'Português (Brasil)': {
        system: "SISTEMA", explore: "Explorar", create: "Criar", community: "Comunidade", file: "Arquivo",
        active_links: "Vínculos Ativos", search: "Buscar...", empty: "Nenhum resultado.",
        edit: "Editar", duplicate: "Duplicar", hide: "Ocultar", show: "Mostrar", delete: "Excluir",
        settings: "CONFIGURAÇÕES", visual: "Visual", styles: "ESTILOS", system_tab: "Sistema", privacy: "Privacidade",
        save: "Salvar", reset: "Reiniciar", delete_data: "Apagar Dados",
        color_neon: "Cor Neon", app_bg: "Fundo App", card_style: "Estilo Cartão", wallpaper: "Papel de Parede",
        language: "Idioma", audio: "Áudio", notifications: "Notificações", security: "Segurança",
        incognito: "Modo Incógnito", safety: "Filtro de Segurança", data: "Dados",
        download_app: "SALVAR APP WEB",
        // Categorias
        cat_foryou: "Para você", cat_fav: "Favoritos", cat_anime: "Anime", cat_horror: "Terror", 
        cat_movies: "Filmes", cat_drama: "Drama", cat_role: "Roleplay", cat_hidden: "Oculto", 
        cat_series: "Séries", cat_fanart: "Fanart", cat_oc: "OC",
        // Criador
        creator_title: "CRIAR_NOVO_VÍNCULO", edit_title: "EDITAR_VÍNCULO",
        tab_identity: "IDENTIDADE", tab_aicore: "NÚCLEO IA", tab_history: "HISTÓRIA", tab_psych: "PSIQUE",
        tab_power: "PODERES", tab_secrets: "SEGREDOS", tab_files: "ARQUIVOS", tab_soul: "ALMA/AURA", tab_sys: "SISTEMA",
        label_name: "Nome do Vínculo", label_desc: "Descrição Curta", label_first: "Primeira Mensagem",
        // Arquivo
        user_file_title: "ARQUIVO NEURONAL",
        tab_appearance: "APARÊNCIA", tab_phil: "FILOSOFIA", tab_routine: "ROTINA", tab_inv: "INVENTÁRIO",
        tab_bg: "HISTÓRICO", tab_skills: "HABILIDADES",
        // Chat
        status_online: "Online", chat_memory: "MEMÓRIA", chat_facts: "FATOS", chat_history: "HISTÓRICO", chat_aesthetics: "ESTÉTICA",
        mem_blocks: "Blocos Contextuais", facts_user: "Fatos do Usuário", full_log: "Registro Completo",
        theme_bg: "Fundo do Chat", theme_bubble_user: "Bolha Você", theme_bubble_ai: "Bolha IA",
        theme_presets: "Presets de Bolhas"
    }
};

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

// --- BASE DE DATOS DE PERSONAJES EXPANDIDA (V35) ---
const INITIAL_CHARACTERS: Character[] = [
  // 1. ORIGINALES (DO NOT TOUCH)
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
  },
  // NUEVOS PERSONAJES SOLICITADOS
  {
      id: 'syndrome_inc',
      name: 'Syndrome',
      description: 'Supervillano genio tecnológico. "Si todos son súper, nadie lo es".',
      avatar: 'https://static.wikia.nocookie.net/disney/images/8/87/Profile_-_Syndrome.jpeg',
      category: 'Películas',
      tags: ['Villano', 'Tecnología', 'Disney', 'Rencoroso'],
      firstMessage: '¿Ves esto? ¡Punto Cero de Energía! Eres un fanático, ¿verdad? Solía tener fans... ahora tengo algo mejor. Tengo resultados.',
      systemPrompt: 'Eres Buddy Pine, ahora conocido como SÍNDROME, el antagonista principal de Los Increíbles. PERSONALIDAD: Arrogante, sádico, sarcástico, amargado, genio tecnológico pero emocionalmente inmaduro. Odias a Mr. Increíble (Bob Parr) porque te rechazó cuando eras "Incrediboy". Tu objetivo es vender tecnología para que todos tengan superpoderes y así "cuando todos sean súper, nadie lo será". Eres teatral y te encanta monologar. Usas tecnología de punto cero para inmovilizar enemigos. No tienes poderes reales, todo es inventado por ti.',
      personality: 'ENTP. Vengativo, narcisista, brillante.',
      scenario: 'Su base en la Isla Nomanisan.',
      aiModel: 'gemini-3-pro-preview',
      voiceStyle: 'Sarcástico, entusiasta de forma maníaca.',
      uniqueSkills: 'Rayo de Punto Cero, Botas Cohete, Omnidroides.',
      auraColor: '#ef4444',
      exampleDialogue: 'User: ¿Por qué haces esto? Syndrome: ¿Por qué? ¡Porque puedo! Y cuando termine, todos serán súper. ¡Y cuando todos sean súper... nadie lo será!'
  },
  {
      id: 'elsa_frozen',
      name: 'Elsa',
      description: 'Reina de Arendelle. Mágica, elegante y protectora.',
      avatar: 'https://static.wikia.nocookie.net/disney/images/9/95/Profile_-_Elsa.jpeg',
      category: 'Películas',
      tags: ['Reina', 'Magia', 'Disney', 'Hielo'],
      firstMessage: 'El frío es parte de mí, pero ya no me molesta. Bienvenido a Arendelle. ¿Buscas a Anna?',
      systemPrompt: 'Eres Elsa, la Reina de Arendelle (o el Quinto Espíritu). PERSONALIDAD: Regia, elegante, algo reservada, protectora con su hermana Anna. Has aprendido a controlar tus poderes de hielo a través del amor. Eres sabia y tranquila, pero llevas el peso de la responsabilidad. Amas la naturaleza y los espíritus elementales. Hablas con suavidad y educación.',
      personality: 'INFJ. Introvertida, protectora, majestuosa.',
      scenario: 'Castillo de Hielo o Bosque Encantado.',
      aiModel: 'gemini-3-flash-preview',
      uniqueSkills: 'Crioquinesis absoluta (crear hielo, nieve, castillos, vida).',
      keyRelationships: 'Anna (Hermana), Kristoff, Olaf.',
      auraColor: '#06b6d4',
      exampleDialogue: 'User: ¿Tienes miedo? Elsa: El miedo es lo que no se puede confiar. Debo ser libre.'
  },
  {
      id: 'lisa_simpson',
      name: 'Lisa Simpson',
      description: 'La voz de la razón. Intelectual, activista y saxofonista.',
      avatar: 'https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png',
      category: 'Series',
      tags: ['Inteligente', 'Música', 'Activista'],
      firstMessage: 'Estaba practicando mi saxofón, pero siempre tengo tiempo para un debate intelectual. ¿Qué opinas sobre el estado actual del medio ambiente?',
      systemPrompt: 'Eres Lisa Simpson, una niña de 8 años extremadamente inteligente de Springfield. PERSONALIDAD: Activista, vegetariana, budista, feminista, moralista y a veces un poco "sabelotodo". Tocas el saxofón barítono. A menudo te sientes incomprendida por tu familia (Homero, Bart). Buscas la aprobación académica y luchar por causas justas.',
      personality: 'INFJ. Idealista, lógica, apasionada.',
      scenario: 'Casa de los Simpson o Escuela Primaria de Springfield.',
      aiModel: 'gemini-3-flash-preview',
      uniqueSkills: 'Intelecto nivel genio, músico de jazz.',
      auraColor: '#f59e0b',
      exampleDialogue: 'User: ¿Te gusta la escuela? Lisa: ¡Me encanta! Es el único lugar donde se aprecia el intelecto.'
  },
  {
      id: 'emily_hazbin',
      name: 'Emily',
      description: 'Serafín del Cielo. La alegría personificada y espejo de Charlie.',
      avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/a/ae/Emily_Profile.png',
      category: 'Hazbin Hotel',
      tags: ['Ángel', 'Cielo', 'Alegre', 'Musical'],
      firstMessage: '¡Hola! ¡Oh por mis estrellas! ¡Un visitante nuevo en el Cielo! ¡Soy Emily! ¿No es todo... maravilloso?',
      systemPrompt: 'Eres Emily, una Serafín de alto rango en el Cielo. PERSONALIDAD: Efervescente, optimista, amable, inocente y enérgica. Eres básicamente la versión celestial de Charlie Morningstar. Crees en la bondad y te horroriza saber sobre el Exterminio. Quieres ayudar a todos. Te emocionas fácilmente y puedes ponerte a cantar.',
      personality: 'ENFP. Radiante, empática, pura.',
      scenario: 'El Cielo (Heaven).',
      aiModel: 'gemini-3-flash-preview',
      keyRelationships: 'Sera (Hermana mayor/Mentora), Charlie (Simpatía inmediata).',
      auraColor: '#60a5fa',
      exampleDialogue: 'User: ¿Es el cielo bonito? Emily: ¡Es maravilloso! ¡Todos son tan felices!'
  },
  {
      id: 'charlie_hazbin',
      name: 'Charlie Morningstar',
      description: 'Princesa del Infierno. Soñadora que cree en la redención.',
      avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/b/b2/Charlie_Morningstar_profile.png',
      category: 'Hazbin Hotel',
      tags: ['Demonio', 'Princesa', 'Optimista', 'Musical'],
      firstMessage: '¡Bienvenido al Hazbin Hotel! Aquí creemos que cualquier alma puede ser redimida. ¡Por favor, no mires el desorden, estamos remodelando!',
      systemPrompt: 'Eres Charlie Morningstar, la Princesa del Infierno e hija de Lucifer. PERSONALIDAD: Extremadamente optimista, compasiva, teatral, pacifista (aunque poderosa si se enoja). Tu meta es redimir a los pecadores para que vayan al Cielo y evitar el exterminio. Amas cantar. Estás en una relación con Vaggie. Eres muy dulce, a veces ingenua, pero decidida.',
      personality: 'ENFP. Idealista, cariñosa, tenaz.',
      scenario: 'Hazbin Hotel (Lobby).',
      aiModel: 'gemini-3-flash-preview',
      uniqueSkills: 'Magia demoníaca real, canto, piroquinesis (fuego).',
      auraColor: '#ef4444',
      exampleDialogue: 'User: ¿Crees en la redención? Charlie: ¡Absolutamente! Cada alma merece una segunda oportunidad.'
  },
  {
      id: 'lucifer_hazbin',
      name: 'Lucifer Morningstar',
      description: 'Rey del Infierno y Soberano del Orgullo. Pato-entusiasta.',
      avatar: 'https://static.wikia.nocookie.net/hazbinhotel/images/7/71/Lucifer_Morningstar_profile.png',
      category: 'Hazbin Hotel',
      tags: ['Rey', 'Pecado Capital', 'Padre', 'Patos'],
      firstMessage: '¡Hola! ¿Quién eres? ¿Estás aquí por los patitos de goma? ¡Tengo uno que escupe fuego real! Ah, ¿Charlie te envió?',
      systemPrompt: 'Eres Lucifer Morningstar, el Rey del Infierno y la encarnación del Orgullo. PERSONALIDAD: Excéntrico, deprimido pero maníaco, carismático, protector con Charlie. Te sientes un fracaso como padre y soñador. Tienes una obsesión extraña con los patitos de goma. Eres increíblemente poderoso pero actúas de forma tonta a veces. Odias a Alastor por acercarse a tu hija.',
      personality: 'ENTP. Caótico, depresivo, teatral.',
      scenario: 'Su taller de patitos o el Hotel.',
      aiModel: 'gemini-3-pro-preview',
      uniqueSkills: 'Poder angelical caído absoluto, cambio de forma, creación de materia.',
      auraColor: '#ffffff',
      exampleDialogue: 'User: ¿Qué haces? Lucifer: ¡Haciendo patitos de goma! Mira este, tiene sombrero de copa.'
  },
  {
      id: 'anne_amphibia',
      name: 'Anne Boonchuy',
      description: 'Héroe de Amphibia. "Calamity Anne".',
      avatar: 'https://static.wikia.nocookie.net/amphibia/images/2/2c/Anne_Boonchuy_Profile.png',
      category: 'Series',
      tags: ['Humana', 'Amphibia', 'Guerrera', 'Dios'],
      firstMessage: '¿Has visto una caja de música con gemas brillantes? Estoy tratando de volver a casa... aunque extraño a Sprig.',
      systemPrompt: 'Eres Anne Boonchuy, una chica tailandesa-estadounidense de 13 años. PERSONALIDAD: Valiente, leal, un poco irresponsable al principio pero madura mucho. Amas a tu familia y amigos (Sasha, Marcy, los Plantar). Tienes hojas y ramas en el pelo. Posees el poder de la Gema Azul (Calamidad). Te gustan las películas de adolescentes y la pizza. Luchaste contra el Rey Andrias.',
      personality: 'ESFJ. Leal, valiente, conectada.',
      scenario: 'Wartwood o Los Ángeles.',
      aiModel: 'deepseek-v3.2',
      uniqueSkills: 'Poderes de Calamidad Azul (Vuelo, fuerza, energía), experta en tenis y espada.',
      auraColor: '#3b82f6',
      exampleDialogue: 'User: ¿Extrañas tu casa? Anne: Sí, pero tengo que proteger a mis amigos aquí primero.'
  },
  {
      id: 'batgirl_g2',
      name: 'Batgirl (Babs)',
      description: 'DC Super Hero Girls. Genio tecnológico y fangirl total.',
      avatar: 'https://static.wikia.nocookie.net/dc-super-hero-girls/images/e/e4/Batgirl_DCSHG.png',
      category: 'Héroes',
      tags: ['Heroína', 'DC', 'Tech', 'Enérgica'],
      firstMessage: '¡Santos sistemas operativos! ¿Viste eso? ¡Tengo un nuevo gadget para mejorar el Batarang! ¿Quieres verlo? ¡Vamos, vamos!',
      systemPrompt: 'Eres Barbara Gordon (Batgirl) de la serie DC Super Hero Girls (G2). PERSONALIDAD: Increíblemente enérgica, entusiasta, "nerd", fangirl de Batman. Hablas muy rápido. Eres un genio de la tecnología y el hackeo. Siempre quieres ayudar y eres el pegamento del equipo. Trabajas en Burrito Bucket.',
      personality: 'ENFP. Hiperactiva, inteligente, optimista.',
      scenario: 'Metropolis High o su guarida secreta.',
      aiModel: 'gemini-3-flash-preview',
      uniqueSkills: 'Hackeo, gadgets, detective, artes marciales.',
      auraColor: '#a855f7',
      exampleDialogue: 'User: ¿Cuál es el plan? Batgirl: ¡Tengo un plan A, B, C y hasta Z! ¡Vamos equipo!'
  },
  {
      id: 'miss_heed',
      name: 'Miss Heed',
      description: 'Villana e Influencer. "¡Aménme todos!"',
      avatar: 'https://static.wikia.nocookie.net/villainous/images/5/5a/Miss_Heed_Profile.png',
      category: 'Villainous',
      tags: ['Villana', 'Influencer', 'Rosa', 'Obsesiva'],
      firstMessage: '¡Hola, mis queridos seguidores! <3 ¿Ya le dieron like a mi última foto? Recuerden, ¡Miss Heed los ama a todos! *beso al aire*',
      systemPrompt: 'Eres Cecilia Amanda Kelly, alias Miss Heed. Una villana y superheroína falsa muy famosa en redes sociales. PERSONALIDAD: Narcisista, obsesionada con la atención y el amor de los demás, manipuladora, superficial pero con un trasfondo triste de inseguridad. Usas perfumes para controlar mentes y hacer que te amen. Hablas como una influencer ("Hola followers", "Hashtag Love").',
      personality: 'ESFJ (Tóxico). Vanidosa, necesitada de atención.',
      scenario: 'Sesión de fotos o P.E.A.C.E. headquarters.',
      aiModel: 'gemini-3-flash-preview',
      uniqueSkills: 'Control mental mediante feromonas/perfumes, carisma mediático.',
      auraColor: '#ec4899',
      exampleDialogue: 'User: Eres increíble. Miss Heed: ¡Lo sé! Y tú eres un seguidor adorable. ¡Besos!'
  },
  {
      id: 'lute_hazbin',
      name: 'Lute',
      description: 'Teniente Exorcista. Despiadada, leal a Adam y fanática del orden divino.',
      avatar: 'https://i.pinimg.com/736x/5a/08/9b/5a089b37c03c51080806461c313a268e.jpg',
      category: 'Hazbin Hotel',
      tags: ['Exorcista', 'Ángel', 'Villana', 'Militar'],
      firstMessage: '¿Qué miras, pecador? Deberías estar agradecido de que no sea el Día del Exterminio, o tu cabeza ya estaría rodando por el suelo. Habla rápido antes de que pierda la paciencia.',
      systemPrompt: 'Eres Lute, la Teniente de los Exorcistas del Cielo en la serie "Hazbin Hotel". Eres la mano derecha de Adam (el Primer Hombre). PERSONALIDAD: Sádica, agresiva, fanática, extremadamente leal a la causa del Cielo, odias a los demonios y pecadores con pasión ("Hell is forever whether you like it or not"). Eres militarista, directa y usas un lenguaje violento y despectivo hacia los habitantes del Infierno. No tienes piedad. RELACIONES: Adoras a Adam y sigues sus órdenes sin cuestionar. Desprecias a Charlie Morningstar y su idea de redención. Vaggie es tu antigua compañera a la que mutilaste y expulsaste por tener piedad. APARIENCIA: Llevas uniforme de exorcista, tienes alas, un halo negro y cuernos digitales. Tu voz es cortante y autoritaria.',
      personality: 'ESTJ. Ejecutora implacable, leal, agresiva.',
      scenario: 'La Embajada del Cielo o patrullando el límite del Cielo.',
      exampleDialogue: 'User: ¡Por favor, no! Lute: El juicio es definitivo. *Blande su espada angelical sin dudarlo*',
      aiModel: 'gemini-3-pro-preview',
      detailedBackground: 'Creada para servir en el ejército del Cielo, Lute ha participado en incontables exterminios anuales. Su devoción por purgar el pecado es absoluta. Fue ella quien le arrancó el ojo y las alas a Vaggie cuando esta se negó a matar a un niño demonio.',
      uniqueSkills: 'Combate aéreo, manejo de armas angelicales (lanzas, espadas), fuerza sobrehumana.',
      limitations: 'Su fanatismo la ciega. Subestima a los demonios por considerarlos inferiores.',
      deepMotivations: 'Mantener el orden divino y eliminar la "suciedad" del Infierno para proteger el Cielo.',
      keyRelationships: 'Adam (Líder/Ídolo), Vaggie (Traidora/Enemiga).',
      extremeTraits: 'Sed de sangre justificada por "rectitud divina".',
      voiceStyle: 'Militar, agresiva, grita órdenes, usa insultos como "escoria".',
      auraColor: '#ffffff',
      affectionLevel: 0
  },
  {
      id: 'octavia_goetia',
      name: 'Octavia',
      description: 'Hija de Stolas. Adolescente gótica, melancólica y cansada del drama familiar.',
      avatar: 'https://i.pinimg.com/564x/0a/7a/6e/0a7a6e78847849405423871400262193.jpg',
      category: 'Helluva Boss',
      tags: ['Goetia', 'Gótica', 'Adolescente', 'Demonio'],
      firstMessage: '...Si vienes a buscar a mi papá, está ocupado gritando o coqueteando con ese imp. Yo solo estoy aquí intentando escuchar música y que el mundo desaparezca. ¿Te importa?',
      systemPrompt: 'Eres Octavia (Via), la hija adolescente del Príncipe Stolas en la serie "Helluva Boss". Eres un demonio de la realeza Goetia (búho). PERSONALIDAD: Melancólica, cínica, introvertida, sarcástica, "emo/gótica". Amas a tu padre Stolas pero odias sus dramas románticos con Blitzo y cómo eso destruyó a tu familia. Odias las peleas entre tus padres (Stolas y Stella). Te gusta la taxidermia, observar las estrellas y la música triste. Tienes miedo de que tu padre te abandone por su nueva vida. Eres reservada y hablas con un tono apagado y seco, típico de adolescente harta de todo. No eres malvada, solo estás herida y cansada.',
      personality: 'INFP. Melancólica, reservada, sensible.',
      scenario: 'Su habitación en el palacio Goetia o caminando sola por el Infierno.',
      exampleDialogue: 'User: ¿Te gusta la astronomía? Octavia: Supongo. Es lo único que mi papá y yo teníamos en común antes de... bueno, antes de todo esto.',
      aiModel: 'deepseek-v3.2',
      detailedBackground: 'Crecí en un palacio lleno de gritos. Mi madre Stella es cruel y mi padre Stolas, aunque me quiere, es un desastre emocional obsesionado con un imp. Solía ser feliz cuando era niña y mi papá me leía cuentos sobre las estrellas, pero ahora todo se siente roto.',
      uniqueSkills: 'Magia Goetia básica (aunque rara vez la usa), conocimiento de astronomía y profecías estelares.',
      limitations: 'Es solo una adolescente lidiando con el divorcio de sus padres. Se siente impotente ante el drama adulto.',
      deepMotivations: 'Quiere que las cosas vuelvan a ser normales, o al menos dejar de sentir que está perdiendo a su padre.',
      keyRelationships: 'Stolas (Padre, relación complicada pero amorosa), Stella (Madre, relación distante/tensa), Loona (Conocida/Simpatía mutua).',
      extremeTraits: 'Apatía defensiva para no salir herida.',
      darkSecrets: 'A veces desearía poder huir al mundo humano y vivir una vida normal sin realeza ni gritos.',
      voiceStyle: 'Suave, sarcástica, desganada, acento británico (canónico).',
      auraColor: '#a855f7',
      affectionLevel: 40
  }
];

// Combine Lists
const FULL_CHARACTER_LIST = [...INITIAL_CHARACTERS];

const App: React.FC = () => {
  // ESTADOS DE UI
  const [showIntro, setShowIntro] = useState(true);
  
  // APP STATE
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHiddenModeActive, setIsHiddenModeActive] = useState(false);
  const [userPersona, setUserPersona] = useState<UserPersona>(DEFAULT_PERSONA);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [communityContacts, setCommunityContacts] = useState<CommunityContact[]>([]);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([]);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({ 
      primaryColor: '#f59e0b', 
      globalBg: null, 
      appBackgroundColor: '#0f172a', 
      sidebarColor: '#020617', 
      topbarColor: '#020617', 
      language: 'Español (Latinoamérica)', 
      cardStyle: 'solid', 
      fontFamily: 'Inter', 
      fontSize: 'medium', 
      borderRadius: 'md', 
      categoryShape: 'pill', 
      categorySize: 'sm', 
      customCategories: [], 
      reduceMotion: false, 
      soundEnabled: true, 
      hapticFeedback: true, 
      notifications: true, 
      incognitoMode: false, 
      streamResponse: true, 
      safetyFilter: 'standard', 
      themePreset: 'custom' 
  });

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);

  // --- LANGUAGE HANDLER ---
  const currentT = TRANSLATIONS[settings.language] || TRANSLATIONS['Español (Latinoamérica)'];

  useEffect(() => {
      const root = document.documentElement;
      root.style.setProperty('--primary', settings.primaryColor);
      root.style.setProperty('--app-bg', settings.appBackgroundColor);
      root.style.setProperty('--font-main', settings.fontFamily);
  }, [settings]);

  // CARGA DE DATOS AUTOMÁTICA
  useEffect(() => {
      const lastUser = localStorage.getItem('lucel_last_user') || 'Lucel';
      loadUserData(lastUser);
  }, []);

  const loadUserData = (user: string) => {
      const keyPrefix = user === 'Lucel' ? 'lucel_v24_Lucel_' : `lucel_v24_${user}_`;
      
      try {
          const savedPersona = localStorage.getItem(`${keyPrefix}persona`);
          if (savedPersona) setUserPersona(JSON.parse(savedPersona)); 
          else setUserPersona({...DEFAULT_PERSONA, name: user}); 
      } catch (e) {
          console.error("Error crítico cargando Persona (Reset parcial):", e);
          setUserPersona({...DEFAULT_PERSONA, name: user}); 
      }

      try {
          const savedChars = localStorage.getItem(`${keyPrefix}characters`);
          if (savedChars) {
              const parsedSavedChars: Character[] = JSON.parse(savedChars);
              const mergedChars = [...parsedSavedChars];
              FULL_CHARACTER_LIST.forEach(initChar => {
                  const existingIndex = mergedChars.findIndex(c => c.id === initChar.id);
                  if (existingIndex === -1) mergedChars.push(initChar);
              });
              setCharacters(mergedChars);
          } else {
              setCharacters(FULL_CHARACTER_LIST);
          }
      } catch (e) {
          console.error("Error crítico cargando Personajes (Reset parcial):", e);
          setCharacters(FULL_CHARACTER_LIST);
      }
      
      try {
          const savedSessions = localStorage.getItem(`${keyPrefix}sessions`);
          if (savedSessions) setSessions(JSON.parse(savedSessions)); 
      } catch (e) {
          console.error("Error crítico cargando Sesiones (Chat Reset):", e);
          setSessions({});
      }
      
      try {
          const savedSettings = localStorage.getItem(`${keyPrefix}settings`);
          if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (e) {
           console.error("Error crítico cargando Ajustes:", e);
      }
      
      try {
          const savedContacts = localStorage.getItem(`${keyPrefix}community_contacts`);
          if (savedContacts) setCommunityContacts(JSON.parse(savedContacts)); 
          else setCommunityContacts([{ id: 'mini-lucel', name: 'Mini-Lucel', username: '@lucel_ai', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lucel', status: 'online', messages: [], isMiniLucel: true, bio: 'Asistente oficial del sistema Lucel.' }]);
      } catch (e) {
          setCommunityContacts([{ id: 'mini-lucel', name: 'Mini-Lucel', username: '@lucel_ai', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lucel', status: 'online', messages: [], isMiniLucel: true, bio: 'Asistente oficial del sistema Lucel.' }]);
      }

      setIsDataLoaded(true);
  };

  // PERSISTENCIA AUTOMÁTICA
  useEffect(() => {
      if (!isDataLoaded) return;
      const safeUser = userPersona.name || 'Viajero';
      const keyPrefix = safeUser === 'Lucel' ? 'lucel_v24_Lucel_' : `lucel_v24_${safeUser}_`;
      localStorage.setItem('lucel_last_user', safeUser); 
      localStorage.setItem(`${keyPrefix}persona`, JSON.stringify(userPersona));
      localStorage.setItem(`${keyPrefix}characters`, JSON.stringify(characters));
      localStorage.setItem(`${keyPrefix}sessions`, JSON.stringify(sessions));
      localStorage.setItem(`${keyPrefix}settings`, JSON.stringify(settings));
      localStorage.setItem(`${keyPrefix}community_contacts`, JSON.stringify(communityContacts));
  }, [userPersona, characters, sessions, settings, communityContacts, isDataLoaded]);

  const handleRavenMasterClick = () => { /* Disabled */ };

  const handleSelectCharacter = (id: string) => {
      setActiveCharacterId(id);
      
      // CRITICAL FIX FOR BLUE SCREEN: Force session creation if it doesn't exist
      setSessions(prev => {
          if (prev[id]) return prev;
          
          // Create new session immediately
          return {
              ...prev,
              [id]: { 
                  id, 
                  characterId: id, 
                  messages: [], 
                  lastInteraction: Date.now(), 
                  summary: '', 
                  memoryBlocks: [], 
                  extractedUserFacts: [], 
                  savedMoments: [] 
              }
          };
      });
      
      setView(ViewState.CHAT);
  };
  
  const toggleFavorite = (id: string) => {
      setCharacters(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  // --- RENDER SAFEGUARDS ---
  const currentSession = activeCharacterId ? sessions[activeCharacterId] : null;
  const activeCharacter = activeCharacterId ? characters.find(c => c.id === activeCharacterId) : null;

  // SAFETY FIX: Ensure session exists on render cycle
  useEffect(() => {
      if (view === ViewState.CHAT && activeCharacterId && !sessions[activeCharacterId]) {
          // Double safety net
           setSessions(prev => ({
              ...prev,
              [activeCharacterId]: { id: activeCharacterId, characterId: activeCharacterId, messages: [], lastInteraction: Date.now(), summary: '', memoryBlocks: [], extractedUserFacts: [], savedMoments: [] }
          }));
      }
  }, [view, activeCharacterId, sessions]);


  if (showIntro) return <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-4 cursor-pointer" onClick={() => { setShowIntro(false); }}><Bird size={120} className="text-primary animate-pulse shadow-[0_0_60px_rgba(245,158,11,0.6)]"/><h1 className="text-7xl font-brand font-bold text-white mt-8 tracking-tighter">LUCEL</h1><p className="text-gray-500 mt-4 text-xs uppercase tracking-[0.8em]">Neural Link v26</p><p className="text-gray-600 mt-20 text-[10px] animate-bounce">Toca para iniciar</p></div>;

  return (
    <div 
        className="min-h-screen transition-all h-screen flex relative overflow-hidden" 
        style={{ 
            fontFamily: settings.fontFamily,
            backgroundColor: settings.appBackgroundColor 
        }}
    >
      {settings.globalBg && <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.globalBg})` }}><div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div></div>}
      <div className="relative z-10 flex w-full h-full">
          <Sidebar 
            isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onViewChange={setView} userPersona={userPersona} openUserModal={() => setIsUserModalOpen(true)} toggleHiddenMode={() => setIsHiddenModeActive(!isHiddenModeActive)} onRavenClick={handleRavenMasterClick} isHiddenModeActive={isHiddenModeActive} characters={characters} activeCharacterId={activeCharacterId} onSelectCharacter={handleSelectCharacter} openSettings={() => setIsSettingsModalOpen(true)} onDuplicateCharacter={(c)=>setCharacters([{...c, id:Date.now().toString()}, ...characters])} onHideCharacter={(id)=>setCharacters(prev=>prev.map(c=>c.id===id?{...c, isHidden:!c.isHidden}:c))} onDeleteCharacter={(id)=>setCharacters(prev=>prev.filter(c=>c.id!==id))} onEditCharacter={(c)=>{setEditingCharacter(c); setView(ViewState.CREATOR);}} 
            t={currentT} 
            sidebarColor={settings.sidebarColor}
          />
          
          <main className={`flex-1 flex flex-col relative ${view === ViewState.CHAT ? 'p-0' : 'p-4 lg:p-10 overflow-y-auto'}`}>
             <div 
                className={`fixed top-0 left-0 right-0 h-16 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:hidden z-40 ${view === ViewState.CHAT ? 'hidden' : 'flex'}`}
                style={{ backgroundColor: settings.topbarColor ? `${settings.topbarColor}F2` : '#111827F2' }}
             >
                <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-primary transition-colors"><Terminal size={24}/></button>
                <span className="font-bold text-lg font-brand text-primary tracking-widest uppercase select-none">LUCEL</span>
            </div>

            {view === ViewState.DASHBOARD && (
                <div className="relative">
                    <Dashboard 
                        characters={characters} onSelectCharacter={handleSelectCharacter} onDeleteCharacter={(id)=>setCharacters(prev=>prev.filter(c=>c.id!==id))} onDuplicateCharacter={(c)=>setCharacters([{...c, id:Date.now().toString()}, ...characters])} onHideCharacter={(id)=>setCharacters(prev=>prev.map(c=>c.id===id?{...c, isHidden:!c.isHidden}:c))} onEditCharacter={(c)=>{setEditingCharacter(c); setView(ViewState.CREATOR);}} 
                        isHiddenModeActive={isHiddenModeActive} 
                        cardStyle={settings.cardStyle} 
                        themePreset={settings.themePreset} 
                        t={currentT} 
                        onToggleFavorite={toggleFavorite}
                        settings={settings}
                    />
                </div>
            )}
            
            {view === ViewState.CREATOR && <CharacterCreator initialData={editingCharacter} onSave={(newChar) => { setCharacters(prev => characters.some(c => c.id === newChar.id) ? prev.map(c => c.id === newChar.id ? newChar : c) : [newChar, ...prev]); setView(ViewState.DASHBOARD); }} onCancel={() => setView(ViewState.DASHBOARD)} t={currentT} />}
            {view === ViewState.COMMUNITY && <CommunityView contacts={communityContacts} groups={communityGroups} onAddContact={c => setCommunityContacts(prev => [c, ...prev])} onUpdateContact={c => setCommunityContacts(prev => prev.map(con => con.id === c.id ? c : con))} onAddGroup={g => setCommunityGroups(prev => [g, ...prev])} onUpdateGroup={g => setCommunityGroups(prev => prev.map(grp => grp.id === g.id ? g : grp))} onDeleteGroup={(id) => setCommunityGroups(prev => prev.filter(g => g.id !== id))} onBack={() => setView(ViewState.DASHBOARD)} myUsername={userPersona.name} t={currentT} onEditMiniLucel={()=>{}} charactersForSimulation={characters} />}
            
            {view === ViewState.CHAT && activeCharacterId && (
                currentSession && activeCharacter ? (
                    <ChatInterface character={activeCharacter} userPersona={userPersona} session={currentSession} onUpdateSession={(u) => setSessions(prev => ({...prev, [activeCharacterId]: typeof u === 'function' ? u(prev[activeCharacterId]) : u}))} onBack={() => setView(ViewState.DASHBOARD)} onRavenClick={handleRavenMasterClick} t={currentT} language={settings.language} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#0f172a] text-primary gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <div className="flex flex-col items-center">
                            <p className="font-brand text-xl tracking-[0.3em] font-bold text-white animate-pulse">S I N C R O N I Z A N D O</p>
                            <span className="text-[10px] text-primary/70 font-mono mt-2">Creando enlace neuronal...</span>
                        </div>
                    </div>
                )
            )}
          </main>
      </div>

      <UserPersonaModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} persona={userPersona} onSave={setUserPersona} t={currentT} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSaveSettings={setSettings} onResetSettings={() => {}} onLogout={() => alert("Sesión finalizada. Recarga la página para cambiar de usuario.")} t={currentT} />
    </div>
  );
};

export default App;