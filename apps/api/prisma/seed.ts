/**
 * Сид БД из массивов прототипа (TEAM, STUDENTS, CURRICULUM, DAILY_BLOCKS,
 * SCHEDULE, доноры). Правила переноса — ARCHITECTURE.md §8:
 *  - role людей            → справочник positions + position_id
 *  - tags-предметы         → person_subjects; не-предметные пометки опущены (роль их покрывает)
 *  - profession учеников   → courses + student_courses
 *  - имя наставника (строка)→ students.teacher_id (резолв по people)
 *  - дни SCHEDULE ["Вс"..] → номера [0..] (0=Вс)
 *  - строки времени "08:30"→ TIME
 *
 * Тексты прототипа — только RU; he/en оставлены пустыми (дозаполняются в админке).
 */
import { PrismaClient, DailyCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Localized из одной русской строки. */
const L = (ru: string) => ({ ru, he: '', en: '' });

/** "HH:MM" → Date с этим временем (для колонок TIME). */
const T = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);

/** Русский день → номер (0=Вс … 6=Сб). */
const DAY_NUM: Record<string, number> = { Вс: 0, Пн: 1, Вт: 2, Ср: 3, Чт: 4, Пт: 5, Сб: 6 };

async function main() {
  // Полная очистка в порядке, безопасном для FK.
  await prisma.scheduleSlot.deleteMany();
  await prisma.personSubject.deleteMany();
  await prisma.studentCourse.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.dailyBlock.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.person.deleteMany();
  await prisma.position.deleteMany();
  await prisma.course.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Реквизиты ешивы (organization, singleton) ----------
  await prisma.organization.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      brandName: { ru: 'Ешива ХаБаД Ткоа', he: 'ישיבת חב"ד תקוע', en: 'Yeshiva Chabad Tkoa' },
      brandSub: 'Yeshiva · Tkoa · IL',
      yechiText: 'יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד',
      address: {
        ru: 'Ткоа, Гуш-Эцион, Израиль',
        he: 'תקוע, גוש עציון, ישראל',
        en: 'Tkoa, Gush Etzion, Israel',
      },
      phoneMain: '+972-55-504-0828',
      phoneSecondary: '+972-53-552-0466',
      email: 'info@yeshiva-tkoa.org',
      mapLat: 31.6478,
      mapLng: 35.2148,
      hoursWeekday: '08:00 – 18:00',
      hoursFriday: { ru: 'до 14:00', he: 'עד 14:00', en: 'until 14:00' },
      hoursShabbat: { ru: 'выходной', he: 'שבת', en: 'closed' },
      legalStatus: '501(c)(3)',
      copyrightSuffix: {
        ru: 'Эрец Исроэль · Сделано с заботой',
        he: 'ארץ ישראל · נעשה באהבה',
        en: 'Eretz Israel · Made with care',
      },
    },
  });

  // ---------- Должности (positions) ----------
  const positionTitles = [
    'Рош Ешива',
    'Заместитель Рош Ешивы',
    'Преподаватель',
    'Шалиах',
  ];
  const positions: Record<string, bigint> = {};
  for (let i = 0; i < positionTitles.length; i++) {
    const title = positionTitles[i]!;
    const p = await prisma.position.create({ data: { title: L(title), sortOrder: i } });
    positions[title] = p.id;
  }

  // ---------- Люди (people) ----------
  // subjectCodes ссылаются на предметы ниже; person_subjects заполняем после subjects.
  const peopleData: {
    name: string;
    position: string;
    bio: string;
    subjectCodes: string[];
  }[] = [
    {
      name: 'Рав Реувен Чупин',
      position: 'Рош Ешива',
      bio: 'Возглавляет Ешиву с момента основания. Преподаёт утренний и вечерний хасидус, а также Талмуд.',
      subjectCodes: ['HAS', 'TLM'],
    },
    {
      name: 'Элиезер Иванцов',
      position: 'Заместитель Рош Ешивы',
      bio: 'Помогает в управлении и координации всех учебных программ. Учится на смихе и работает в смежных областях.',
      subjectCodes: [],
    },
    {
      name: 'Рав Арье Каминштейн',
      position: 'Преподаватель',
      bio: 'Ведёт занятия по Талмуду с углублённым разбором комментариев Раши и Тосафот.',
      subjectCodes: ['TLM'],
    },
    {
      name: 'Рав Исроэль Лукашев',
      position: 'Преподаватель',
      bio: 'Готовит учеников к раввинскому посвящению, преподаёт практическую алоху.',
      subjectCodes: ['SMC', 'HAL'],
    },
    {
      name: 'Нохум Мордехай Чупин',
      position: 'Преподаватель',
      bio: 'Преподаёт хасидут, специализируется на учении Любавичского Ребе.',
      subjectCodes: ['HAS'],
    },
    {
      name: 'Егошуа Шолом Лернер',
      position: 'Шалиах',
      bio: 'Преподаёт алоху, помогает в духовной работе с учениками.',
      subjectCodes: ['HAL'],
    },
    {
      name: 'Шломо Ульман',
      position: 'Шалиах',
      bio: 'Ведёт занятия по сихот Ребе. Активный шалиах общины.',
      subjectCodes: ['SIH'],
    },
    {
      name: 'Мойше Довид Смелянский',
      position: 'Шалиах',
      bio: 'Помогает в учебной и духовной работе с учениками.',
      subjectCodes: [],
    },
  ];

  const people: Record<string, bigint> = {};
  for (let i = 0; i < peopleData.length; i++) {
    const pd = peopleData[i]!;
    const person = await prisma.person.create({
      data: {
        name: L(pd.name),
        positionId: positions[pd.position]!,
        bio: L(pd.bio),
        sortOrder: i,
      },
    });
    people[pd.name] = person.id;
  }

  // ---------- Предметы Торы (subjects, бывш. CURRICULUM) ----------
  const subjectsData: {
    code: string;
    title: string;
    lead: string;
    hours: string;
    color: string;
    items: string[];
  }[] = [
    {
      code: 'TLM',
      title: 'Талмуд',
      lead: 'Рав Арье Каминштейн',
      hours: '12 ч / неделя',
      color: 'var(--primary)',
      items: [
        'Изучение простого текста Талмуда',
        'Изучение Талмуда с комментариями Раши и основных Тосафот',
        'Изучение Талмуда с комментариями ришоним и ахроним',
      ],
    },
    {
      code: 'HAL',
      title: 'Алоха',
      lead: 'Егошуа Шолом Лернер',
      hours: '4½ ч / неделя',
      color: 'var(--accent)',
      items: [
        'Шулхан Арух — Орах Хаим',
        'Практическая алоха для повседневной жизни',
        'Алохот шаббат и праздников',
      ],
    },
    {
      code: 'HAS',
      title: 'Хасидут',
      lead: 'Рав Реувен Чупин',
      hours: '8¾ ч / неделя',
      color: 'var(--primary-bright)',
      items: [
        'Утренний хасидус — основы учения Хабада',
        'Вечерний хасидус — углублённое изучение',
        'Танья, Ликутей Тора, маамары Ребе',
      ],
    },
    {
      code: 'SIH',
      title: 'Сихот Ребе',
      lead: 'Шломо Ульман',
      hours: '4½ ч / неделя',
      color: 'var(--success)',
      items: [
        'Изучение бесед Любавичского Ребе',
        'Связь с современностью и Землёй Израиля',
        'Хошен и практические уроки',
      ],
    },
    {
      code: 'SMC',
      title: 'Смиха',
      lead: 'Рав Исроэль Лукашев',
      hours: '1½ ч / неделя',
      color: 'var(--primary)',
      items: [
        'Подготовка к раввинскому посвящению',
        'Йоре Деа — основные алохот',
        'Практика выписки галахических решений',
      ],
    },
  ];

  const subjects: Record<string, bigint> = {};
  for (let i = 0; i < subjectsData.length; i++) {
    const sd = subjectsData[i]!;
    const subject = await prisma.subject.create({
      data: {
        code: sd.code,
        title: L(sd.title),
        hours: sd.hours,
        color: sd.color,
        items: sd.items.map(L),
        leadPersonId: people[sd.lead] ?? null,
        sortOrder: i,
      },
    });
    subjects[sd.code] = subject.id;
  }

  // ---------- person_subjects (кто что преподаёт) ----------
  for (const pd of peopleData) {
    for (const code of pd.subjectCodes) {
      await prisma.personSubject.create({
        data: { personId: people[pd.name]!, subjectId: subjects[code]! },
      });
    }
  }

  // ---------- Курсы (courses) из profession учеников ----------
  const courseTitles = [
    'FullStack Java Developer',
    'UI/UX Designer',
    'Директор магазина',
    'Подготовка в медицинский',
  ];
  const courses: Record<string, bigint> = {};
  for (const title of courseTitles) {
    const c = await prisma.course.create({ data: { title: L(title) } });
    courses[title] = c.id;
  }

  // ---------- Ученики (students) ----------
  const studentsData: {
    name: string;
    quote: string;
    story: string;
    duration: string;
    teacher: string | null; // имя в people или null
    courses: string[];
  }[] = [
    {
      name: 'Элиезер Иванцов',
      quote: 'Тут я нашёл и Тору, и профессию. И настоящих друзей.',
      story:
        'Первую половину дня учит гемору под руководством Рава Каминштейна. Вторую — на смихе от Рава Ярославского. Также учится на курсах по программированию FullStack Java Developer и UI/UX Designer.',
      duration: '3 года',
      teacher: 'Рав Арье Каминштейн',
      courses: ['FullStack Java Developer', 'UI/UX Designer'],
    },
    {
      name: 'Нохум Этинбург',
      quote: 'Хотел уйти в работу, но без Торы — никуда. Возвращаюсь.',
      story:
        'Первую половину дня учит на смихе. Вторую — работает директором магазина нашего ешува во вторую смену. Было предложено возглавить магазин полностью, но он отказался. Поэтому что без Торы не может!',
      duration: '2.5 года',
      teacher: null,
      courses: ['Директор магазина'],
    },
    {
      name: 'Леви Хаимов',
      quote: 'Готовлюсь к экзаменам в медицинский. Готовлю и фалафель.',
      story:
        'Первую половину дня учит гемору с учениками ешивы Штейнзальца. Во вторую — учит на смихе от Рава Ярославского. Готовится к экзаменам в Медицинский. По вечерам готовит фалафель.',
      duration: '4 года',
      teacher: null,
      courses: ['Подготовка в медицинский'],
    },
  ];

  for (let i = 0; i < studentsData.length; i++) {
    const sd = studentsData[i]!;
    const student = await prisma.student.create({
      data: {
        name: L(sd.name),
        quote: L(sd.quote),
        story: L(sd.story),
        duration: sd.duration,
        teacherId: sd.teacher ? (people[sd.teacher] ?? null) : null,
        sortOrder: i,
      },
    });
    for (const courseTitle of sd.courses) {
      await prisma.studentCourse.create({
        data: { studentId: student.id, courseId: courses[courseTitle]! },
      });
    }
  }

  // ---------- Распорядок дня (daily_blocks) ----------
  const dailyBlocks: { time: string; title: string; category: DailyCategory; desc: string }[] = [
    { time: '06:45', title: 'Подъём', category: DailyCategory.personal, desc: 'Начало дня' },
    { time: '07:30', title: 'Миква', category: DailyCategory.spirit, desc: 'Очищение перед молитвой' },
    { time: '08:00', title: 'Утренний хасидус', category: DailyCategory.study, desc: 'Изучение учения Хабада' },
    { time: '08:45', title: 'Молитва "Шахарит"', category: DailyCategory.prayer, desc: 'Утренняя молитва' },
    { time: '09:30', title: 'Завтрак', category: DailyCategory.meal, desc: 'Общая трапеза' },
    { time: '10:20', title: 'Первый седер', category: DailyCategory.study, desc: 'Талмуд — Гемара, Раши, Тосафот' },
    { time: '12:45', title: 'Молитва "Минха"', category: DailyCategory.prayer, desc: 'Дневная молитва' },
    { time: '13:30', title: 'Обед', category: DailyCategory.meal, desc: 'Общая трапеза' },
    { time: '15:00', title: 'Второй седер', category: DailyCategory.study, desc: 'Алоха · Сихот Ребе · Смиха' },
    { time: '18:00', title: 'Спорт / отдых', category: DailyCategory.personal, desc: 'Физическая активность' },
    { time: '19:30', title: 'Ужин', category: DailyCategory.meal, desc: 'Общая трапеза' },
    { time: '20:45', title: 'Вечерний хасидус', category: DailyCategory.study, desc: 'Углублённое изучение' },
    { time: '21:30', title: 'Молитва "Маарив"', category: DailyCategory.prayer, desc: 'Вечерняя молитва' },
    { time: '22:00', title: 'Свободное время', category: DailyCategory.personal, desc: 'Личное изучение, отдых' },
  ];
  for (let i = 0; i < dailyBlocks.length; i++) {
    const b = dailyBlocks[i]!;
    await prisma.dailyBlock.create({
      data: {
        time: T(b.time),
        title: L(b.title),
        category: b.category,
        description: L(b.desc),
        sortOrder: i,
      },
    });
  }

  // ---------- Расписание (schedule_slots) ----------
  const subjectByName: Record<string, string> = {
    'Утренний хасидут': 'HAS',
    'Вечерний хасидут': 'HAS',
    Талмуд: 'TLM',
    Алоха: 'HAL',
    'Сихот Ребе': 'SIH',
    Смиха: 'SMC',
  };
  const teacherByAbbr: Record<string, string> = {
    'Р. Реувен Чупин': 'Рав Реувен Чупин',
    'Р. Арье Каминштейн': 'Рав Арье Каминштейн',
    'Е. Шолом Лернер': 'Егошуа Шолом Лернер',
    'Ш. Ульман': 'Шломо Ульман',
    'Р. Исроэль Лукашев': 'Рав Исроэль Лукашев',
  };
  const scheduleData: {
    subject: string;
    teacher: string;
    days: string[];
    start: string;
    end: string;
  }[] = [
    { subject: 'Утренний хасидут', teacher: 'Р. Реувен Чупин', days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт'], start: '08:00', end: '08:45' },
    { subject: 'Талмуд', teacher: 'Р. Реувен Чупин', days: ['Вс', 'Пн', 'Вт', 'Чт'], start: '10:20', end: '12:45' },
    { subject: 'Талмуд', teacher: 'Р. Реувен Чупин', days: ['Ср'], start: '10:20', end: '11:15' },
    { subject: 'Талмуд', teacher: 'Р. Арье Каминштейн', days: ['Ср'], start: '11:30', end: '12:45' },
    { subject: 'Алоха', teacher: 'Е. Шолом Лернер', days: ['Пн', 'Ср', 'Чт'], start: '15:00', end: '16:30' },
    { subject: 'Сихот Ребе', teacher: 'Ш. Ульман', days: ['Вс', 'Вт'], start: '15:00', end: '16:30' },
    { subject: 'Сихот Ребе', teacher: 'Ш. Ульман', days: ['Пн', 'Ср', 'Чт'], start: '16:30', end: '18:00' },
    { subject: 'Смиха', teacher: 'Р. Исроэль Лукашев', days: ['Вс', 'Вт'], start: '16:35', end: '18:00' },
    { subject: 'Вечерний хасидут', teacher: 'Р. Реувен Чупин', days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт'], start: '20:45', end: '21:30' },
  ];
  for (const s of scheduleData) {
    await prisma.scheduleSlot.create({
      data: {
        subjectId: subjects[subjectByName[s.subject]!]!,
        personId: people[teacherByAbbr[s.teacher]!]!,
        days: s.days.map((d) => DAY_NUM[d]!),
        startTime: T(s.start),
        endTime: T(s.end),
      },
    });
  }

  // ---------- Кампания и доноры ----------
  const campaign = await prisma.campaign.create({
    data: {
      title: L('Кампания 2026'),
      goalAmount: 180000,
      raisedAmount: 16698,
      currency: 'ILS',
      isActive: true,
    },
  });
  const donors: { name: string; amount: number; date: string }[] = [
    { name: 'Ривка Лепик', amount: 300, date: '2026-05-08' },
    { name: 'Аноним', amount: 1800, date: '2026-05-05' },
    { name: 'Мендель Каплан', amount: 540, date: '2026-05-03' },
    { name: 'Сара Б.', amount: 180, date: '2026-05-01' },
    { name: 'Йосеф Шапиро', amount: 360, date: '2026-04-28' },
    { name: 'Аноним', amount: 100, date: '2026-04-26' },
  ];
  for (const d of donors) {
    await prisma.donor.create({
      data: {
        campaignId: campaign.id,
        name: d.name,
        amount: d.amount,
        donatedAt: new Date(d.date),
        isAnonymous: d.name === 'Аноним',
      },
    });
  }

  // ---------- Тексты страниц (site_content) — стартовый набор ----------
  await prisma.siteContent.createMany({
    data: [
      {
        contentKey: 'home.hero.title',
        value: L('Ешива «ХаБаД Ткоа»'),
        pageGroup: 'home',
      },
      {
        contentKey: 'home.hero.subtitle',
        value: L('Тора и хасидут, профессия, иврит и адаптация, опытные наставники.'),
        pageGroup: 'home',
      },
    ],
  });

  // ---------- Пользователь админки ----------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@yeshiva-tkoa.org';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';
  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: 'admin',
    },
  });

  console.log(
    `[seed] готово: ${positionTitles.length} должностей, ${peopleData.length} людей, ` +
      `${subjectsData.length} предметов, ${studentsData.length} учеников, ` +
      `${courseTitles.length} курсов, ${dailyBlocks.length} блоков, ` +
      `${scheduleData.length} слотов, ${donors.length} доноров, admin=${adminEmail}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
