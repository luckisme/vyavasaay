
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Sprout, Mic, Pause, Volume2, Send } from 'lucide-react';
import { askVyavasaayAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/hooks/use-user';

const useChatLogic = () => {
  const { t, language: langCode } = useTranslation();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langCode;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInput(finalTranscript + interimTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [langCode]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  }, [isRecording]);

  const playAudio = useCallback((audioDataUri: string, messageId: string) => {
    if (!audioRef.current) return;
    
    if (activeAudioId === messageId && !audioRef.current.paused) {
      audioRef.current.pause();
      setActiveAudioId(null);
    } else {
      if (audioRef.current.src !== audioDataUri) {
        audioRef.current.src = audioDataUri;
      }
      audioRef.current.play();
      setActiveAudioId(messageId);
    }
  }, [activeAudioId]);

  useEffect(() => {
    const currentAudio = audioRef.current;
    const onEnded = () => setActiveAudioId(null);
    const onPause = () => {
        if(audioRef.current?.currentTime === audioRef.current?.duration) {
            setActiveAudioId(null);
        }
    };

    currentAudio?.addEventListener('ended', onEnded);
    currentAudio?.addEventListener('pause', onPause);

    return () => {
      currentAudio?.removeEventListener('ended', onEnded);
      currentAudio?.removeEventListener('pause', onPause);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await askVyavasaayAction(input, user?.location || 'an unspecified location', langCode);
    
    let assistantMessage: ChatMessage;
    if ('answer' in result) {
      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
        audio: result.answerAudio,
      };
    } else {
      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.error || 'An unknown error occurred.',
      };
    }
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  
  return {
    t,
    messages,
    input,
    setInput,
    isLoading,
    isRecording,
    activeAudioId,
    scrollAreaRef,
    audioRef,
    handleMicClick,
    playAudio,
    handleSubmit,
  };
};

export const ChatInterface = ({
    placeholder,
    initialMessage,
    className
} : {
    placeholder: string,
    initialMessage: string,
    className?: string,
}) => {
    const chatLogic = useChatLogic();
    const {
        t,
        messages,
        input,
        setInput,
        isLoading,
        isRecording,
        activeAudioId,
        scrollAreaRef,
        audioRef,
        handleMicClick,
        playAudio,
        handleSubmit,
    } = chatLogic;

    return (
      <>
        <audio ref={audioRef} className="sr-only"/>
        <Card className={cn("flex flex-col h-full", className)}>
            <CardHeader className='flex-row items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <CardTitle className="font-headline text-lg">{t('askVyavasaay.title')}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4 pt-0">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground pt-10">
                        <p>{initialMessage}</p>
                        </div>
                    )}
                    {messages.map((message) => (
                        <div
                        key={message.id}
                        className={cn(
                            'flex items-start gap-3',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {message.role === 'assistant' && (
                            <Avatar className="w-8 h-8 border-2 border-primary">
                            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                                <Sprout className="w-4 h-4 text-primary" />
                            </div>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-[75%] rounded-lg p-3 text-sm flex items-center gap-2',
                            message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                        >
                            <span className="whitespace-pre-wrap">{message.content}</span>
                            {message.role === 'assistant' && message.audio && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => playAudio(message.audio!, message.id)}>
                                {activeAudioId === message.id ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            )}
                        </div>
                        {message.role === 'user' && (
                            <Avatar className="w-8 h-8">
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                        <Avatar className="w-8 h-8 border-2 border-primary">
                            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                            <Sprout className="w-4 h-4 text-primary" />
                            </div>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
                    <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isRecording ? t('askVyavasaay.listening') : placeholder}
                    disabled={isLoading}
                    autoComplete="off"
                    />
                    <Button type="button" size="icon" onClick={handleMicClick} variant={isRecording ? 'destructive' : 'outline'} disabled={isLoading}>
                    <Mic className="w-4 h-4" />
                    </Button>
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="w-4 h-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
      </>
    )
}

// This default export is now unused, but kept to avoid breaking imports if any.
export default function AskVyavasaay() {
  const { t } = useTranslation();
  return (
    <ChatInterface 
        placeholder={t('askVyavasaay.placeholder')}
        initialMessage={t('askVyavasaay.initialMessage')}
    />
  );
}
