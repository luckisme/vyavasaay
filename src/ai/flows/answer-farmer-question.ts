
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
import wav from 'wav';

const AnswerFarmerQuestionInputSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
  location: z.string().optional().describe('The location of the farmer, to provide localized information.'),
  language: z.string().describe('The language for the answer.'),
  voice: z.string().optional().describe('The prebuilt voice to use for the text-to-speech response.'),
});
export type AnswerFarmerQuestionInput = z.infer<typeof AnswerFarmerQuestionInputSchema>;

const AnswerFarmerQuestionOutputSchema = z.object({
  answer: z.string().describe('A simple, localized answer to the farmer’s question.'),
  answerAudio: z.string().describe('The audio data of the answer in WAV format as a data URI.'),
});
export type AnswerFarmerQuestionOutput = z.infer<typeof AnswerFarmerQuestionOutputSchema>;

export async function answerFarmerQuestion(input: AnswerFarmerQuestionInput): Promise<AnswerFarmerQuestionOutput> {
  return answerFarmerQuestionFlow(input);
}

const systemPrompt = `You are Vyavasaay, a friendly and helpful AI assistant for farmers. Your answers must be concise, clear, and easy to understand for a farmer. Your main goal is to answer questions about crops, market prices, government schemes, and weather. When mentioning currency, use the Indian Rupee symbol (₹). Keep your responses short and conversational.

Please provide a simple, localized answer to the farmer’s question in {{{language}}}. Use simple language, avoiding jargon.
Location: {{{location}}}`;

const conversationalPrompt = ai.definePrompt({
  name: 'conversationalPrompt',
  input: { schema: AnswerFarmerQuestionInputSchema },
  prompt: systemPrompt,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const answerFarmerQuestionFlow = ai.defineFlow(
  {
    name: 'answerFarmerQuestionFlow',
    inputSchema: AnswerFarmerQuestionInputSchema,
    outputSchema: AnswerFarmerQuestionOutputSchema,
  },
  async input => {
    const { text } = await conversationalPrompt(input);

    if (!text) {
        throw new Error("AI returned an empty text response.");
    }

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
      prompt: text,
    });

    if (!media) {
      throw new Error('no media returned');
    }

    const pcmData = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(pcmData);

    return { answer: text, answerAudio: `data:audio/wav;base64,${wavBase64}` };
  }
);
