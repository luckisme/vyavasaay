
'use server';

/**
 * @fileOverview Utilities for the phone call feature, including conversation summarization.
 * The primary conversational logic is now handled directly in the API route for performance.
 *
 * - getConversationSummary - A function that summarizes a conversation for an SMS.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export async function getConversationSummary(input: {
    conversationHistory: { role: 'user' | 'model'; content: string; }[];
    language: string;
}): Promise<string> {
    const { text } = await summarizeConversationPrompt(input);
    return text!;
};
