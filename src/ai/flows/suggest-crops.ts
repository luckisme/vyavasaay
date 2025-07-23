
'use server';

/**
 * @fileOverview A flow that suggests suitable crops based on farmer's input.
 *
 * - suggestCrops - A function that handles the crop suggestion logic.
 * - SuggestCropsInput - The input type for the suggestCrops function.
 * - CropSuggestionOutput - The return type for the suggestCrops function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestCropsInputSchema = z.object({
  userInput: z.string().describe("The farmer's query detailing land size, location, water availability, season, and soil type."),
  language: z.string().describe('The language for the response.'),
});
export type SuggestCropsInput = z.infer<typeof SuggestCropsInputSchema>;

const CropSuggestionOutputSchema = z.object({
  suggestions: z.array(z.object({
    cropName: z.string().describe("The name of the suggested crop."),
    reasoning: z.string().describe("A brief explanation of why this crop is a good fit for the farmer's conditions."),
    estimatedProfit: z.string().describe("The estimated profit range per unit of land (e.g., '₹18,000–₹25,000 per acre').")
  })).describe("A list of 1 to 3 suggested crops."),
  tip: z.string().describe("A single, short, actionable tip related to crop selection or rotation.")
});
export type CropSuggestionOutput = z.infer<typeof CropSuggestionOutputSchema>;

export async function suggestCrops(input: SuggestCropsInput): Promise<CropSuggestionOutput> {
  return suggestCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCropsPrompt',
  input: { schema: SuggestCropsInputSchema },
  output: { schema: CropSuggestionOutputSchema },
  prompt: `You are an expert agronomist providing crop recommendations to farmers in India. A farmer has provided details about their land and conditions. Your task is to suggest 1 to 3 suitable and profitable crops for the upcoming season.

Analyze the user's input to understand:
- Land size
- Location (State, District)
- Water availability
- Current season (e.g., Monsoon, Rabi, Kharif)
- Soil type (e.g., black soil, red soil)

Based on this, suggest crops that have:
1.  Good local market demand and price in that region.
2.  Relatively low input costs.
3.  Good yield potential for the given conditions.

For each suggested crop, provide:
- The crop name.
- A simple, one or two-sentence reason why it's a good fit.
- An estimated profit range in Indian Rupees (₹), specifying the unit (e.g., per acre).

Finally, provide a single, short, actionable tip, for instance, about crop rotation.

Ensure the entire response is in the specified language: {{{language}}}. Use regional examples and familiar terms where possible.

Farmer's Input:
"{{{userInput}}}"
`,
});

const suggestCropsFlow = ai.defineFlow(
  {
    name: 'suggestCropsFlow',
    inputSchema: SuggestCropsInputSchema,
    outputSchema: CropSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
