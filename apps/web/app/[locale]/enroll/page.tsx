import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { EnrollForm } from '@/components/EnrollForm';
import type { AppLocale } from '@/i18n/routing';

export default async function EnrollPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('enroll');

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container-narrow">
          <div className="enroll-card fade-up">
            <EnrollForm />
          </div>
          <p className="enroll-note mono">{tr('note')}</p>
        </div>
      </section>
    </>
  );
}
