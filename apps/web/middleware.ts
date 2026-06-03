import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Все пути, кроме API-роутов, статики/_next/файлов.
  matcher: ['/', '/(ru|he|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
