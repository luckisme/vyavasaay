
'use server';
/**
 * @fileOverview A flow that generates a weather alert for farmers based on weather data.
 *
 * - generateWeatherAlert - A function that handles the alert generation.
 * - WeatherAlertInput - The input type for the generateWeatherAlert function.
 * - WeatherAlertOutput - The return type for the generateWeatherAlert function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeatherDataSchema = z.object({
    temperature: z.number().describe('Current temperature in Celsius.'),
    feelsLike: z.number().describe('What the temperature feels like in Celsius.'),
    description: z.string().describe('A brief text description of the weather (e.g., "scattered clouds").'),
    humidity: z.number().describe('Humidity percentage.'),
    windSpeed: z.number().describe('Wind speed in meters per second.'),
    location: z.string().describe('The name of the location.'),
});

const WeatherAlertInputSchema = z.object({
  weather: WeatherDataSchema,
  language: z.string().describe('The language for the response.'),
});
export type WeatherAlertInput = z.infer<typeof WeatherAlertInputSchema>;

const WeatherAlertOutputSchema = z.object({
  alert: z.string().describe("A concise, actionable alert for a farmer based on the weather data. This should be a single sentence."),
  severity: z.enum(['info', 'warning']).describe("The severity of the alert. Use 'warning' for potentially damaging conditions (heavy rain, strong winds, extreme heat/cold) and 'info' for general advice."),
});
export type WeatherAlertOutput = z.infer<typeof WeatherAlertOutputSchema>;

export async function generateWeatherAlert(input: WeatherAlertInput): Promise<WeatherAlertOutput> {
  return generateWeatherAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherAlertPrompt',
  input: { schema: WeatherAlertInputSchema },
  output: { schema: WeatherAlertOutputSchema },
  prompt: `You are an agricultural assistant. Based on the following weather data, generate a concise and actionable alert for a farmer in that location.

The alert should be a single, simple sentence in {{{language}}}.
Determine the severity of the alert. Use 'warning' for conditions that could harm crops or operations, like heavy rain, strong winds (>10 m/s), frost, or extreme heat (>35°C). Otherwise, use 'info'.

Weather Data:
- Location: {{{weather.location}}}
- Temperature: {{{weather.temperature}}}°C (Feels like {{{weather.feelsLike}}}°C)
- Conditions: {{{weather.description}}}
- Humidity: {{{weather.humidity}}}%
- Wind: {{{weather.windSpeed}}} m/s

Generate the alert and severity.`,
});

const generateWeatherAlertFlow = ai.defineFlow(
  {
    name: 'generateWeatherAlertFlow',
    inputSchema: WeatherAlertInputSchema,
    outputSchema: WeatherAlertOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
