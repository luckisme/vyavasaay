'use server';

import { z } from 'zod';
import { diagnoseCropFromImage } from '@/ai/flows/diagnose-crop-from-image';
import { answerFarmerQuestion } from '@/ai/flows/answer-farmer-question';
import { summarizeGovernmentScheme } from '@/ai/flows/summarize-government-scheme';
import type { DiagnoseCropFromImageOutput } from '@/ai/flows/diagnose-crop-from-image';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';

// State for Crop Diagnosis Action
export interface DiagnoseState {
  data: DiagnoseCropFromImageOutput | null;
  error: string | null;
}
export async function diagnoseCropAction(
  prevState: DiagnoseState,
  formData: FormData
): Promise<DiagnoseState> {
  const file = formData.get('photo') as File;
  if (!file || file.size === 0) {
    return { data: null, error: 'Please select an image file.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const photoDataUri = `data:${file.type};base64,${base64}`;

    const result = await diagnoseCropFromImage({ photoDataUri });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'An unexpected error occurred during diagnosis. Please try again.' };
  }
}

// Action for Ask Vyavasay (no form state needed, called directly)
export async function askVyavasayAction(
  question: string,
  location: string,
  language: string
): Promise<{ answer: string } | { error: string }> {
  if (!question) {
    return { error: 'Question cannot be empty.' };
  }
  try {
    const result = await answerFarmerQuestion({ question, location, language });
    return { answer: result.answer };
  } catch (e) {
    console.error(e);
    return { error: 'Sorry, I could not get an answer for that. Please try rephrasing your question.' };
  }
}


// State for Government Scheme Action
export interface SchemeState {
    data: GovernmentSchemeOutput | null;
    error: string | null;
}
const schemeSchema = z.object({
    farmerDetails: z.string().min(10, 'Please provide more details about your farm and needs.'),
    schemeDatabase: z.string().min(1, 'Scheme data is required.'),
});

export async function summarizeSchemesAction(
    prevState: SchemeState,
    formData: FormData
): Promise<SchemeState> {
    const validatedFields = schemeSchema.safeParse({
        farmerDetails: formData.get('farmerDetails'),
        schemeDatabase: formData.get('schemeDatabase'),
    });

    if (!validatedFields.success) {
        return {
            data: null,
            error: validatedFields.error.flatten().fieldErrors.farmerDetails?.[0] || 'Invalid input.'
        }
    }

    try {
        const result = await summarizeGovernmentScheme(validatedFields.data);
        if (!result.relevantSchemes || result.relevantSchemes.length === 0) {
            return { data: null, error: "No relevant schemes found based on the details provided. Try adding more information."}
        }
        return { data: result, error: null };
    } catch (e) {
        console.error(e);
        return { data: null, error: 'An unexpected error occurred while fetching schemes.' };
    }
}
