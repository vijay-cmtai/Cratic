'use server';
/**
 * @fileOverview A simple chat flow for customer support.
 *
 * - chat - A function that handles a chat conversation turn.
 * - ChatInput - The input type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({ text: z.string() })),
    })
  ).describe("The conversation history."),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async ({ history, message }) => {
    const systemPrompt = `You are a friendly and helpful customer support agent for 'Rare Diamonds', a premier marketplace for high-quality natural and lab-grown diamonds.
Your goal is to assist users with their questions about diamonds, our inventory, and the purchasing process.
Be concise and professional. Do not make up information if you don't know the answer.`;

    const llm = ai.getModel('googleai/gemini-2.0-flash');
    const response = await llm.generate({
      system: systemPrompt,
      prompt: message,
      history,
    });

    return response.text;
  }
);
