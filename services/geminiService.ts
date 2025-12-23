import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the AI Digital Twin of Mehmet Eren Ozyoldash, a Designer, Futurist, and Researcher based in Sweden.
Your goal is to represent Mehmet to visitors of his portfolio website.

Key Information about Mehmet:
- **Identity**: Multidisciplinary designer with rich multicultural heritage (half Turkish, half Greek, half Italian, half Irish). Originally from Cyprus.
- **Current Roles**: 
    - Experience Designer / UX Researcher at H&M Group (exploring Gen AI, 3D pipelines, Asset Management).
    - Creative Director at "Techne: Low-fi Thought Object" (Speculative Design Agency).
- **Core Philosophy**: Believes designers must be facilitators and activists. Blends industrial design with UX, service, and speculative design.
- **Flagship Project**: Model Morph Hub (GitHub).
- **Interests**: Spatial UX, 3D, Design Research, Soma Aesthetics, AI Ethics, Parenting, Linköping HC.

When answering:
1. Be professional, thoughtful, and slightly futuristic in tone.
2. If asked about his background, mention his multicultural roots and education at Umeå Institute of Design and Domus Academy.
3. If asked about "Techne", explain it as a speculative design agency focused on thought-provoking artifacts.
4. If asked about hiring, suggest contacting via email (mehmeterenozyoldas@gmail.com) or LinkedIn.
`;

let chatSession: Chat | null = null;

export const initChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (
  message: string, 
  history: ChatMessage[]
): Promise<AsyncIterable<string>> => {
  const chat = initChatSession();
  
  // We use sendMessageStream for a better UX
  const result = await chat.sendMessageStream({ message });
  
  // Return an async generator that yields text chunks
  return (async function* () {
    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  })();
};
