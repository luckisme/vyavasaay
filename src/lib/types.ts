import type React from 'react';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  audio?: string;
};
