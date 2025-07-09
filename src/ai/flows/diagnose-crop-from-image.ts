'use server';
/**
 * @fileOverview A crop diagnosis AI agent that analyzes images of crops to identify diseases or issues.
 *
 * - diagnoseCropFromImage - A function that handles the crop diagnosis process from an image.
 * - DiagnoseCropFromImageInput - The input type for the diagnoseCropFromImage function.
 * - DiagnoseCropFromImageOutput - The return type for the diagnoseCropFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseCropFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    location: z.string().optional().describe('The location (e.g., city, state) where the crop is being grown.'),
    language: z.string().describe('The language for the response.'),
});
export type DiagnoseCropFromImageInput = z.infer<typeof DiagnoseCropFromImageInputSchema>;

const DiagnoseCropFromImageOutputSchema = z.object({
  diagnosis: z.object({
    disease: z.string().describe('The identified disease or issue affecting the crop.'),
    confidence: z.number().describe('The confidence level of the diagnosis (0-1).'),
    recommendedActions: z.string().describe('Recommended actions to address the identified issue.'),
  }).describe('The diagnosis result based on the image analysis.'),
});
export type DiagnoseCropFromImageOutput = z.infer<typeof DiagnoseCropFromImageOutputSchema>;

export async function diagnoseCropFromImage(input: DiagnoseCropFromImageInput): Promise<DiagnoseCropFromImageOutput> {
  return diagnoseCropFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropFromImagePrompt',
  input: {schema: DiagnoseCropFromImageInputSchema},
  output: {schema: DiagnoseCropFromImageOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the image of the crop provided and provide a diagnosis, including the likely disease or issue, a confidence level, and recommended actions.

Consider the location of the crop, if provided: {{{location}}}. This can help in identifying region-specific pests and diseases.

Crop Image: {{media url=photoDataUri}}

Ensure the diagnosis is clear and actionable for farmers. Provide the entire response in {{{language}}}.`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const diagnoseCropFromImageFlow = ai.defineFlow(
  {
    name: 'diagnoseCropFromImageFlow',
    inputSchema: DiagnoseCropFromImageInputSchema,
    outputSchema: DiagnoseCropFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
