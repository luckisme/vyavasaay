
'use server';

/**
 * @fileOverview A conversational flow that answers phone call questions from farmers.
 *
 * - answerPhoneCallQuestion - A function that handles a turn in the conversation.
 * - AnswerPhoneCallQuestionInput - The input type for the function.
 * - AnswerPhoneCallQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AnswerPhoneCallQuestionInputSchema = z.object({
  question: z.string().describe('The question asked by the farmer.'),
  language: z.string().describe('The language in which the answer should be provided.'),
  voice: z.string().optional().describe('The prebuilt voice to use for the text-to-speech response.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation so far.'),
  callSid: z.string().optional().describe('The unique session ID for the call.'),
});
export type AnswerPhoneCallQuestionInput = z.infer<typeof AnswerPhoneCallQuestionInputSchema>;

const AnswerPhoneCallQuestionOutputSchema = z.object({
  answerAudio: z.string().describe('The audio data of the answer in WAV format as a data URI.'),
  answerText: z.string().describe('The text of the answer.'),
});
export type AnswerPhoneCallQuestionOutput = z.infer<typeof AnswerPhoneCallQuestionOutputSchema>;

export async function answerPhoneCallQuestion(input: AnswerPhoneCallQuestionInput): Promise<AnswerPhoneCallQuestionOutput> {
  return answerPhoneCallConversationFlow(input);
}

const conversationalPrompt = ai.definePrompt({
    name: 'answerPhoneCallConversationalPrompt',
    input: { schema: AnswerPhoneCallQuestionInputSchema },
    prompt: `You are a helpful and friendly AI assistant for farmers named Vyavasaay. You are speaking to a farmer on the phone.

    This is a voice conversation. Keep your answers concise, clear, and to the point.
    If the farmer just started the conversation by saying "Hello" or something similar, greet them warmly and ask how you can help.
    
    Answer questions about crops, market prices, government schemes, and weather in their local language.
    When mentioning currency, use the Indian Rupee symbol (₹).

    Conversation History:
    {{#each conversationHistory}}
      {{#if (eq role 'user')}}Farmer: {{content}}{{/if}}
      {{#if (eq role 'model')}}Assistant: {{content}}{{/if}}
    {{/each}}
  
    New Question from Farmer: {{{question}}}
  
    Please provide a helpful answer in {{{language}}}.
    `,
});

const answerPhoneCallConversationFlow = ai.defineFlow(
  {
    name: 'answerPhoneCallConversationFlow',
    inputSchema: AnswerPhoneCallQuestionInputSchema,
    outputSchema: AnswerPhoneCallQuestionOutputSchema,
  },
  async input => {
    const {text} = await conversationalPrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
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

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const answerAudio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {answerAudio, answerText: text!};
  }
);

// New flow to generate SMS summary
const summarizeConversationPrompt = ai.definePrompt({
    name: 'summarizeConversationPrompt',
    input: { schema: z.object({
        conversationHistory: z.array(z.object({
            role: z.enum(['user', 'model']),
            content: z.string(),
        })),
        language: z.string(),
    })},
    prompt: `Summarize the key points from the following conversation between a farmer and an AI assistant into a concise message suitable for an SMS. Respond in {{{language}}}.
    
    Conversation:
    {{#each conversationHistory}}
      {{#if (eq role 'user')}}Farmer: {{content}}{{/if}}
      {{#if (eq role 'model')}}Assistant: {{content}}{{/if}}
    {{/each}}
    `
});

export const getConversationSummaryFlow = ai.defineFlow({
    name: 'getConversationSummaryFlow',
    inputSchema: z.object({
        conversationHistory: z.array(z.object({
            role: z.enum(['user', 'model']),
            content: z.string(),
        })),
        language: z.string(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    const { text } = await summarizeConversationPrompt(input);
    return text!;
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

    let bufs = [] as any[];
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
