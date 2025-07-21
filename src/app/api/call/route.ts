import { NextRequest, NextResponse } from 'next/server';
import { answerPhoneCallQuestion, getConversationSummaryFlow } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';

const conversationStore: Record<string, { history: any[], language: string, from: string | null }> = {};

const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional(),
  Digits: z.string().optional(),
  Language: z.string().optional(),
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
    console.error("Missing Exotel env vars.");
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
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    console.log("Webhook from Exotel:", body);

    const parsedBody = exotelWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error("Invalid webhook body:", parsedBody.error);
      return new NextResponse(`<Response><Say>Invalid request.</Say><Hangup/></Response>`, {
        status: 400,
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    const { CallSid, SpeechResult, Language, CallStatus, From } = parsedBody.data;

    if (CallStatus && ['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
      if (conversationStore[CallSid]) {
        const { history, language, from: callerNumber } = conversationStore[CallSid];
        if (history.length > 1 && callerNumber) {
          const summary = await getConversationSummaryFlow({ conversationHistory: history, language });
          await sendSms(callerNumber, summary);
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
        return new Intl.DisplayNames([languageCode], { type: 'language' }).of(languageCode) || 'English';
      } catch {
        return 'English';
      }
    })();

    if (!conversationStore[CallSid]) {
      conversationStore[CallSid] = { history: [], language: languageName, from: From || null };
    }

    const currentConversation = conversationStore[CallSid];
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
    <Say>You can ask another question now.</Say>
  </Gather>
</Response>`;

    return new NextResponse(exotelResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (error) {
    console.error('Error:', error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">I'm sorry, we encountered an error. Please try again later.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

export async function GET(req: NextRequest) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">Welcome to Vyavasaay! Please say something after the beep.</Say>
  <Gather action="${req.nextUrl.href}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#">
    <Say>I did not catch that. Can you please repeat?</Say>
  </Gather>
</Response>`;

  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}
