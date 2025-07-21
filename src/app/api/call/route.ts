
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { answerPhoneCallQuestion, getConversationSummaryFlow } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';

const conversationStore: Record<string, { history: any[], language: string, from: string | null }> = {};

const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional(),
  Digits: z.string().optional(),
  Language: z.string().optional().catch(() => 'en-IN'),
  CallStatus: z.string().optional(),
  From: z.string().optional(),
  Direction: z.string().optional(),
});

async function sendSms(to: string, summary: string) {
  const apiKey = process.env.EXOTEL_API_KEY;
  const apiToken = process.env.EXOTEL_API_TOKEN;
  const exotelSid = process.env.EXOTEL_SID;
  const fromNumber = process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER;

  if (!apiKey || !apiToken || !exotelSid || !fromNumber) {
    console.error("Missing Exotel env vars for SMS.");
    return;
  }

  const url = `https://api.exotel.com/v1/Accounts/${exotelSid}/Sms/send.json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${apiKey}:${apiToken}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: to,
      Body: summary,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send SMS:", errorText);
  } else {
    console.log("SMS sent to", to);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());

    console.log("Webhook from Exotel (POST):", body);

    const parsedBody = exotelWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error("Invalid webhook body:", parsedBody.error);
      return new NextResponse(`<Response><Say>Invalid request.</Say><Hangup/></Response>`, {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const { CallSid, SpeechResult, Language, CallStatus, From } = parsedBody.data;

    // Initialize conversation if it's the first time we see this CallSid
    if (!conversationStore[CallSid]) {
      conversationStore[CallSid] = { history: [], language: 'English', from: From || null };
    }

    if (CallStatus && ['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
      if (conversationStore[CallSid]) {
        const { history, language, from: callerNumber } = conversationStore[CallSid];
        if (history.length > 0 && callerNumber) {
            try {
                const summary = await getConversationSummaryFlow({ conversationHistory: history, language });
                await sendSms(callerNumber, summary);
            } catch (e) {
                console.error("Failed to generate or send SMS summary:", e);
            }
        }
        delete conversationStore[CallSid];
      }
      return new NextResponse(`<Response><Hangup/></Response>`, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const bcp47Language = Language || 'en-IN';
    const languageCode = bcp47Language.split('-')[0];
    const languageName = (() => {
      try {
        if (languageCode === 'en') return 'English';
        if (languageCode === 'hi') return 'Hindi';
        if (languageCode === 'mr') return 'Marathi';
        if (languageCode === 'bn') return 'Bengali';
        if (languageCode === 'ta') return 'Tamil';
        if (languageCode === 'te') return 'Telugu';
        if (languageCode === 'kn') return 'Kannada';
        return new Intl.DisplayNames([languageCode], { type: 'language' }).of(languageCode) || 'English';
      } catch {
        return 'English';
      }
    })();
    
    conversationStore[CallSid].language = languageName;

    const currentConversation = conversationStore[CallSid];
    // If there's no SpeechResult, it means the user was silent. We should prompt them again.
    const question = SpeechResult || "Hello";

    currentConversation.history.push({ role: 'user', content: question });

    const { answerAudio, answerText } = await answerPhoneCallQuestion({
      question,
      language: languageName,
      voice: 'Achernar',
      conversationHistory: currentConversation.history,
      callSid: CallSid,
    });

    currentConversation.history.push({ role: 'model', content: answerText });

    const base64Audio = answerAudio.split(',')[1];
    const gatherUrl = req.nextUrl.href;

    const exotelResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>data:audio/wav;base64,${base64Audio}</Play>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="${bcp47Language}">
    <Say>I did not catch that. Please repeat your question.</Say>
  </Gather>
</Response>`;

    return new NextResponse(exotelResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (error) {
    console.error('Error in POST handler:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">I'm sorry, an error occurred on our end. Please try again later.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

