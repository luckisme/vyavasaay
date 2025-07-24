
'use server';

import { z } from 'zod';
import { diagnoseCropFromImage } from '@/ai/flows/diagnose-crop-from-image';
import { answerFarmerQuestion } from '@/ai/flows/answer-farmer-question';
import { summarizeGovernmentScheme } from '@/ai/flows/summarize-government-scheme';
import { getMarketAnalysis } from '@/ai/flows/get-market-analysis';
import { calculateCropCosts } from '@/ai/flows/calculate-crop-costs';
import { suggestCrops } from '@/ai/flows/suggest-crops';
import { generateWeatherAlert } from '@/ai/flows/generate-weather-alert';
import { generateWeatherBasedTip } from '@/ai/flows/generate-weather-based-tip';
import { getCommonCropIssues } from '@/ai/flows/get-common-crop-issues';
import type { DiagnoseCropFromImageOutput } from '@/ai/flows/diagnose-crop-from-image';
import type { GovernmentSchemeOutput } from '@/ai/flows/summarize-government-scheme';
import type { MarketAnalysisOutput } from '@/lib/types';
import type { CropCostCalculationOutput } from '@/ai/flows/calculate-crop-costs';
import type { CropSuggestionOutput } from '@/ai/flows/suggest-crops';
import type { UserProfile } from '@/hooks/use-user';
import type { WeatherAlertOutput } from '@/ai/flows/generate-weather-alert';
import type { WeatherBasedTipOutput } from '@/ai/flows/generate-weather-based-tip';
import type { CommonCropIssuesOutput } from '@/ai/flows/get-common-crop-issues';

const allLanguages = [
    { value: 'en', label: 'English', short: 'En' },
    { value: 'hi', label: 'हिन्दी', short: 'हि' },
    { value: 'mr', label: 'मराठी', short: 'म' },
    { value: 'ta', label: 'தமிழ்', short: 'த' },
    { value: 'te', label: 'తెలుగు', short: 'తె' },
    { value: 'bn', label: 'বাংলা', short: 'বা' },
    { value: 'kn', label: 'ಕನ್ನಡ', short: 'ಕ' },
];

// State for Crop Diagnosis Action
export interface DiagnoseState {
  data: DiagnoseCropFromImageOutput | null;
  error: string | null;
  loading: boolean;
}
export async function diagnoseCropAction(
  prevState: DiagnoseState,
  formData: FormData
): Promise<DiagnoseState> {
  const file = formData.get('photo') as File;
  const location = formData.get('location') as string;
  const languageCode = formData.get('language') as string;
  const language = allLanguages.find(l => l.value === languageCode)?.label || 'English';

  if (!file || file.size === 0) {
    return { data: null, error: 'Please select an image file.', loading: false };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { data: null, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.', loading: false };
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const photoDataUri = `data:${file.type};base64,${base64}`;

    const result = await diagnoseCropFromImage({ photoDataUri, location, language });
    return { data: result, error: null, loading: false };
  } catch (e) {
    console.error(e);
    return { data: null, error: 'An unexpected error occurred during diagnosis. Please try again.', loading: false };
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
    const languageName = allLanguages.find(l => l.value === languageCode)?.label || 'English';
    const result = await answerFarmerQuestion({ 
        question, 
        location: user.location, 
        language: languageName,
        voice: 'Achernar', // Use female voice by default
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

// Action for Weather Alert Generation
export type WeatherAlert = WeatherAlertOutput;
export async function generateWeatherAlertAction(weatherData: WeatherData, language: string): Promise<WeatherAlert> {
    try {
        const result = await generateWeatherAlert({ weather: weatherData, language });
        return result;
    } catch (e) {
        console.error('Failed to generate weather alert:', e);
        // Return a default, safe alert in case of an AI error
        return { alert: "Check local weather advisories for the latest updates.", severity: "info" };
    }
}

// Action for Weather Based Tip Generation
export type WeatherTip = WeatherBasedTipOutput;
export async function generateWeatherBasedTipAction(weatherData: WeatherData, user: UserProfile, language: string): Promise<WeatherTip> {
    try {
        const result = await generateWeatherBasedTip({ weather: weatherData, user, language });
        return result;
    } catch (e) {
        console.error('Failed to generate weather based tip:', e);
        // Return a default, safe tip in case of an AI error
        return { tip: "Stay updated with the latest weather forecasts for your area." };
    }
}


// Action for Crop Cost Calculator
export interface CalculateCostsState {
    data: CropCostCalculationOutput | null;
    error: string | null;
    loading: boolean;
}

export async function calculateCropCostsAction(
    userInput: string,
    language: string
): Promise<Omit<CalculateCostsState, 'loading'>> {
    if (!userInput.trim()) {
        return { data: null, error: 'Please provide details for calculation.' };
    }
    const languageName = allLanguages.find(l => l.value === language)?.label || 'English';

    try {
        const result = await calculateCropCosts({ userInput, language: languageName });
        return { data: result, error: null };
    } catch (e) {
        console.error(e);
        return { data: null, error: 'Sorry, I could not calculate the costs. Please try rephrasing your input.' };
    }
}

// Action for Crop Selector
export interface SuggestCropsState {
    data: CropSuggestionOutput | null;
    error: string | null;
    loading: boolean;
}
export async function suggestCropsAction(
    userInput: string,
    language: string
): Promise<Omit<SuggestCropsState, 'loading'>> {
    if (!userInput.trim()) {
        return { data: null, error: 'Please provide details for crop suggestion.' };
    }
    const languageName = allLanguages.find(l => l.value === language)?.label || 'English';

    try {
        const result = await suggestCrops({ userInput, language: languageName });
        return { data: result, error: null };
    } catch (e) {
        console.error(e);
        return { data: null, error: 'Sorry, I could not suggest any crops. Please try rephrasing your input.' };
    }
}

// Action for Common Crop Issues
export async function getCommonCropIssuesAction(
    location: string,
    language: string
): Promise<CommonCropIssuesOutput> {
    const languageName = allLanguages.find(l => l.value === language)?.label || 'English';
    const month = new Date().toLocaleString('default', { month: 'long' });
    const season = `Current month is ${month}`;

    try {
        const result = await getCommonCropIssues({ location, season, language: languageName });
        return result;
    } catch (e) {
        console.error(e);
        // Return an empty array on error so the UI doesn't break
        return { issues: [] };
    }
}

// Action for updating user profile
export async function updateUserProfileAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
      const name = formData.get('name') as string;
      const location = formData.get('location') as string;
      const language = formData.get('language') as string;
      const landArea = formData.get('landArea') as string;
      const soilType = formData.get('soilType') as string;
      const primaryCrops = formData.get('primaryCrops') as string;
  
      // Here you would typically save this to a database.
      // For this prototype, we'll just log it to the console.
      console.log("Updating user profile:", {
        name,
        location,
        language,
        landArea,
        soilType,
        primaryCrops
      });
  
      // Simulate a successful update.
      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile." };
    }
  }

