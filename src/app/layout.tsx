
import type {Metadata} from 'next';
import { Roboto } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppAuthProvider } from '@/hooks/use-auth';

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'Vyavasaay',
  description: 'AI-powered assistant for farmers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.className}>
      <body>
        <AppAuthProvider>
          {children}
          <Toaster />
        </AppAuthProvider>
      </body>
    </html>
  );
}
