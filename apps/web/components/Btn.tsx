import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Btn({
  href,
  children,
  variant = 'primary',
  arrow,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={`btn btn-${variant}`}>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </Link>
  );
}
