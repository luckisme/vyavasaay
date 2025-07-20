
import type {Metadata} from 'next';
import { Noto_Sans } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const noto_sans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
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
    <html lang="en" suppressHydrationWarning className={noto_sans.className}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
