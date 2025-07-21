
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { answerPhoneCallQuestion, getConversationSummaryFlow } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';

const conversationStore: Record<string, { history: any[], language: string, from: string | null }> = {};

const exotelWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional().default(''),
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
    console.error(`[${to}] Missing Exotel env vars for SMS.`);
    return;
  }

  const url = `https://api.exotel.com/v1/Accounts/${exotelSid}/Sms/send.json`;

  try {
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
      console.error(`[${to}] Failed to send SMS:`, errorText);
    } else {
      console.log(`[${to}] SMS sent successfully.`);
    }
  } catch (e) {
      console.error(`[${to}] Exception while sending SMS:`, e)
  }
}

export async function POST(req: NextRequest) {
  let callSid = 'unknown';
  try {
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const body = Object.fromEntries(params.entries());
    callSid = body.CallSid || callSid;

    console.log(`[${callSid}] Received webhook from Exotel:`, body);

    const parsedBody = exotelWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      console.error(`[${callSid}] Invalid webhook body:`, parsedBody.error);
      const errorResponse = `<Response><Say>Invalid request.</Say><Hangup/></Response>`;
      return new NextResponse(errorResponse, { status: 400, headers: { 'Content-Type': 'application/xml' } });
    }

    const { CallSid, SpeechResult, Language, CallStatus, From } = parsedBody.data;

    if (!conversationStore[CallSid]) {
      console.log(`[${CallSid}] Initializing new conversation for caller ${From}.`);
      conversationStore[CallSid] = { history: [], language: 'English', from: From || null };
    }
    const currentConversation = conversationStore[CallSid];

    if (CallStatus && ['completed', 'failed', 'busy', 'no-answer'].includes(CallStatus)) {
      console.log(`[${CallSid}] Call ended with status: ${CallStatus}. Cleaning up.`);
      if (currentConversation.history.length > 0 && currentConversation.from) {
        try {
          console.log(`[${CallSid}] Generating SMS summary.`);
          const summary = await getConversationSummaryFlow({ conversationHistory: currentConversation.history, language: currentConversation.language });
          await sendSms(currentConversation.from, summary);
        } catch (e) {
          console.error(`[${CallSid}] Failed to generate or send SMS summary:`, e);
        }
      }
      delete conversationStore[CallSid];
      return new NextResponse(`<Response><Hangup/></Response>`, { headers: { 'Content-Type': 'application/xml' } });
    }

    if (!SpeechResult.trim()) {
        console.log(`[${CallSid}] Empty speech result. Prompting user to speak.`);
        const gatherUrl = req.nextUrl.href;
        const noInputResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>I'm sorry, I did not catch that. Could you please repeat your question?</Say>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="en-IN" />
</Response>`;
        return new NextResponse(noInputResponse, { status: 200, headers: { 'Content-Type': 'application/xml' } });
    }

    const question = SpeechResult;
    console.log(`[${CallSid}] User said: "${question}"`);
    
    // Don't add to history yet, only after successful AI response
    const bcp47Language = Language || 'en-IN';
    const languageCode = bcp47Language.split('-')[0];
    const languageName = (() => {
        const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada' };
        return langMap[languageCode] || 'English';
    })();
    currentConversation.language = languageName;
    
    console.log(`[${CallSid}] Calling AI flow with language: ${languageName}`);
    
    const { answerAudio, answerText } = await answerPhoneCallQuestion({
      question,
      language: languageName,
      voice: 'Achernar',
      conversationHistory: currentConversation.history,
      callSid: CallSid,
    });
    
    console.log(`[${CallSid}] AI responded with: "${answerText}"`);

    // Add to history *after* successful response
    currentConversation.history.push({ role: 'user', content: question });
    currentConversation.history.push({ role: 'model', content: answerText });

    const base64Audio = answerAudio.split(',')[1];
    const gatherUrl = req.nextUrl.href;

    const exotelResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>data:audio/wav;base64,${base64Audio}</Play>
  <Gather action="${gatherUrl}" method="POST" input="speech" speechTimeout="auto" finishOnKey="#" language="${bcp47Language}">
    <Say>I'm sorry, I did not catch that. Please repeat your question.</Say>
  </Gather>
</Response>`;
    
    console.log(`[${CallSid}] Sending XML response to Exotel.`);
    return new NextResponse(exotelResponse, { status: 200, headers: { 'Content-Type': 'application/xml' } });

  } catch (error) {
    console.error(`[${callSid}] CRITICAL ERROR in POST handler:`, error);
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">I'm sorry, a technical issue occurred. Please try calling again later.</Say>
  <Hangup/>
</Response>`;
    return new NextResponse(errorTwiml, { status: 200, headers: { 'Content-Type': 'application/xml' } });
  }
}
