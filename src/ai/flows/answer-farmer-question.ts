
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
import { googleAI } from '@genkit-ai/googleai';

const AnswerFarmerQuestionInputSchema = z.object({
  question: z.string().describe('The farmer’s question about market prices, government schemes, or weather.'),
  location: z.string().optional().describe('The location of the farmer, to provide localized information.'),
  language: z.string().describe('The language for the answer.'),
  voice: z.string().optional().describe('The prebuilt voice to use for the text-to-speech response.'),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('A simple, localized answer to the farmer’s question.'),
  answerAudio: z.string().describe('The audio data of the answer in MP3 format as a data URI.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

export async function answerFarmerQuestion(input: AnswerFarmerQuestionInput): Promise<AnswerFarmerQuestionOutput> {
  return answerFarmerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFarmerQuestionPrompt',
  input: {schema: AnswerFarmerQuestionInputSchema},
  prompt: `You are an AI assistant helping farmers by answering their questions about market prices, government schemes, or weather.

  Please provide a simple, localized answer to the farmer’s question in {{{language}}}. Use simple language, avoiding jargon. When mentioning currency, use the Indian Rupee symbol (₹).

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
    const {text} = await prompt(input);

    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: input.voice || 'Achernar'},
          },
        },
      },
      prompt: text!,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    return { answer: text!, answerAudio: media.url };
  }
);
