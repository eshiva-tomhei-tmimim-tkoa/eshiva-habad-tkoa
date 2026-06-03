import { Router } from 'express';
import { contactInputSchema, donationInputSchema } from '@yeshiva/types';
import { prisma } from '../db.js';
import { sendData, sendError, asyncHandler } from '../lib/respond.js';
import { num, dec, loc, locArray, dayArray, timeHHMM } from '../lib/serialize.js';
import { flattenZod } from '../lib/validate.js';
import { buildDonationUrl, isToremetConfigured } from '../lib/toremet.js';

export const publicRouter: Router = Router();

// GET /api/team — люди (опубликованные) + должность + предметы.
publicRouter.get(
  '/team',
  asyncHandler(async (_req, res) => {
    const people = await prisma.person.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        position: true,
        subjects: { include: { subject: true } },
      },
    });
    const data = people.map((p) => ({
      id: num(p.id),
      name: loc(p.name),
      bio: loc(p.bio),
      photoUrl: p.photoUrl,
      sortOrder: p.sortOrder,
      position: { id: num(p.position.id), title: loc(p.position.title) },
      subjects: p.subjects.map((ps) => ({
        id: num(ps.subject.id),
        code: ps.subject.code,
        title: loc(ps.subject.title),
      })),
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/positions — справочник должностей.
publicRouter.get(
  '/positions',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.position.findMany({ orderBy: { sortOrder: 'asc' } });
    const data = rows.map((r) => ({
      id: num(r.id),
      title: loc(r.title),
      sortOrder: r.sortOrder,
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/subjects — предметы Торы + ведущий.
publicRouter.get(
  '/subjects',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.subject.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { leadPerson: true },
    });
    const data = rows.map((r) => ({
      id: num(r.id),
      code: r.code,
      title: loc(r.title),
      hours: r.hours,
      color: r.color,
      items: locArray(r.items),
      sortOrder: r.sortOrder,
      leadPerson: r.leadPerson ? { id: num(r.leadPerson.id), name: loc(r.leadPerson.name) } : null,
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/courses — профессиональные курсы.
publicRouter.get(
  '/courses',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.course.findMany({ where: { isPublished: true } });
    const data = rows.map((r) => ({
      id: num(r.id),
      title: loc(r.title),
      description: r.description ? loc(r.description) : null,
      provider: r.provider,
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/daily — блоки распорядка дня.
publicRouter.get(
  '/daily',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.dailyBlock.findMany({ orderBy: { sortOrder: 'asc' } });
    const data = rows.map((r) => ({
      id: num(r.id),
      time: timeHHMM(r.time),
      title: loc(r.title),
      category: r.category,
      description: loc(r.description),
      sortOrder: r.sortOrder,
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/schedule — расписание + subject/person. Фильтры: ?day, ?person_id, ?subject_id.
publicRouter.get(
  '/schedule',
  asyncHandler(async (req, res) => {
    const personId = req.query.person_id ? BigInt(String(req.query.person_id)) : undefined;
    const subjectId = req.query.subject_id ? BigInt(String(req.query.subject_id)) : undefined;
    const dayRaw = req.query.day;
    const day = dayRaw !== undefined ? Number(dayRaw) : undefined;

    const rows = await prisma.scheduleSlot.findMany({
      where: {
        ...(personId !== undefined ? { personId } : {}),
        ...(subjectId !== undefined ? { subjectId } : {}),
      },
      orderBy: { startTime: 'asc' },
      include: { subject: true, person: true },
    });

    const data = rows
      .map((r) => ({
        id: num(r.id),
        days: dayArray(r.days),
        startTime: timeHHMM(r.startTime),
        endTime: timeHHMM(r.endTime),
        subject: {
          id: num(r.subject.id),
          code: r.subject.code,
          title: loc(r.subject.title),
          color: r.subject.color,
        },
        person: { id: num(r.person.id), name: loc(r.person.name) },
      }))
      .filter((slot) => day === undefined || Number.isNaN(day) || slot.days.includes(day));

    sendData(res, data, { count: data.length });
  }),
);

// GET /api/students — истории учеников + наставник + курсы.
publicRouter.get(
  '/students',
  asyncHandler(async (_req, res) => {
    const rows = await prisma.student.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      include: { teacher: true, courses: { include: { course: true } } },
    });
    const data = rows.map((r) => ({
      id: num(r.id),
      name: loc(r.name),
      quote: loc(r.quote),
      story: loc(r.story),
      duration: r.duration,
      photoUrl: r.photoUrl,
      sortOrder: r.sortOrder,
      teacher: r.teacher ? { id: num(r.teacher.id), name: loc(r.teacher.name) } : null,
      courses: r.courses.map((sc) => ({ id: num(sc.course.id), title: loc(sc.course.title) })),
    }));
    sendData(res, data, { count: data.length });
  }),
);

// GET /api/campaign — активная кампания + последние доноры.
publicRouter.get(
  '/campaign',
  asyncHandler(async (_req, res) => {
    const campaign = await prisma.campaign.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!campaign) {
      sendData(res, null);
      return;
    }
    const [donors, donorsCount] = await Promise.all([
      prisma.donor.findMany({
        where: { campaignId: campaign.id },
        orderBy: { donatedAt: 'desc' },
        take: 10,
      }),
      prisma.donor.count({ where: { campaignId: campaign.id } }),
    ]);
    sendData(res, {
      id: num(campaign.id),
      title: loc(campaign.title),
      goalAmount: dec(campaign.goalAmount),
      raisedAmount: dec(campaign.raisedAmount),
      currency: campaign.currency,
      endsAt: campaign.endsAt ? campaign.endsAt.toISOString() : null,
      donorsCount,
      donors: donors.map((d) => ({
        id: num(d.id),
        name: d.isAnonymous ? 'Аноним' : d.name,
        amount: dec(d.amount),
        donatedAt: d.donatedAt.toISOString(),
        isAnonymous: d.isAnonymous,
      })),
    });
  }),
);

// GET /api/content/:group — тексты страницы как { key: Localized }.
publicRouter.get(
  '/content/:group',
  asyncHandler(async (req, res) => {
    const rows = await prisma.siteContent.findMany({
      where: { pageGroup: req.params.group },
    });
    const data: Record<string, unknown> = {};
    for (const r of rows) data[r.contentKey] = loc(r.value);
    sendData(res, data, { count: rows.length });
  }),
);

// POST /api/contact — приём формы контактов.
publicRouter.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const parsed = contactInputSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Проверьте поля формы', flattenZod(parsed.error));
      return;
    }
    const msg = await prisma.contactMessage.create({ data: parsed.data });
    sendData(res, { id: num(msg.id), createdAt: msg.createdAt.toISOString() });
  }),
);

// POST /api/donations — построить ссылку на оплату Israel Toremet / IsraelGives.
publicRouter.post(
  '/donations',
  asyncHandler(async (req, res) => {
    const parsed = donationInputSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Проверьте параметры пожертвования', flattenZod(parsed.error));
      return;
    }
    if (!isToremetConfigured()) {
      sendError(res, 503, 'PROVIDER_NOT_CONFIGURED', 'Платёжный провайдер не настроен');
      return;
    }
    const campaign = await prisma.campaign.findUnique({
      where: { id: BigInt(parsed.data.campaignId) },
    });
    if (!campaign) {
      sendError(res, 404, 'NOT_FOUND', 'Кампания не найдена');
      return;
    }
    const localeRaw = String((req.body as { locale?: string }).locale ?? 'ru');
    const locale = (['ru', 'he', 'en'].includes(localeRaw) ? localeRaw : 'ru') as
      | 'ru'
      | 'he'
      | 'en';
    const redirectUrl = buildDonationUrl({
      amount: parsed.data.amount,
      currency: campaign.currency,
      recurring: parsed.data.recurring,
      locale,
    });
    if (!redirectUrl) {
      sendError(res, 503, 'PROVIDER_NOT_CONFIGURED', 'Платёжный провайдер не настроен');
      return;
    }
    sendData(res, { provider: 'israelgives', redirectUrl });
  }),
);

