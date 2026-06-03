import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Локаль-осознанные обёртки навигации (добавляют префикс he/en автоматически).
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
