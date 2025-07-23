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
  disease: z.string().describe('The identified disease or issue affecting the crop (e.g., "Tomato Blight", "Wheat Rust").'),
  riskLevel: z.enum(["Low", "Medium", "High"]).describe("The assessed risk level to the crop."),
  detectionDetails: z.string().describe("A very brief summary of the detection (e.g., 'Early stage detection', 'Preventive measures needed')."),
  recommendedActions: z.string().describe('Recommended actions to address the identified issue.'),
  confidence: z.number().describe('The confidence level of the diagnosis (0-1).'),
});
export type DiagnoseCropFromImageOutput = z.infer<typeof DiagnoseCropFromImageOutputSchema>;

export async function diagnoseCropFromImage(input: DiagnoseCropFromImageInput): Promise<DiagnoseCropFromImageOutput> {
  return diagnoseCropFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropFromImagePrompt',
  input: {schema: DiagnoseCropFromImageInputSchema},
  output: {schema: DiagnoseCropFromImageOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the image of the crop provided.

Based on your analysis, provide:
1.  **disease**: The common name of the disease or issue.
2.  **riskLevel**: Assess the risk as 'Low', 'Medium', or 'High' based on the severity and potential for damage.
3.  **detectionDetails**: A very short phrase describing the finding, like 'Early stage detection' or 'Preventive measures needed'.
4.  **recommendedActions**: A clear, actionable plan for the farmer.
5.  **confidence**: Your confidence in this diagnosis from 0.0 to 1.0.

Consider the location of the crop, if provided: {{{location}}}. This can help in identifying region-specific pests and diseases.

Crop Image: {{media url=photoDataUri}}

Ensure the response is clear and actionable for farmers. Provide the entire response in {{{language}}}.`,
  config: {
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
