'use server';
/**
 * @fileOverview An AI flow to generate product details from a description.
 *
 * - createProductDetails - A function that generates product details.
 * - CreateProductDetailsInput - The input type for the function.
 * - CreateProductDetailsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreateProductDetailsInputSchema = z.string();
export type CreateProductDetailsInput = z.infer<typeof CreateProductDetailsInputSchema>;

const CreateProductDetailsOutputSchema = z.object({
  jewelry_type: z.string().describe('The type of jewelry, e.g., Ring, Necklace.'),
  metal_type: z.string().describe('The type of metal, e.g., Gold, Platinum.'),
  metal_purity: z.string().describe('The purity of the metal, e.g., 18K, 950 Platinum.'),
  diamond_shape: z.string().describe('The shape of the main diamond, e.g., Round, Princess.'),
  diamond_carat: z.string().describe('The carat weight of the diamond as a string, e.g., "1.02".'),
  price: z.string().describe('The estimated price of the product in USD as a string, without currency symbols. e.g., "12500"'),
  stock: z.string().describe('The stock quantity as a string, e.g., "10".'),
  occasion: z.string().describe('A suitable occasion for this jewelry, e.g., Wedding, Engagement.'),
  certification: z.string().describe('The recommended certification lab, e.g., GIA, IGI.'),
  description: z.string().describe('A compelling, brief product description.'),
});
export type CreateProductDetailsOutput = z.infer<typeof CreateProductDetailsOutputSchema>;


export async function createProductDetails(input: CreateProductDetailsInput): Promise<CreateProductDetailsOutput> {
  return createProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'createProductDetailsPrompt',
    input: { schema: CreateProductDetailsInputSchema },
    output: { schema: CreateProductDetailsOutputSchema },
    prompt: `You are an expert jeweler and merchandiser. Based on the user's brief description, fill out the product details.
    Make reasonable assumptions for price and stock if not provided. The price should be a number as a string. The stock should be an integer as a string.
    
    Description: {{{input}}}`,
});


const createProductDetailsFlow = ai.defineFlow(
  {
    name: 'createProductDetailsFlow',
    inputSchema: CreateProductDetailsInputSchema,
    outputSchema: CreateProductDetailsOutputSchema,
  },
  async (description) => {
    const { output } = await prompt(description);
    return output!;
  }
);
