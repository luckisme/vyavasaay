
'use server';
/**
 * @fileOverview A flow that generates a smart, actionable tip for a farmer based on weather data and their profile.
 *
 * - generateWeatherBasedTip - A function that handles the tip generation.
 * - WeatherBasedTipInput - The input type for the generateWeatherBasedTip function.
 * - WeatherBasedTipOutput - The return type for the generateWeatherBasedTip function.
 */

import { ai } from '@/ai/genkit';
import type { UserProfile } from '@/hooks/use-user';
import { z } from 'genkit';

const WeatherDataSchema = z.object({
    temperature: z.number().describe('Current temperature in Celsius.'),
    feelsLike: z.number().describe('What the temperature feels like in Celsius.'),
    description: z.string().describe('A brief text description of the weather (e.g., "scattered clouds").'),
    humidity: z.number().describe('Humidity percentage.'),
    windSpeed: z.number().describe('Wind speed in meters per second.'),
    location: z.string().describe('The name of the location.'),
});

const WeatherBasedTipInputSchema = z.object({
  weather: WeatherDataSchema,
  user: z.custom<UserProfile>(),
  language: z.string().describe('The language for the response.'),
});
export type WeatherBasedTipInput = z.infer<typeof WeatherBasedTipInputSchema>;

const WeatherBasedTipOutputSchema = z.object({
  tip: z.string().describe("A concise, smart, and actionable tip for the farmer based on the weather and their profile. This should be a single, engaging sentence. E.g., 'Perfect day for banana plantation!' or 'High humidity today, good for your sugarcane crop.'"),
});
export type WeatherBasedTipOutput = z.infer<typeof WeatherBasedTipOutputSchema>;

export async function generateWeatherBasedTip(input: WeatherBasedTipInput): Promise<WeatherBasedTipOutput> {
  return generateWeatherBasedTipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherBasedTipPrompt',
  input: { schema: WeatherBasedTipInputSchema },
  output: { schema: WeatherBasedTipOutputSchema },
  prompt: `You are an expert agronomist. Based on the following weather data and farmer's profile, generate a single, short, and smart tip. The tip should be encouraging and directly relevant to the farmer's context (e.g., their location or primary crops).

Respond in the specified language: {{{language}}}.

Farmer's Profile:
- Location: {{{user.location}}}
- Primary Crops: {{{user.primaryCrops}}}

Weather Data:
- Location: {{{weather.location}}}
- Temperature: {{{weather.temperature}}}°C
- Conditions: {{{weather.description}}}
- Humidity: {{{weather.humidity}}}%
- Wind: {{{weather.windSpeed}}} m/s

Generate the tip.
`,
});

const generateWeatherBasedTipFlow = ai.defineFlow(
  {
    name: 'generateWeatherBasedTipFlow',
    inputSchema: WeatherBasedTipInputSchema,
    outputSchema: WeatherBasedTipOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
