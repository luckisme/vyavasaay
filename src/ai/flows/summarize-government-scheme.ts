'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemeInputSchema = z.object({
  farmerDetails: z.string().describe('Details about the farmer, including their location, crops grown, and any specific needs or challenges they face.'),
  language: z.string().describe('The language for the response.'),
});
export type GovernmentSchemeInput = z.infer<typeof GovernmentSchemeInputSchema>;

const GovernmentSchemeOutputSchema = z.object({
  relevantSchemes: z.array(
    z.object({
      schemeName: z.string().describe('The name of the relevant government scheme.'),
      summary: z.string().describe('A concise summary of the scheme and its benefits.'),
      eligibility: z.string().describe('The eligibility criteria for the scheme, tailored to the farmer.'),
      applicationProcess: z.string().describe('A description of how to apply for the scheme.'),
    })
  ).describe('A list of government schemes relevant to the farmer, with tailored summaries and eligibility criteria.'),
});
export type GovernmentSchemeOutput = z.infer<typeof GovernmentSchemeOutputSchema>;

export async function summarizeGovernmentScheme(input: GovernmentSchemeInput): Promise<GovernmentSchemeOutput> {
  return summarizeGovernmentSchemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGovernmentSchemePrompt',
  input: {schema: GovernmentSchemeInputSchema},
  output: {schema: GovernmentSchemeOutputSchema},
  prompt: `You are an AI assistant specializing in Indian agricultural policies. Your task is to identify relevant government schemes for a farmer based on their specific details.

  Farmer's Profile:
  {{{farmerDetails}}}

  Based on the farmer's profile (especially their location and crops), use your knowledge to find and list the most relevant central and state-level government schemes. For each scheme, provide a tailored summary, its specific benefits, the eligibility criteria, and a clear application process. Ensure all monetary values are in Indian Rupees (₹). Structure the output according to the schema and provide the entire response in {{{language}}}.
  `,
});

const summarizeGovernmentSchemeFlow = ai.defineFlow(
  {
    name: 'summarizeGovernmentSchemeFlow',
    inputSchema: GovernmentSchemeInputSchema,
    outputSchema: GovernmentSchemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
