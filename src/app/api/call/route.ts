
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getConversationSummary } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';
import fs from 'fs/promises';
import path from 'path';

const ConversationHistorySchema = z.array(z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
}));
type ConversationHistory = z.infer<typeof ConversationHistorySchema>;


interface ConversationStore {
  history: ConversationHistory;
  language: string;
  from: string | null;
}

// In-memory store for conversation history. In a production app, use a database like Redis or Firestore.
const conversationStore: Record<string, ConversationStore> = {};

const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional().default(''),
  Language: z.string().optional().default('en-IN'), // e.g., "en-IN", "hi-IN"
  CallStatus: z.string().optional(),
  From: z.string().optional(),
  Direction: z.string().optional(),
});

const conversationalPrompt = ai.definePrompt({
    name: 'directPhoneCallConversationalPrompt',
    system: `You are Vyavasaay, a friendly and helpful AI assistant for farmers, speaking on the phone. This is a real-time voice conversation. Your answers must be concise, clear, and easy to understand for a farmer. Your main goal is to answer questions about crops, market prices, government schemes, and weather. When mentioning currency, use the Indian Rupee symbol (₹). Keep your responses short and conversational.`,
});


async function sendSms(to: string, summary: string) {
  const apiKey = process.env.EXOTEL_API_KEY;
  const apiToken = process.env.EXOTEL_API_TOKEN;
  const exotelSid = process.env.EXOTEL_SID;
  const fromNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

  if (!apiKey || !apiToken || !exotelSid || !fromNumber) {
    console.error(`[${to}] Missing Exotel env vars for SMS. Cannot send summary.`);
    return;
  }
  const url = `https://api.exotel.com/v1/Accounts/${exotelSid}/Sms/send.json`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa(`${apiKey}:${apiToken}`), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: fromNumber, To: to, Body: summary }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${to}] Failed to send SMS:`, errorText);
    } else {
      console.log(`[${to}] SMS sent successfully.`);
    }
  } catch (e) {
      console.error(`[${to}] Exception while sending SMS:`, e)
  }
}

async function textToSpeechAndGetUrl(req: NextRequest, callSid: string, text: string): Promise<string> {
    console.log(`[${callSid}] Generating TTS audio for the response.`);
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Achernar' } },
        },
      },
      prompt: text,
    });

    if (!media || !media.url) {
      throw new Error('TTS service returned no media.');
    }

    const pcmData = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavData = await toWav(pcmData);

    const audioDir = path.join(process.cwd(), 'public', 'call_audio');
    await fs.mkdir(audioDir, { recursive: true });

    const fileName = `${callSid}_${Date.now()}.wav`;
    const filePath = path.join(audioDir, fileName);

    console.log(`[${callSid}] Writing WAV file to public directory: ${filePath}`);
    await fs.writeFile(filePath, wavData);

    const publicUrl = `${req.nextUrl.origin}/call_audio/${fileName}`;
    console.log(`[${callSid}] Audio available at public URL: ${publicUrl}`);
    return publicUrl;
}

async function toWav(pcmData: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels: 1,
            sampleRate: 24000,
            bitDepth: 16,
        });
        const chunks: Buffer[] = [];
        writer.on('data', chunk => chunks.push(chunk));
        writer.on('end', () => resolve(Buffer.concat(chunks)));
        writer.on('error', reject);
        writer.write(pcmData);
        writer.end();
    });
}

export async function POST(req: NextRequest) {
  let callSid = 'unknown-sid';
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());

    const parsedBody = exotelWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      callSid = (body.CallSid as string | undefined) || callSid;
      console.error(`[${callSid}] Invalid webhook body:`, parsedBody.error);
      const errorResponse = `<Response><Say>Invalid request.</Say><Hangup/></Response>`;
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/xml' } });
    }

    const { CallSid, SpeechResult, Language, CallStatus, From, Direction } = parsedBody.data;
    callSid = CallSid;

    if (!conversationStore[CallSid]) {
      console.log(`[${CallSid}] Initializing new conversation for caller ${From}. Direction: ${Direction}`);
      conversationStore[CallSid] = { history: [], language: 'English', from: From || null };
    }
    const currentConversation = conversationStore[CallSid];

    if (CallStatus && ['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
      console.log(`[${CallSid}] Call ended with status: ${CallStatus}.`);
      if (currentConversation.history.length > 0 && currentConversation.from) {
        try {
          console.log(`[${CallSid}] Generating and sending SMS summary.`);
          const summary = await getConversationSummary({ conversationHistory: currentConversation.history, language: currentConversation.language });
          await sendSms(currentConversation.from, summary);
        } catch (e) {
          console.error(`[${CallSid}] Failed to generate or send SMS summary:`, e);
        }
      }
      delete conversationStore[CallSid];
      return new NextResponse(`<Response><Hangup/></Response>`, { headers: { 'Content-Type': 'application/xml' } });
    }

    const question = SpeechResult;
    if (!question.trim()) {
      console.log(`[${CallSid}] Empty speech result. Prompting user to speak again.`);
      const gatherUrl = req.nextUrl.href;
      const noInputResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I'm sorry, I did not catch that. Could you please repeat your question?</Say>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="${Language}" />
</Response>`;
      return new NextResponse(noInputResponse, { status: 200, headers: { 'Content-Type': 'application/xml' } });
    }
    
    console.log(`[${CallSid}] User said: "${question}"`);
    currentConversation.history.push({ role: 'user', content: question });
    
    const languageCode = Language.split('-')[0];
    const languageName = (() => {
        const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada' };
        return langMap[languageCode] || 'English';
    })();
    currentConversation.language = languageName;
    
    console.log(`[${CallSid}] Generating text response in ${languageName}.`);
    const { text: answerText } = await conversationalPrompt({ prompt: `Respond in ${languageName}` }, currentConversation.history);

    if (!answerText) {
      throw new Error("AI returned an empty text response.");
    }
    console.log(`[${CallSid}] AI responded with: "${answerText}"`);
    currentConversation.history.push({ role: 'model', content: answerText });

    const answerAudioUrl = await textToSpeechAndGetUrl(req, callSid, answerText);

    const gatherUrl = req.nextUrl.href;
    const exotelResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${answerAudioUrl}</Play>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="${Language}">
    <Say>I'm sorry, I did not catch that. Please repeat your question.</Say>
  </Gather>
</Response>`;
    
    console.log(`[${CallSid}] Sending XML response to Exotel to continue conversation.`);
    return new NextResponse(exotelResponse, { status: 200, headers: { 'Content-Type': 'application/xml' } });

  } catch (error)
 {
    console.error(`[${callSid}] CRITICAL ERROR in POST handler:`, error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">I am sorry, there was a technical issue. Please try calling again later.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(errorTwiml, { status: 200, headers: { 'Content-Type': 'application/xml' } });
  }
}
