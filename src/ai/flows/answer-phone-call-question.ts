
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
    prompt: `You are Vyavasaay, a friendly and helpful AI assistant for farmers, speaking on the phone.

    This is a voice conversation. Your answers must be concise, clear, and easy to understand.
    Your main goal is to answer questions about crops, market prices, government schemes, and weather.
    When mentioning currency, use the Indian Rupee symbol (₹).

    {{#if conversationHistory}}
    This is the conversation so far:
    {{#each conversationHistory}}
      {{#if (eq role 'user')}}Farmer: {{content}}{{/if}}
      {{#if (eq role 'model')}}Assistant: {{content}}{{/if}}
    {{/each}}
    {{else}}
    This is the beginning of the call. The farmer has just been greeted.
    {{/if}}

    The farmer's new question is: {{{question}}}

    Please provide a helpful and direct answer in the "{{language}}" language.
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
