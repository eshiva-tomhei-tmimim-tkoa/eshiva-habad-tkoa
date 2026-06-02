import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const cls = (variant: Variant) => `btn btn-${variant}`;

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
    <Link href={href} className={cls(variant)}>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </Link>
  );
}
