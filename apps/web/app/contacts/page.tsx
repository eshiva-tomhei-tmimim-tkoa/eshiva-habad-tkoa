import { PageHeader } from '../../components/PageHeader';
import { ContactForm } from '../../components/ContactForm';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Контакты"
        title="Свяжитесь с нами"
        desc="Ткоа, Гуш-Эцион — около 25 км от Иерусалима."
      />
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
            <div className="eyebrow">Адрес</div>
            <div style={{ marginTop: 4 }}>Tkoa, Gush Etzion, Israel</div>
          </div>
          <div>
            <div className="eyebrow">Телефоны</div>
            <div style={{ marginTop: 4 }}>
              <a href="tel:+972535520466">+972-53-552-0466</a>
              <br />
              <a href="tel:+972555040828">+972-55-504-0828</a>
            </div>
          </div>
          <div>
            <div className="eyebrow">Email</div>
            <div style={{ marginTop: 4 }}>
              <a href="mailto:info@yeshiva-tkoa.org">info@yeshiva-tkoa.org</a>
            </div>
          </div>
          <div>
            <div className="eyebrow">Статус</div>
            <div style={{ marginTop: 4 }}>501(c)(3) — пожертвования tax-deductible</div>
          </div>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
