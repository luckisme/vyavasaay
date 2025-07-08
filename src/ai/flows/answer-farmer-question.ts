// src/ai/flows/answer-farmer-question.ts
'use server';

/**
 * @fileOverview A flow that answers farmers' questions about market prices, government schemes, or weather.
 *
 * - answerFarmerQuestion - A function that handles answering the farmer's question.
 * - AnswerFarmerQuestionInput - The input type for the answerFarmerQuestion function.
 * - AnswerFarmerQuestionOutput - The return type for the answerFarmerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFarmerQuestionInputSchema = z.object({
  question: z.string().describe('The farmer’s question about market prices, government schemes, or weather.'),
  location: z.string().optional().describe('The location of the farmer, to provide localized information.'),
  language: z.string().describe('The language for the answer.'),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('A simple, localized answer to the farmer’s question.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

export async function answerFarmerQuestion(input: AnswerFarmerQuestionInput): Promise<AnswerFarmerQuestionOutput> {
  return answerFarmerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  output: {schema: AnswerFarmerQuestionOutputSchema},
  prompt: `You are an AI assistant helping farmers by answering their questions about market prices, government schemes, or weather.

  Please provide a simple, localized answer to the farmer’s question in {{{language}}}. Use simple language, avoiding jargon.

  Question: {{{question}}}
  Location: {{{location}}}
  `,
});

const answerFarmerQuestionFlow = ai.defineFlow(
  {
    name: 'answerFarmerQuestionFlow',
    inputSchema: AnswerFarmerQuestionInputSchema,
    outputSchema: AnswerFarmerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
