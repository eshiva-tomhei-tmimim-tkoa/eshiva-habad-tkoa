import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiGet, t, assetUrl } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { TeamGrid, type TeamCard } from '@/components/TeamGrid';
import type { TeamMember } from '@/lib/dto';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function TeamPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('team');
  const team = await apiGet<TeamMember[]>('/team', []);

  const members: TeamCard[] = team.map((m) => ({
    id: m.id,
    name: t(m.name, locale),
    role: t(m.position.title, locale),
    bio: t(m.bio, locale),
    tags: m.subjects.map((s) => t(s.title, locale)),
    photoUrl: assetUrl(m.photoUrl),
  }));

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <TeamGrid members={members} />
        </div>
      </section>
    </>
  );
}
