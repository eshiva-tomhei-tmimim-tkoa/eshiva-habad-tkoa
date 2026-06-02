import { Manrope, Alef, JetBrains_Mono } from 'next/font/google';

// RU/EN — Manrope; HE — Alef; моно-акцент — JetBrains Mono.
export const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const alef = Alef({
  subsets: ['hebrew'],
  weight: ['400', '700'],
  variable: '--font-alef',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});
