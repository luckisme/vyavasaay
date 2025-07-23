
'use server';

/**
 * @fileOverview A flow that calculates crop cultivation costs and potential profit based on user input.
 *
 * - calculateCropCosts - A function that handles the cost calculation.
 * - CalculateCropCostsInput - The input type for the calculateCropCosts function.
 * - CropCostCalculationOutput - The return type for the calculateCropCosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CalculateCropCostsInputSchema = z.object({
  userInput: z.string().describe("The farmer's query detailing the crop, land size, input costs, and expected market price."),
  language: z.string().describe('The language for the response.'),
});
export type CalculateCropCostsInput = z.infer<typeof CalculateCropCostsInputSchema>;

const CropCostCalculationOutputSchema = z.object({
    cropName: z.string().describe("The name of the crop being analyzed."),
    area: z.string().describe("The area of land for cultivation, including units (e.g., '1 Acre')."),
    costBreakdown: z.array(z.object({
        item: z.string().describe("The cost item (e.g., 'Seed Cost', 'Fertilizer Cost', 'Labour Cost')."),
        amount: z.number().describe("The cost amount in Rupees (₹).")
    })).describe("A breakdown of the various costs involved."),
    totalCost: z.number().describe("The total calculated cost of cultivation in Rupees (₹)."),
    expectedYield: z.string().describe("The total expected yield from the area, including units (e.g., '1800 kg')."),
    marketPrice: z.string().describe("The expected market price per unit, including currency and unit (e.g., '₹12/kg')."),
    totalRevenue: z.number().describe("The total projected revenue in Rupees (₹), calculated as yield multiplied by market price."),
    estimatedProfit: z.number().describe("The estimated profit in Rupees (₹), calculated as total revenue minus total cost."),
    tip: z.string().describe("A single, short, actionable tip to help the farmer reduce costs or increase profit.")
});
export type CropCostCalculationOutput = z.infer<typeof CropCostCalculationOutputSchema>;

export async function calculateCropCosts(input: CalculateCropCostsInput): Promise<CropCostCalculationOutput> {
  return calculateCropCostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateCropCostsPrompt',
  input: { schema: CalculateCropCostsInputSchema },
  output: { schema: CropCostCalculationOutputSchema },
  prompt: `You are a helpful agricultural assistant. A farmer has provided details about their planned crop cultivation. Your task is to analyze the input, calculate the costs and profits, and present it back in a structured format.

You must identify the following from the user's input:
- Crop name
- Land size
- Individual costs (like seeds, fertilizer, labor, etc.)
- Expected yield
- Expected market price

Perform the following calculations:
1.  **Total Cost**: Sum of all individual costs.
2.  **Total Revenue**: Multiply the expected yield by the market price.
3.  **Estimated Profit**: Subtract the Total Cost from the Total Revenue.

Based on the calculations, provide a single, short, actionable tip to help the farmer reduce costs or increase profit.

Ensure all monetary values are in Indian Rupees (₹) and use local measurement units like acres or bigha if mentioned. The entire response must be in {{{language}}}.

Farmer's Input:
"{{{userInput}}}"
`,
});

const calculateCropCostsFlow = ai.defineFlow(
  {
    name: 'calculateCropCostsFlow',
    inputSchema: CalculateCropCostsInputSchema,
    outputSchema: CropCostCalculationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
