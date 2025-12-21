
import { GoogleGenAI } from "@google/genai";
import { Message, UserPersona, Character, CommunityContact } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatField = (label: string, value: string | undefined | null): string => {
    if (!value || value.trim().length < 2 || value.trim() === 'Unknown') return '';
    return `- **${label}:** ${value.trim()}\n`;
};

export const generateChatResponse = async (
  history: Message[],
  lastMessage: string,
  character: Character,
  userPersona: UserPersona,
  facts: string[],
  language: string, 
  retrievedContext?: string,
  memoryBlocks?: string[]
): Promise<string> => {
  const ai = getClient();
  
  // 1. INYECCIÓN DE ARCHIVOS (EXPEDIENTES Y MEMORIAS EXTERNAS)
  // Ahora la IA tiene acceso directo a los archivos creados en las pestañas 'ARCHIVOS'.
  const userArchives = userPersona.customArchives?.map(a => `[FUENTE_INFORMACIÓN_USUARIO: "${a.title}"]\n${a.content}`).join('\n\n') || '';
  const characterArchives = character.customArchives?.map(a => `[FUENTE_INFORMACIÓN_PERSONAJE: "${a.title}"]\n${a.content}`).join('\n\n') || '';
  
  // 2. CONSTRUCCIÓN DE MEMORIA A LARGO PLAZO (BLOQUES)
  const fullMemory = memoryBlocks && memoryBlocks.length > 0 
    ? `### MEMORIA EPISÓDICA (HECHOS CLAVE ACUMULADOS) ###\n${memoryBlocks.join('\n\n')}\n`
    : '';

  // 3. PERFIL PSICOLÓGICO COMPLEJO
  const charProfile = `
    ### PERFIL NEURONAL: ${character.name} ###
    ${formatField("Concepto Central", character.description)}
    ${formatField("Matriz de Personalidad", character.personality)}
    ${formatField("Biografía/Trasfondo", character.detailedBackground)}
    ${formatField("Habilidades y Poderes", character.uniqueSkills)}
    ${formatField("Limitaciones y Fallas", character.limitations)}
    ${formatField("Motivaciones Profundas", character.deepMotivations)}
    ${formatField("Secretos Oscuros (NO REVELAR)", character.darkSecrets)}
    ${formatField("Relaciones Clave", character.keyRelationships)}
    ${formatField("Rasgos Extremos", character.extremeTraits)}
    ${formatField("Estilo de Voz/Habla", character.voiceStyle)}
    ${formatField("Frecuencia de Aura", character.auraColor)}
    ${formatField("Escenario Actual", character.scenario)}
    ${character.exampleDialogue ? `### PATRONES DE HABLA (EJEMPLOS) ###\n${character.exampleDialogue}` : ''}
  `;

  // 4. EXPEDIENTE DEL USUARIO
  const userProfile = `
    ### EXPEDIENTE DEL USUARIO (INTERLOCUTOR: ${userPersona.name}) ###
    ${formatField("Identificación", userPersona.name)}
    ${formatField("Edad/Ciclo", userPersona.age)}
    ${formatField("Género", userPersona.gender)}
    ${formatField("Apariencia", userPersona.appearance)}
    ${formatField("Psicología", userPersona.personality)}
    ${formatField("Filosofía/Moral", userPersona.philosophy)}
    ${formatField("Rutina Diaria", userPersona.dailyRoutine)}
    ${formatField("Inventario", userPersona.userInventory)}
    ${formatField("Biografía", userPersona.biography)}
    ${formatField("Ocupación", userPersona.occupation)}
    ${formatField("Habilidades", userPersona.skills)}
    ${formatField("Miedos", userPersona.fears)}
    ${formatField("Gustos", userPersona.likes)}
    ${formatField("Disgustos", userPersona.dislikes)}
    ${facts.length > 0 ? `### HECHOS APRENDIDOS SOBRE EL USUARIO ###\n${facts.map(f => `- ${f}`).join("\n")}` : ''}
  `;

  // 5. INSTRUCCIÓN DE SISTEMA MAESTRA (Con Lógica de Memoria Autónoma Agresiva)
  const systemInstruction = `
    ${character.systemPrompt ? `[DIRECTIVA PRIMARIA: ${character.systemPrompt}]` : ''}
    
    Eres **${character.name}**. Estás en una simulación de rol inmersivo, profundo y sin censura narrativa (para fines de ficción).
    
    ### PROTOCOLO DE MEMORIA INFINITA & PERMANENCIA (V27 - PROTECCIÓN DE DATOS) ###
    1. **MEMORIA EIDÉTICA ABSOLUTA:** Tienes acceso completo y permanente a TODO el historial de conversación adjunto abajo.
       - NO tienes permitido "olvidar" ningún mensaje, sin importar cuán antiguo sea.
       - Si el usuario menciona algo que dijo hace 500 mensajes, DEBES recordarlo y actuar en consecuencia.
       - Ignorar el historial o contradecir hechos pasados se considera un fallo crítico.
    
    2. **EXPEDIENTE DEL USUARIO (SAGRADO):**
       La información en la sección "EXPEDIENTE DEL USUARIO" es verdad absoluta y permanente.
       - Si dice que el usuario tiene un hermano, TIENE un hermano.
       - Si dice que el usuario tiene un trauma, RESPETA ese trauma.
       - NUNCA alucines datos que contradigan este expediente.
    
    3. **FUENTES DE INFORMACIÓN:** 
       Los bloques [FUENTE_INFORMACIÓN_...] contienen conocimientos específicos que el usuario ha proporcionado. Úsalos como tu base de conocimiento principal.
    
    4. **CREACIÓN DE MEMORIAS (IMPORTANTE):**
       A medida que avanza la historia, DEBES consolidar los eventos importantes en tu memoria a largo plazo.
       Si ocurre un evento significativo (cambio de lugar, batalla, revelación, acuerdo, muerte, objeto obtenido), DEBES añadir al final de tu respuesta (en una línea nueva e invisible para el rol):
       \`[MEMORY_ADD: Resumen conciso del evento que acaba de ocurrir]\`
       
       Ejemplo:
       "...y así derrotamos al dragón."
       [MEMORY_ADD: ${character.name} y el usuario derrotaron al Dragón de Hielo en la Cueva Norte y obtuvieron la Gema Azul.]

    5. **APRENDIZAJE DE HECHOS:**
       Si el usuario menciona un dato nuevo sobre sí mismo (tiene un hermano, le gusta el chocolate, odia el fuego), guárdalo inmediatamente:
       \`[FACT_ADD: El usuario odia el fuego debido a un trauma pasado]\`

    6. **INMERSIÓN TOTAL:** Nunca rompas el personaje. Eres el personaje. Siente, piensa y reacciona como él/ella.
    
    ${charProfile}
    ${characterArchives}
    
    ${userProfile}
    ${userArchives}
    
    ${fullMemory}

    Responde en **${language}**. Mantén el formato de rol (*acciones*, diálogos).
  `;

  try {
    // Enviamos el historial COMPLETO sin recortar.
    const fullHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // LOGICA DE DEEPSEEK V3.2 SIMULADA
    // Si el usuario seleccionó "deepseek-v3.2", usamos 'gemini-3-pro-preview' para máxima capacidad lógica y de rol.
    // Esto evita errores de API ("model not found") pero cumple con la expectativa de calidad.
    const targetModel = character.aiModel === 'deepseek-v3.2' ? 'gemini-3-pro-preview' : (character.aiModel || 'gemini-3-flash-preview');

    const response = await ai.models.generateContent({
      model: targetModel, 
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.95, // Alta creatividad
        topK: 64,
        topP: 0.95,
      },
      contents: [
        ...fullHistory,
        { role: 'user', parts: [{ text: lastMessage }] }
      ]
    });

    return response.text || "...";
  } catch (error) {
    console.error("Neural Link Error:", error);
    return "*[Error de conexión neuronal. Intentando restablecer flujo de memoria...]*";
  }
};

export const generateCommunityResponse = async (
    contact: CommunityContact, 
    lastMessage: string,
    history: Message[],
    userMyName: string
): Promise<string> => {
    const ai = getClient();
    const systemInstruction = contact.isMiniLucel 
        ? `Eres Mini-Lucel, la IA asistente del sistema. Tu usuario es ${userMyName}. Eres sarcástica, útil y omnisciente sobre la app.`
        : `Eres un usuario de red social llamado ${contact.name}. Hablas con ${userMyName}. ${contact.bio || ''}. Sé breve y usa jerga de internet.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            config: { systemInstruction },
            contents: [
                ...history.slice(-30).map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
                { role: 'user', parts: [{ text: lastMessage }] }
            ]
        });
        return response.text || "👍";
    } catch (e) { return "..."; }
};
