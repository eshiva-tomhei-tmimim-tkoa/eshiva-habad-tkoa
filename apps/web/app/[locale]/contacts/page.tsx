import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { ContactForm } from '@/components/ContactForm';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function ContactsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('contacts');

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section
        className="container-x"
        style={{
          paddingBottom: 64,
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        <div className="card" style={{ padding: 28, display: 'grid', gap: 16, alignContent: 'start' }}>
          <div>
            <div className="eyebrow">{tr('address')}</div>
            <div style={{ marginTop: 4 }}>Tkoa, Gush Etzion, Israel</div>
          </div>
          <div>
            <div className="eyebrow">{tr('phones')}</div>
            <div style={{ marginTop: 4 }}>
              <a href="tel:+972535520466">+972-53-552-0466</a>
              <br />
              <a href="tel:+972555040828">+972-55-504-0828</a>
            </div>
          </div>
          <div>
            <div className="eyebrow">{tr('email')}</div>
            <div style={{ marginTop: 4 }}>
              <a href="mailto:info@yeshiva-tkoa.org">info@yeshiva-tkoa.org</a>
            </div>
          </div>
          <div>
            <div className="eyebrow">{tr('status')}</div>
            <div style={{ marginTop: 4 }}>{tr('statusValue')}</div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
