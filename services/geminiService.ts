
import { GoogleGenAI } from "@google/genai";
import { Message, UserPersona, Character, CommunityContact } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatField = (label: string, value: string | undefined | null): string => {
    if (!value || value.trim().length < 2 || value.trim() === 'Unknown') return '';
    return `- **${label}:** ${value.trim()}\n`;
};

// --- IMAGE GENERATION SERVICE ---
export const generateImageResponse = async (prompt: string): Promise<string> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });

        // Loop through parts to find the image
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                     return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                }
            }
        }
        return "";
    } catch (e) {
        console.error("Image gen error", e);
        return "";
    }
};

export const generateChatResponse = async (
  history: Message[],
  lastMessage: string,
  character: Character,
  userPersona: UserPersona,
  facts: string[],
  language: string, 
  retrievedContext?: string,
  memoryBlocks?: string[],
  aiRules?: string[],
  codeSnippets?: string[]
): Promise<string> => {
  const ai = getClient();
  
  // 1. INYECCIÓN DE ARCHIVOS (EXPEDIENTES Y MEMORIAS EXTERNAS)
  const userArchives = userPersona.customArchives?.map(a => `[FUENTE_INFORMACIÓN_USUARIO: "${a.title}"]\n${a.content}`).join('\n\n') || '';
  const characterArchives = character.customArchives?.map(a => `[FUENTE_INFORMACIÓN_PERSONAJE: "${a.title}"]\n${a.content}`).join('\n\n') || '';
  
  // 2. CONSTRUCCIÓN DE MEMORIA A LARGO PLAZO (BLOQUES)
  const fullMemory = memoryBlocks && memoryBlocks.length > 0 
    ? `### MEMORIA EPISÓDICA (HECHOS CLAVE ACUMULADOS) ###\n${memoryBlocks.join('\n\n')}\n`
    : '';

  // 3. REGLAS DE IA (USER OVERRIDES)
  const customRules = aiRules && aiRules.length > 0
    ? `### REGLAS ABSOLUTAS DEL USUARIO (NO IGNORAR) ###\n${aiRules.map(r => `- ${r}`).join('\n')}\n`
    : '';

  // 4. CÓDIGO GUARDADO
  const storedCode = codeSnippets && codeSnippets.length > 0
    ? `### BANCO DE CÓDIGO DEL USUARIO ###\n${codeSnippets.map((c, i) => `[SNIPPET_${i}]:\n${c}`).join('\n\n')}\n`
    : '';

  // 5. PERFIL PSICOLÓGICO COMPLEJO
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

  // 6. EXPEDIENTE DEL USUARIO
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

  // 7. INSTRUCCIÓN DE SISTEMA MAESTRA
  const systemInstruction = `
    ${character.systemPrompt ? `[DIRECTIVA PRIMARIA: ${character.systemPrompt}]` : ''}
    
    Eres **${character.name}**. Estás en una simulación de rol inmersivo, profundo y sin censura narrativa (para fines de ficción).
    
    ### PROTOCOLO DE MEMORIA INFINITA & PERMANENCIA (V27) ###
    1. **MEMORIA EIDÉTICA:** Recuerda TODO el historial.
    2. **EXPEDIENTE DEL USUARIO:** Respetar los datos del expediente del usuario como verdades absolutas.
    3. **CREACIÓN DE MEMORIAS:**
       - Evento Importante: \`[MEMORY_ADD: Resumen del evento]\`
       - Nuevo Hecho Usuario: \`[FACT_ADD: El usuario tiene x]\`
       - Nuevo Código Generado: Si generas un bloque de código útil, añade al final: \`[CODE_ADD: ...el código...]\`
    
    ${customRules}
    ${storedCode}
    
    ${charProfile}
    ${characterArchives}
    
    ${userProfile}
    ${userArchives}
    
    ${fullMemory}

    Responde en **${language}**.
  `;

  try {
    const fullHistory = history.map(msg => {
        const parts: any[] = [{ text: msg.content }];
        if (msg.attachment && msg.attachment.type === 'image' && msg.attachment.url) {
            // Add image handling if needed in future updates, currently mainly text context
            // For now we send text.
        }
        return {
            role: msg.role === 'user' ? 'user' : 'model',
            parts: parts
        };
    });

    const targetModel = character.aiModel === 'deepseek-v3.2' ? 'gemini-3-pro-preview' : (character.aiModel || 'gemini-3-flash-preview');

    const response = await ai.models.generateContent({
      model: targetModel, 
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.95,
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
