import { PageHeader } from '../../components/PageHeader';
import { Btn } from '../../components/Btn';

const LINKS = [
  { href: '/study/daily', title: 'Распорядок дня', desc: 'Структура учебного дня: молитва, учёба, трапеза, спорт.' },
  { href: '/study/curriculum', title: 'Учебная программа', desc: 'Пять дисциплин Торы — от текста к комментариям.' },
  { href: '/study/schedule', title: 'Расписание', desc: 'Когда и где идёт каждое занятие.' },
];

export default function StudyHubPage() {
  return (
    <>
      <PageHeader
        eyebrow="Учебный процесс"
        title="Как устроена учёба в ешиве"
        desc="Сбалансированный день, продуманная программа и понятное расписание."
      />
      <section className="container-x" style={{ paddingBottom: 64 }}>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {LINKS.map((l) => (
            <div key={l.href} className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>{l.title}</h3>
              <p style={{ color: 'var(--text-soft)', marginBottom: 20 }}>{l.desc}</p>
              <Btn href={l.href} variant="ghost" arrow>
                Открыть
              </Btn>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
