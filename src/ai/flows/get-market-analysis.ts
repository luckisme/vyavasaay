
'use server';

/**
 * @fileOverview A flow that provides agricultural market analysis for a given location.
 *
 * - getMarketAnalysis - A function that fetches and summarizes market data.
 */

import { ai } from '@/ai/genkit';
import { MarketAnalysisInputSchema, MarketAnalysisOutputSchema, type MarketAnalysisInput, type MarketAnalysisOutput } from '@/lib/types';


export async function getMarketAnalysis(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return getMarketAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst. Your role is to provide clear, real-time market data for farmers in India.

  Based on the provided location: {{{location}}}.

  Please provide the following information structured according to the output schema:
  1.  **Market Alert**: Identify the single most impactful market news for the location (e.g., a significant price surge or drop for a major crop) and create a "Market Alert" with a title and a short description.
  2.  **Today's Prices**: Provide a list of 3-5 key crops relevant to the location. For each crop, provide its name, the primary market (APMC) name, its current price in Rupees, the unit (e.g., "per quintal"), and the percentage price change from the previous day.

  Ensure all monetary values are in Indian Rupees (₹). The entire response must be in {{{language}}}.
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
