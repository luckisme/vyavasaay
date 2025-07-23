import type React from 'react';
import { z } from 'zod';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  audio?: string;
};

// Market Analysis Types
export const MarketAnalysisInputSchema = z.object({
  location: z.string().describe('The geographical location (e.g., city, state) for the market analysis.'),
  language: z.string().describe('The language for the response.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;


export const MarketAnalysisOutputSchema = z.object({
  marketAlert: z.object({
    title: z.string().describe("The headline for the main market alert (e.g., 'Market Alert')."),
    description: z.string().describe("A concise description of the most significant market event (e.g., 'Wheat prices surge 12% in Maharashtra mandis')."),
  }),
  todaysPrices: z.array(z.object({
    cropName: z.string().describe("The name of the crop (e.g., 'Wheat', 'Rice (Basmati)', 'Cotton')."),
    marketName: z.string().describe("The name of the market or APMC (e.g., 'Pune APMC')."),
    price: z.number().describe("The current price in Rupees (₹)."),
    unit: z.string().describe("The unit for the price (e.g., 'per quintal')."),
    trendPercentage: z.number().describe("The percentage change in price, positive for an increase, negative for a decrease."),
  })).describe("A list of current prices for key crops in the area."),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;