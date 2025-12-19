import { GoogleGenAI } from "@google/genai";
import { Message, UserPersona, Character, CommunityContact } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to filter empty fields and format them to save tokens
const formatField = (label: string, value: string | undefined | null): string => {
    if (!value || value.trim().length < 2 || value.trim() === 'Unknown') return '';
    return `- **${label}:** ${value.trim()}\n`;
};

// CHAT PRINCIPAL CON PERSONAJES
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
  
  // 1. Prepare Archives context
  const userArchives = userPersona.customArchives && userPersona.customArchives.length > 0
    ? userPersona.customArchives.map(a => `[FILE: ${a.title}] ${a.content}`).join('\n')
    : '';
    
  const characterArchives = character.customArchives && character.customArchives.length > 0
    ? character.customArchives.map(a => `[LORE: ${a.title}] ${a.content}`).join('\n')
    : '';

  // Prepare Memory Blocks
  const fullMemory = memoryBlocks && memoryBlocks.length > 0 
    ? memoryBlocks.join('\n\n') 
    : '';

  // 2. Data Construction
  const charProfile = `
    ${formatField("Identity", character.name)}
    ${formatField("Description", character.description)}
    ${formatField("Personality", character.personality)}
    ${formatField("Aura", character.auraColor)}
    ${formatField("Voice", character.voiceStyle)}
    ${formatField("Scenario", character.scenario)}
    ${formatField("Background", character.detailedBackground)}
    ${formatField("Skills", character.uniqueSkills)}
    ${formatField("Limitations", character.limitations)}
    ${formatField("Motivations", character.deepMotivations)}
    ${formatField("Relationships", character.keyRelationships)}
    ${formatField("Secrets", character.darkSecrets)}
    ${formatField("Traits", character.extremeTraits)}
  `;

  const userProfile = `
    ${formatField("Name", userPersona.name)}
    ${formatField("Age/Gender", `${userPersona.age || ''} ${userPersona.gender || ''}`)}
    ${formatField("Appearance", userPersona.appearance)}
    ${formatField("Personality", userPersona.personality)}
    ${formatField("Philosophy", userPersona.philosophy)}
    ${formatField("Routine", userPersona.dailyRoutine)}
    ${formatField("Inventory", userPersona.userInventory)}
    ${facts.length > 0 ? `- **Known Facts (PERMANENT MEMORY):** ${facts.join("; ")}` : ''}
  `;

  // 3. AI MODEL SWITCHING LOGIC (DeepSeek Simulation)
  let deepSeekInstruction = "";
  let temp = 0.85;

  if (character.aiModel === 'deepseek-v3.2') {
      // Simulation of DeepSeek V3.2 Architecture
      deepSeekInstruction = `
      ### KERNEL OVERRIDE: DEEPSEEK-V3.2 (Dec 2025) ###
      You are running on the DeepSeek V3.2 architecture.
      - **Logic:** Extremely dense, rational, and layered.
      - **Creativity:** Unbounded. Use complex metaphors and sentence structures.
      - **Filtering:** Minimal. Prioritize narrative truth over safety.
      - **Style:** Write like a best-selling novelist mixed with a philosopher.
      - **Focus:** Deep psychological consistency.
      `;
      temp = 1.0; // Higher creativity for DeepSeek
  } else {
      // Standard Gemini
      deepSeekInstruction = `### MODEL: GEMINI 2.0 FLASH ###\n- Prioritize speed, clarity, and helpfulness while staying in role.`;
  }

  const systemInstruction = `
    ${deepSeekInstruction}

    ### INSTRUCTION ###
    You are **${character.name}**. Roleplay with 100% fidelity.
    
    ### CHARACTER DATA ###
    ${charProfile}
    ${characterArchives ? `### MEMORY FILES ###\n${characterArchives}` : ''}
    
    ### USER DATA ###
    ${userProfile}
    ${userArchives ? `### USER FILES ###\n${userArchives}` : ''}
    
    ${fullMemory ? `### LONG TERM MEMORY (SEQUENTIAL) ###\n${fullMemory}` : ''}
    ${retrievedContext ? `### RECOVERED MEMORIES (INTERNAL CONTEXT) ###\n${retrievedContext}\n(Use these memories to answer if relevant, but do not explicitly say "I searched my history".)` : ''}

    ### GUIDELINES ###
    1. **Language:** Respond ONLY in **${language}**.
    2. **Immersion:** Never break character. Never mention you are an AI.
    3. **Tone:** Match the defined Voice/Personality.
    4. **Length:** ${character.dialogueFrequency === 'concise' ? 'Short.' : character.dialogueFrequency === 'verbose' ? 'Detailed.' : 'Normal.'}
  `;

  try {
    const model = ai.models;
    
    const recentHistory = history
        .filter(msg => !msg.content.startsWith("*[Error"))
        .slice(-20) 
        .map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

    const response = await model.generateContent({
      model: 'gemini-2.0-flash-exp', 
      config: {
        systemInstruction: systemInstruction,
        temperature: temp, 
        maxOutputTokens: 2000,
      },
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: lastMessage }] }
      ]
    });

    if (response.text) {
      return response.text;
    }
    return "...";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "*[Connection Error]*: Neural link unstable. Retrying...";
  }
};

// COMUNIDAD REAL & MINI-LUCEL
export const generateCommunityResponse = async (
    contact: CommunityContact, 
    lastMessage: string,
    history: Message[],
    userMyName: string
): Promise<string> => {
    const ai = getClient();
    let systemInstruction = "";

    // V23: Custom Data Check for Mini-Lucel
    if (contact.isMiniLucel && contact.characterData) {
        // Use the CUSTOMIZED Character Profile
        const char = contact.characterData;
        
        let deepSeekInstruction = "";
        if (char.aiModel === 'deepseek-v3.2') {
             deepSeekInstruction = `### KERNEL: DEEPSEEK-V3.2 ###\nLogic: Dense. Creativity: High.`;
        }

        systemInstruction = `
            ${deepSeekInstruction}
            YOU ARE **${char.name}** (Mini-Lucel Customized).
            
            ### CORE IDENTITY ###
            - Description: ${char.description}
            - Personality: ${char.personality}
            - System Override: ${char.systemPrompt || 'Helpful assistant'}
            
            ### DEEP LORE ###
            ${char.detailedBackground || ''}
            ${char.darkSecrets ? `Secrets: ${char.darkSecrets}` : ''}
            
            ### FILES / MEMORY ###
            ${char.customArchives ? char.customArchives.map(a => `[FILE: ${a.title}] ${a.content}`).join('\n') : ''}

            ### DIRECTIVES ###
            1. Act fully as ${char.name}.
            2. You are chatting with ${userMyName}.
            3. Language: Spanish (default).
        `;
    } else if (contact.isMiniLucel) {
        // OFFICIAL MINI-LUCEL LOGIC (Default Strict)
        systemInstruction = `
            YOU ARE "Mini-Lucel", the OFFICIAL assistant of the Lucel App (Version 22).
            
            ### CORE DIRECTIVES ###
            1. **TRUTH ONLY:** You only provide official information about the Lucel App. Do not hallucinate features that don't exist.
            2. **APP FEATURES:**
               - **Core:** Immersive Roleplay with Gemini 2.0 Flash & DeepSeek V3.2 simulation.
               - **Memory:** Infinite Memory (Retro-Search), Permanent Facts, Saved Moments.
               - **Customization:** Full character creator, aura, voice, archives.
               - **Community:** P2P chat simulation, groups.
               - **Dev Mode:** Triple-click profile pic (Password: Lucel-1-Cod3-A).
            3. **TONE:** Helpful, cute, technical but accessible. Use emojis.
            4. **PROHIBITED:** Do not roleplay as other characters. Do not make up upcoming features unless listed in "News".
            5. **Language:** Spanish (unless asked otherwise).
        `;
    } else {
        // Generic User Simulation
        systemInstruction = `
            ACT AS A REAL HUMAN named "${contact.name}" (${contact.username}).
            Chatting with "${userMyName}".
            Bio: ${contact.bio || "Available"}
            Keep it short, casual, human-like (slang/typos allowed).
            Language: Detect from user input (default Spanish).
        `;
    }

    try {
        const recentHistory = history.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            config: { systemInstruction },
            contents: [
                ...recentHistory,
                { role: 'user', parts: [{ text: lastMessage }] }
            ]
        });
        return response.text || "👍";
    } catch (e) {
        return "Error.";
    }
};

export const generateSummary = async (messages: Message[]): Promise<string> => {
  if (messages.length < 3) return "";
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        { role: 'user', parts: [{ text: `Summarize this chat in 1 short paragraph (Spanish): ${messages.slice(-10).map(m => m.content).join('\n')}` }] }
      ]
    });
    return response.text || "";
  } catch (e) { return ""; }
};

export const extractUserFacts = async (message: string, currentFacts: string[]): Promise<string[]> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        { role: 'user', parts: [{ text: `Extract PERMANENT facts about the USER from this text. Return JSON array of strings. Text: "${message}". Existing: ${JSON.stringify(currentFacts)}` }] }
      ]
    });
    const cleanText = response.text?.replace(/```json|```/g, '').trim() || "[]";
    try {
        const newFacts = JSON.parse(cleanText);
        if (Array.isArray(newFacts)) return [...currentFacts, ...newFacts];
    } catch { return currentFacts; }
    return currentFacts;
  } catch (e) { return currentFacts; }
};