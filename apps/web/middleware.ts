import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Все пути, кроме статики/_next/файлов.
  matcher: ['/', '/(ru|he|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
