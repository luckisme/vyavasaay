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
      schemeName: z.string().describe("The official name of the government scheme (e.g., 'Kisan Credit Card')."),
      status: z.string().describe("The current status of the scheme. Should be one of: 'Active', 'Seasonal', 'Free'."),
      description: z.string().describe("A concise, one-sentence summary of the scheme's main benefit."),
      keyFeatures: z.array(z.string()).describe("A list of 2-3 short, bullet-point-style key features or benefits."),
      ctaButton: z.string().describe("The call-to-action text for the button (e.g., 'Apply Online', 'Calculate Premium', 'Register Now')."),
    })
  ).describe('A list of 2-3 government schemes most relevant to the farmer.'),
});
export type GovernmentSchemeOutput = z.infer<typeof GovernmentSchemeOutputSchema>;

export async function summarizeGovernmentScheme(input: GovernmentSchemeInput): Promise<GovernmentSchemeOutput> {
  return summarizeGovernmentSchemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGovernmentSchemePrompt',
  input: {schema: GovernmentSchemeInputSchema},
  output: {schema: GovernmentSchemeOutputSchema},
  prompt: `You are an AI assistant specializing in Indian agricultural policies. Your task is to identify relevant government schemes for a farmer based on their specific details and present it in a clear, card-based format.

  Farmer's Profile:
  {{{farmerDetails}}}

  Based on the farmer's profile (especially their location and crops), use your knowledge to find and list the 2-3 most relevant central and state-level government schemes.
  
  For each scheme, provide the following details:
  1.  **schemeName**: The official name of the scheme.
  2.  **status**: A one-word status. Use 'Active' for year-round schemes, 'Seasonal' for time-bound ones (like insurance for a specific crop season), and 'Free' if the main benefit is a free service (like soil testing).
  3.  **description**: A single, concise sentence summarizing the scheme.
  4.  **keyFeatures**: A list of 2 or 3 short, impactful bullet points.
  5.  **ctaButton**: The most appropriate call-to-action button text, like 'Apply Online', 'Calculate Premium', or 'Register Now'.

  Ensure all monetary values are in Indian Rupees (₹). Structure the output according to the schema and provide the entire response in {{{language}}}.
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
