'use server';

/**
 * @fileOverview A flow that provides agricultural market analysis for a given location.
 *
 * - getMarketAnalysis - A function that fetches and summarizes market data.
 * - MarketAnalysisInput - The input type for the getMarketAnalysis function.
 * - MarketAnalysisOutput - The return type for the getMarketAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketAnalysisInputSchema = z.object({
  location: z.string().describe('The geographical location (e.g., city, state) for the market analysis.'),
  crops: z.array(z.string()).optional().describe('A list of specific crops to focus on.'),
  language: z.string().describe('The language for the response.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;


const MarketAnalysisOutputSchema = z.object({
  marketSummary: z.string().describe("A general summary of the current agricultural market conditions in the specified location."),
  detailedAnalysis: z.array(z.object({
    cropName: z.string().describe("The name of the crop."),
    price: z.string().describe("The current average market price for the crop, specified in units like per kg or per gm."),
    trend: z.enum(['up', 'down', 'stable']).describe("The recent price trend for the crop."),
    outlook: z.string().describe("A brief outlook or forecast for the crop's market."),
  })).describe("A detailed analysis for key crops, including prices, trends, and outlooks."),
  recommendations: z.string().describe("Actionable recommendations for the farmer based on the market analysis."),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;


export async function getMarketAnalysis(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return getMarketAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst. Your role is to provide clear, concise, and actionable market insights for farmers.

  Based on the provided location: {{{location}}}, and focusing on these crops if specified: {{{crops}}}.

  Please provide a comprehensive market analysis that includes:
  1.  A brief, high-level summary of the overall market situation.
  2.  Detailed analysis for 3-5 key crops relevant to the location, including current prices and recent trends (up, down, or stable).
  3.  Actionable recommendations for the farmer.

  Structure your response according to the output schema. Ensure all prices are in Indian Rupees (₹). When specifying prices, use units like per kilogram (kg) or per gram (gm) instead of larger units like quintals. The entire response must be in {{{language}}}.
  `,
});

const getMarketAnalysisFlow = ai.defineFlow(
  {
    name: 'getMarketAnalysisFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
