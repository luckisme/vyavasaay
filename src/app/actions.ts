'use server';

import { z } from 'zod';
import { diagnoseCropFromImage } from '@/ai/flows/diagnose-crop-from-image';
import { answerFarmerQuestion } from '@/ai/flows/answer-farmer-question';
import { summarizeGovernmentScheme } from '@/ai/flows/summarize-government-scheme';
import { getMarketAnalysis } from '@/ai/flows/get-market-analysis';
import type { DiagnoseCropFromImageOutput } from '@/ai/flows/diagnose-crop-from-image';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import type { MarketAnalysisOutput } from '@/ai/flows/get-market-analysis';
import { languages } from './page';

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
  const location = formData.get('location') as string;
  const languageCode = formData.get('language') as string;
  const language = languages.find(l => l.value === languageCode)?.label || 'English';

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

    const result = await diagnoseCropFromImage({ photoDataUri, location, language });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'An unexpected error occurred during diagnosis. Please try again.' };
  }
}

// Action for Ask Vyavasaay (no form state needed, called directly)
export async function askVyavasaayAction(
  question: string,
  location: string,
  language: string
): Promise<{ answer: string; answerAudio?: string; } | { error: string }> {
  if (!question) {
    return { error: 'Question cannot be empty.' };
  }
  try {
    const result = await answerFarmerQuestion({ question, location, language });
    return { answer: result.answer, answerAudio: result.answerAudio };
  } catch (e) {
    console.error(e);
    return { error: 'Sorry, I could not get an answer for that. Please try rephrasing your question.' };
  }
}

// Action for Government Schemes (programmatic call)
export async function summarizeSchemesAction(
    farmerDetails: string,
    language: string
): Promise<GovernmentSchemeOutput> {
    if (!farmerDetails) {
        throw new Error('Farmer details are required.');
    }
    try {
        const result = await summarizeGovernmentScheme({ farmerDetails, language });
        if (!result.relevantSchemes || result.relevantSchemes.length === 0) {
            throw new Error("No relevant schemes found based on the details provided. Try adding more information.");
        }
        return result;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred while fetching schemes.';
        throw new Error(errorMessage);
    }
}


// Action for Market Analysis (programmatic call)
export async function getMarketAnalysisAction(location: string, language: string): Promise<MarketAnalysisOutput> {
    if (!location) {
        throw new Error('Location is required for market analysis.');
    }
    try {
        const result = await getMarketAnalysis({ location, language });
        return result;
    } catch (e) {
        console.error(e);
        throw new Error('An unexpected error occurred while fetching market analysis.');
    }
}
