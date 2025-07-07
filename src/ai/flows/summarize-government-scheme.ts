// Summarizes government schemes and tailors the information to the specific needs of a farmer.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GovernmentSchemeInputSchema = z.object({
  farmerDetails: z.string().describe('Details about the farmer, including their location, crops grown, and any specific needs or challenges they face.'),
  schemeDatabase: z.string().describe('A database or collection of information about various government schemes, including their benefits and eligibility criteria.'),
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
  prompt: `You are an AI assistant helping farmers understand government schemes.

  Given the following information about a farmer:
  {{farmerDetails}}

  And the following database of government schemes:
  {{schemeDatabase}}

  Identify the schemes that are most relevant to the farmer and provide a tailored summary of each scheme, including eligibility criteria and how to apply. Return the list of relevant schemes in the format specified by the schema.
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
