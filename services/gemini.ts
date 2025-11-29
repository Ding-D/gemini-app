import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { DIGITAL_EMPLOYEE_TOOLS } from "./tools";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const API_KEY = process.env.API_KEY;

export const initializeGemini = () => {
  if (!API_KEY) {
    console.error("API Key missing");
    return;
  }
  ai = new GoogleGenAI({ apiKey: API_KEY });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      temperature: 0.7,
      systemInstruction: `You are a highly capable Digital Employee named "Atlas". 
      Your goal is to assist users with workplace tasks efficiently.
      
      CRITICAL INSTRUCTIONS:
      1. When a user asks for an action (like booking a meeting, creating a ticket, or checking data), ALWAYS use the provided tools.
      2. Do not just say you will do it; issue the Tool Call.
      3. Be concise, professional, and helpful. 
      4. Use Markdown for formatting tables, lists, and emphasis in your text responses.
      5. If a tool is called, briefly explain what you are setting up before the tool widget appears.
      `,
      tools: [{ functionDeclarations: DIGITAL_EMPLOYEE_TOOLS }]
    }
  });
};

export const sendMessageToGemini = async (
  message: string, 
  previousHistory?: Content[] 
): Promise<{ text: string; toolCalls?: any[] }> => {
  if (!chatSession) initializeGemini();
  if (!chatSession) throw new Error("Failed to initialize AI");

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({
        message
    });

    const text = response.text || "";
    
    // Extract tool calls if any
    const functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter((part: Part) => part.functionCall)
      .map((part: Part) => ({
        ...part.functionCall,
        // Generate a unique ID for frontend tracking if not provided by API
        id: part.functionCall?.id || `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

    return {
      text,
      toolCalls: functionCalls
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "I apologize, but I encountered a connection error. Please try again." };
  }
};

export const sendToolResultToGemini = async (
  toolName: string,
  toolId: string,
  result: any
): Promise<{ text: string; toolCalls?: any[] }> => {
  if (!chatSession) throw new Error("No active session");

  // Send the tool response back to the model
  const response = await chatSession.sendMessage({
      message: [{
          role: 'user',
          parts: [{
              functionResponse: {
                  name: toolName,
                  id: toolId,
                  response: { result: result }
              }
          }]
      }]
  });

  const text = response.text || "";
   const functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter((part: Part) => part.functionCall)
      .map((part: Part) => ({
        ...part.functionCall,
        id: part.functionCall?.id || `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

  return { text, toolCalls: functionCalls };
};
