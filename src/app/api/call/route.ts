
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getConversationSummary } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import wav from 'wav';

type ConversationHistory = { role: 'user' | 'model'; content: string; }[];

interface ConversationStore {
  history: ConversationHistory;
  language: string;
  from: string | null;
}

const conversationStore: Record<string, ConversationStore> = {};

const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional().default(''),
  Language: z.string().optional().default('en-IN'),
  CallStatus: z.string().optional(),
  From: z.string().optional(),
  Direction: z.string().optional(),
});

const conversationalPrompt = ai.definePrompt({
    name: 'directPhoneCallConversationalPrompt',
    system: `You are Vyavasaay, a friendly and helpful AI assistant for farmers, speaking on the phone. This is a voice conversation. Your answers must be concise, clear, and easy to understand. Your main goal is to answer questions about crops, market prices, government schemes, and weather. When mentioning currency, use the Indian Rupee symbol (₹).`,
    input: { schema: z.object({
      language: z.string(),
    })},
    history: { schema: z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })},
});

async function sendSms(to: string, summary: string) {
  const apiKey = process.env.EXOTEL_API_KEY;
  const apiToken = process.env.EXOTEL_API_TOKEN;
  const exotelSid = process.env.EXOTEL_SID;
  const fromNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

  if (!apiKey || !apiToken || !exotelSid || !fromNumber) {
    console.error(`[${to}] Missing Exotel env vars for SMS.`);
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

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', d => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
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

    const { CallSid, SpeechResult, Language, CallStatus, From } = parsedBody.data;
    callSid = CallSid; // Set callSid for logging

    if (!conversationStore[CallSid]) {
      console.log(`[${CallSid}] Initializing new conversation for caller ${From}.`);
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
      console.log(`[${CallSid}] Empty speech result. Prompting user to speak.`);
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
    const { text: answerText } = await conversationalPrompt({ language: languageName }, currentConversation.history);
    if (!answerText) throw new Error("AI returned empty text response.");

    console.log(`[${CallSid}] AI responded with: "${answerText}"`);
    currentConversation.history.push({ role: 'model', content: answerText });

    console.log(`[${CallSid}] Generating TTS audio.`);
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Achernar' } } } },
      prompt: answerText,
    });
    if (!media) throw new Error('TTS service returned no media.');

    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const answerAudioBase64 = await toWav(audioBuffer);

    const gatherUrl = req.nextUrl.href;
    const exotelResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>data:audio/wav;base64,${answerAudioBase64}</Play>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="${Language}">
    <Say>I'm sorry, I did not catch that. Please repeat your question.</Say>
  </Gather>
</Response>`;
    
    console.log(`[${CallSid}] Sending XML response to Exotel.`);
    return new NextResponse(exotelResponse, { status: 200, headers: { 'Content-Type': 'application/xml' } });

  } catch (error) {
    console.error(`[${callSid}] CRITICAL ERROR in POST handler:`, error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">I am sorry, there was a technical issue. Please try calling again later.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(errorTwiml, { status: 200, headers: { 'Content-Type': 'application/xml' } });
  }
}
