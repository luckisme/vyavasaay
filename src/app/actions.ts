
'use server';

import { z } from 'zod';
import { diagnoseCropFromImage } from '@/ai/flows/diagnose-crop-from-image';
import { answerFarmerQuestion } from '@/ai/flows/answer-farmer-question';
import { summarizeGovernmentScheme } from '@/ai/flows/summarize-government-scheme';
import { getMarketAnalysis } from '@/ai/flows/get-market-analysis';
import type { DiagnoseCropFromImageOutput } from '@/ai/flows/diagnose-crop-from-image';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import type { MarketAnalysisOutput } from '@/ai/flows/get-market-analysis';
import type { UserProfile } from '@/hooks/use-user';

// Define languages directly in the server action file to avoid import issues from client components.
const languages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
    { value: 'mr', label: 'मराठी' },
    { value: 'ta', label: 'தமிழ்' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'bn', label: 'বাংলা' },
    { value: 'kn', label: 'ಕನ್ನಡ' },
];


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
  user: UserProfile,
  languageCode: string
): Promise<{ answer: string; answerAudio?: string; } | { error: string }> {
  if (!question) {
    return { error: 'Question cannot be empty.' };
  }
  try {
    const languageName = languages.find(l => l.value === languageCode)?.label || 'English';
    const result = await answerFarmerQuestion({ 
        question, 
        location: user.location, 
        language: languageName,
        voice: user.voice,
    });
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

// Action for getting weather data
export interface WeatherData {
    temperature: number;
    feelsLike: number;
    description: string;
    iconUrl: string;
    humidity: number;
    windSpeed: number;
    location: string;
}

export async function getWeatherAction(location: string): Promise<WeatherData | { error: string }> {
    if (!location) {
        return { error: 'Location is required.' };
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
        console.error("OpenWeather API key is not set.");
        return { error: 'Server configuration error: Weather service is unavailable.' };
    }
    
    // City name might have a state, e.g., "Nashik, Maharashtra". We'll use the city part.
    const city = location.split(',')[0].trim();

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenWeather API Error:', errorData);
            return { error: `Could not fetch weather for "${city}". Please check the location name.` };
        }
        const data = await response.json();

        return {
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            description: data.weather[0].description,
            iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            location: data.name,
        };
    } catch (e) {
        console.error(e);
        return { error: 'An unexpected error occurred while fetching weather data.' };
    }
}
