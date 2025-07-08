'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Sprout } from 'lucide-react';
import { askVyavasaayAction } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { languages } from '@/app/page';

export default function AskVyavasaay() {
  const { t, language: langCode } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const currentLanguageName = languages.find(l => l.code === langCode)?.value || 'English';
    const result = await askVyavasaayAction(input, 'farmer-location', currentLanguageName);
    
    let assistantMessage: ChatMessage;
    if ('answer' in result) {
      assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
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

  return (
    <Card className="h-[75vh] flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-accent" />
            {t('askVyavasaay.title')}
        </CardTitle>
        <CardDescription>{t('askVyavasaay.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-10">
                    <p>{t('askVyavasaay.initialMessage')}</p>
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
                    'max-w-[75%] rounded-lg p-3 text-sm whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {message.content}
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
            placeholder={t('askVyavasaay.placeholder')}
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
