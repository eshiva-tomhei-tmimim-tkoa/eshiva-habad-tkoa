import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { Icon } from './Icons';

type Variant = 'primary' | 'secondary' | 'ghost';

export function Btn({
  href,
  children,
  variant = 'primary',
  arrow,
  icon,
  className = '',
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  /** Стрелка-иконка справа (анимируется при наведении). */
  arrow?: boolean;
  /** Произвольная иконка справа (имеет приоритет над arrow). */
  icon?: ReactNode;
  className?: string;
}) {
  const tail = icon ?? (arrow ? <Icon.arrow /> : null);
  return (
    <Link href={href} className={`btn btn-${variant} ${className}`.trim()}>
      <span>{children}</span>
      {tail && <span className="btn-arrow">{tail}</span>}
    </Link>
  );
}
