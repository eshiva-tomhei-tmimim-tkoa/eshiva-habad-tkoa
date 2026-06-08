import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/PageHeader';
import { ContactForm } from '@/components/ContactForm';
import { Icon } from '@/components/Icons';
import { getOrganization, t, telHref } from '@/lib/api';
import type { AppLocale } from '@/i18n/routing';

export const revalidate = 300;

export default async function ContactsPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tr = await getTranslations('contacts');
  const org = await getOrganization();
  const address = t(org.address, locale);
  const brandName = t(org.brandName, locale);
  const phones = [org.phoneMain, org.phoneSecondary].filter((p): p is string => Boolean(p));

  return (
    <>
      <PageHeader eyebrow={tr('eyebrow')} title={tr('title')} desc={tr('desc')} />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-card fade-up">
                <div className="contact-card-icon"><Icon.pin /></div>
                <div>
                  <div className="contact-card-l mono">{tr('address')}</div>
                  <div className="contact-card-v">{address}</div>
                  <div className="contact-card-sub">{tr('locationSub')}</div>
                </div>
              </div>

              <div className="contact-card fade-up fade-up-1">
                <div className="contact-card-icon"><Icon.phone /></div>
                <div>
                  <div className="contact-card-l mono">{tr('phones')}</div>
                  {phones.map((phone) => (
                    <div key={phone} className="contact-card-v">
                      <a href={telHref(phone)}>{phone}</a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="contact-card fade-up fade-up-2">
                <div className="contact-card-icon"><Icon.mail /></div>
                <div>
                  <div className="contact-card-l mono">{tr('email')}</div>
                  <div className="contact-card-v">
                    <a href={`mailto:${org.email}`}>{org.email}</a>
                  </div>
                </div>
              </div>

              <div className="contact-card fade-up fade-up-3">
                <div className="contact-card-icon"><Icon.clock /></div>
                <div>
                  <div className="contact-card-l mono">{tr('hours')}</div>
                  <div className="contact-hours">
                    <span>{tr('hoursWeekdays')}</span>
                    <span className="mono">{org.hoursWeekday}</span>
                    <span>{tr('hoursFri')}</span>
                    <span className="contact-off">{t(org.hoursFriday, locale)}</span>
                    <span>{tr('hoursSat')}</span>
                    <span className="contact-off">{t(org.hoursShabbat, locale)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Карта — обозначение места под интерактивную карту */}
            <div className="contact-map fade-up">
              <div className="map-canvas">
                <svg viewBox="0 0 400 360" preserveAspectRatio="none" className="map-svg">
                  <defs>
                    <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="var(--bg-elev-2)" />
                  <rect width="100%" height="100%" fill="url(#map-grid)" />
                  <path d="M0 200 C 100 180, 180 220, 280 180 S 400 200, 400 200" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeDasharray="6 4" />
                  <path d="M200 0 C 180 100, 220 180, 200 360" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" fill="none" />
                  <path d="M50 50 L 350 320" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1.5" fill="none" />
                </svg>
                <div className="map-pin">
                  <div className="map-pin-pulse" />
                  <div className="map-pin-dot"><Icon.pin /></div>
                  <div className="map-pin-label">
                    <strong>{brandName}</strong>
                    <span>{org.mapLat.toFixed(4)}°N, {org.mapLng.toFixed(4)}°E</span>
                  </div>
                </div>
                <div className="map-controls">
                  <span className="map-btn">+</span>
                  <span className="map-btn">−</span>
                </div>
                <div className="map-attribution mono">{address} · {org.mapLat.toFixed(4)}°N, {org.mapLng.toFixed(4)}°E</div>
              </div>
            </div>
          </div>

          <div className="quick-form">
            <div className="quick-form-head">
              <div className="section-eyebrow">{tr('formEyebrow')}</div>
              <h2 className="section-title">{tr('formTitle')}</h2>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
