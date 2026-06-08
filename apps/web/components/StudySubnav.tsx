import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Icon } from './Icons';

type StudySection = 'hub' | 'daily' | 'curriculum' | 'schedule';

const ITEMS: { key: StudySection; href: string }[] = [
  { key: 'hub', href: '/study' },
  { key: 'daily', href: '/study/daily' },
  { key: 'curriculum', href: '/study/curriculum' },
  { key: 'schedule', href: '/study/schedule' },
];

/** Подменю раздела «Учёба»: возврат к обзору + переходы между подразделами. */
export async function StudySubnav({ active }: { active: StudySection }) {
  const tr = await getTranslations('study');
  const label: Record<StudySection, string> = {
    hub: tr('subnavHub'),
    daily: tr('dailyTitle'),
    curriculum: tr('curriculumTitle'),
    schedule: tr('scheduleTitle'),
  };

  return (
    <div className="study-subnav fade-up">
      <Link href="/study" className="study-subnav-back">
        <Icon.arrowLeft />
        <span>{tr('subnavBack')}</span>
      </Link>
      <nav className="study-subnav-tabs" aria-label={tr('eyebrow')}>
        {ITEMS.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className={`study-subnav-tab ${active === it.key ? 'active' : ''}`}
            aria-current={active === it.key ? 'page' : undefined}
          >
            {label[it.key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
