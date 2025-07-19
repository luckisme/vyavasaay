
import { NextRequest, NextResponse } from 'next/server';
import { answerPhoneCallQuestion, getConversationSummaryFlow } from '@/ai/flows/answer-phone-call-question';
import { z } from 'zod';

// This is a simple in-memory store for prototyping. 
// In a production app, you would use a database like Firestore or Redis.
const conversationStore: Record<string, { history: any[], language: string }> = {};


const twilioWebhookSchema = z.object({
  CallSid: z.string(),
  SpeechResult: z.string().optional(),
  Language: z.string().optional(),
  CallStatus: z.string().optional(),
  From: z.string().optional(),
});

// This function sends an SMS using Exotel's API.
// IMPORTANT: You need to add EXOTEL_API_KEY and EXOTEL_API_TOKEN to your Vercel environment variables.
async function sendSms(to: string, summary: string) {
    const apiKey = process.env.EXOTEL_API_KEY;
    const apiToken = process.env.EXOTEL_API_TOKEN;
    const exotelSid = process.env.EXOTEL_SID;

    if (!apiKey || !apiToken || !exotelSid) {
        console.error("Exotel credentials are not set in environment variables.");
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
            From: process.env.NEXT_PUBLIC_OFFLINE_CALL_NUMBER!,
            To: to,
            Body: summary,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to send SMS:", errorText);
    } else {
        console.log("SMS sent successfully to", to);
    }
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());
    
    const parsedBody = twilioWebhookSchema.safeParse(body);
    if (!parsedBody.success) {
      return new NextResponse('Invalid request body', { status: 400 });
    }

    const { CallSid, SpeechResult, Language, CallStatus, From } = parsedBody.data;

    // If the call is completed, we generate and send the SMS summary.
    if (CallStatus === 'completed' || CallStatus === 'failed') {
        if (conversationStore[CallSid] && From) {
            const { history, language } = conversationStore[CallSid];
            const summary = await getConversationSummaryFlow({ conversationHistory: history, language });
            await sendSms(From, summary);
            delete conversationStore[CallSid]; // Clean up memory
        }
        return new NextResponse('<Response><Hangup/></Response>', { headers: { 'Content-Type': 'application/xml' } });
    }

    const question = SpeechResult;
    const bcp47Language = Language || 'en-IN'; 
    const languageName = new Intl.DisplayNames([bcp47Language.split('-')[0]], { type: 'language' }).of(bcp47Language.split('-')[0])!;
    
    if (!conversationStore[CallSid]) {
      conversationStore[CallSid] = { history: [], language: languageName };
    }
    
    const currentHistory = conversationStore[CallSid].history;
    
    if(question) {
        currentHistory.push({ role: 'user', content: question });
    }

    const { answerAudio, answerText } = await answerPhoneCallQuestion({
      question: question || "Hello, please introduce yourself.",
      language: languageName,
      voice: 'Achernar',
      conversationHistory: currentHistory,
      callSid: CallSid,
    });
    
    currentHistory.push({ role: 'model', content: answerText });
    
    const base64Audio = answerAudio.split(',')[1];
    const gatherUrl = req.nextUrl.clone();

    // The TwiML response to play the audio and then immediately listen for the next input.
    // The <Redirect> makes the conversation loop back to this same API endpoint.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Play>data:audio/wav;base64,${base64Audio}</Play>
    <Gather input="speech" action="${gatherUrl.href}" speechTimeout="auto" method="POST">
        <SpeechModel model="phone_call" enhanced="true"/>
    </Gather>
    <Redirect method="POST">${gatherUrl.href}</Redirect>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (error) {
    console.error('Error processing call:', error);
    const errorMessage = "I'm sorry, I encountered an error. Please try again later.";
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${errorMessage}</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
