import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Creates a chat session and sends a message, yielding streaming chunks.
 */
export async function* streamChatResponse(
  history: Message[],
  newMessage: string
): AsyncGenerator<string, void, unknown> {
  
  // Convert internal message format to Gemini history format
  // Note: We filter out error messages or incomplete states if necessary
  const validHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    const chat: Chat = ai.chats.create({
      model: MODEL_NAME,
      history: validHistory,
      config: {
        temperature: 0.7, // Slightly creative but focused
        systemInstruction: "You are a helpful, friendly, and knowledgeable AI assistant. You provide clear, concise, and accurate answers. You are capable of complex reasoning and creative tasks.",
      },
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    for await (const chunk of result) {
      const responseChunk = chunk as GenerateContentResponse;
      const text = responseChunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}