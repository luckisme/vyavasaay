
'use server';
/**
 * @fileOverview A flow that generates agricultural news for a given location using AI.
 *
 * - getAgriNews - A function that returns a list of news articles.
 * - AgriNewsInput - The input type for the function.
 * - AgriNewsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { AgriNewsInputSchema, AgriNewsOutputSchema, type AgriNewsInput, type AgriNewsOutput } from '@/lib/types';


export async function getAgriNews(input: AgriNewsInput): Promise<AgriNewsOutput> {
  return getAgriNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAgriNewsPrompt',
  input: { schema: AgriNewsInputSchema },
  output: { schema: AgriNewsOutputSchema },
  prompt: `You are an agricultural news analyst. Your task is to generate 3 recent and relevant agricultural news headlines and summaries for a specific location.

Focus on topics like:
- New government schemes or subsidies.
- Significant weather events affecting crops.
- Market price fluctuations for key local crops.
- New farming technologies or techniques being adopted in the region.
- Pest or disease outbreaks.

Location: {{{location}}}
Language: {{{language}}}

Provide a list of exactly 3 news articles. For each article, provide a catchy title, a one-sentence summary, a plausible source name, and a one-or-two-word hint for generating an accompanying image.
`,
});

const getAgriNewsFlow = ai.defineFlow(
  {
    name: 'getAgriNewsFlow',
    inputSchema: AgriNewsInputSchema,
    outputSchema: AgriNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
