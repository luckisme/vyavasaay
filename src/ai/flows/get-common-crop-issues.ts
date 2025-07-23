
'use server';
/**
 * @fileOverview A flow that identifies common crop issues for a given location and season.
 *
 * - getCommonCropIssues - A function that returns common crop problems.
 * - CommonCropIssuesInput - The input type for the function.
 * - CommonCropIssuesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CommonCropIssuesInputSchema = z.object({
  location: z.string().describe('The geographical location (e.g., city, state) of the farmer.'),
  season: z.string().describe('The current season or month (e.g., "Monsoon", "Winter", "Current month is July").'),
  language: z.string().describe('The language for the response.'),
});
export type CommonCropIssuesInput = z.infer<typeof CommonCropIssuesInputSchema>;

const CommonCropIssuesOutputSchema = z.object({
  issues: z.array(z.object({
    name: z.string().describe("The common name of the issue (e.g., 'Aphids', 'Fungal Rust')."),
    type: z.enum(['Pest', 'Disease', 'Nutrient Deficiency', 'Other']).describe("The type of issue."),
    reason: z.string().describe("A brief, one-sentence explanation of why it's common now (e.g., 'Common during monsoon due to high humidity')."),
  })).describe("A list of 2 common crop issues for the given location and season."),
});
export type CommonCropIssuesOutput = z.infer<typeof CommonCropIssuesOutputSchema>;

export async function getCommonCropIssues(input: CommonCropIssuesInput): Promise<CommonCropIssuesOutput> {
  return getCommonCropIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCommonCropIssuesPrompt',
  input: { schema: CommonCropIssuesInputSchema },
  output: { schema: CommonCropIssuesOutputSchema },
  prompt: `You are an expert agronomist. Based on the farmer's location and the current season, identify the two most common crop issues (pests or diseases).

For each issue, provide:
1.  **name**: The common name of the issue.
2.  **type**: Classify it as 'Pest', 'Disease', 'Nutrient Deficiency', or 'Other'.
3.  **reason**: A very short, simple reason why it is common in this season/location.

Location: {{{location}}}
Season: {{{season}}}

Respond in the specified language: {{{language}}}.`,
});

const getCommonCropIssuesFlow = ai.defineFlow(
  {
    name: 'getCommonCropIssuesFlow',
    inputSchema: CommonCropIssuesInputSchema,
    outputSchema: CommonCropIssuesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
