import { Router } from 'express';
import { contactInputSchema, donationInputSchema, donationConfirmSchema } from '@yeshiva/types';
import { prisma } from '../db.js';
import { sendData, sendError, asyncHandler } from '../lib/respond.js';
import { num, dec, loc, locArray, dayArray, timeHHMM } from '../lib/serialize.js';
import { flattenZod } from '../lib/validate.js';
import { buildDonationUrl, isToremetConfigured } from '../lib/toremet.js';
import { triggerRevalidate } from '../lib/revalidate.js';
import { ensureRates, convertToIls } from '../lib/fx.js';

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
      // В публичном списке — только опубликованные доноры (донор может скрыться).
      prisma.donor.findMany({
        where: { campaignId: campaign.id, isPublic: true },
        orderBy: { donatedAt: 'desc' },
        take: 10,
      }),
      // Счётчик — все доноры кампании (учитывает и скрытых).
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
        currency: d.currency,
        amountIls: d.amountIls != null ? dec(d.amountIls) : null,
        donatedAt: d.donatedAt.toISOString(),
        isAnonymous: d.isAnonymous,
      })),
    });
  }),
);

// GET /api/organization — реквизиты ешивы (singleton).
publicRouter.get(
  '/organization',
  asyncHandler(async (_req, res) => {
    const org = await prisma.organization.findUnique({ where: { id: 1n } });
    if (!org) {
      sendError(res, 404, 'NOT_FOUND', 'Реквизиты ешивы не сконфигурированы');
      return;
    }
    sendData(res, {
      brandName: loc(org.brandName),
      brandSub: org.brandSub,
      yechiText: org.yechiText,
      address: loc(org.address),
      phoneMain: org.phoneMain,
      phoneSecondary: org.phoneSecondary,
      email: org.email,
      mapLat: org.mapLat,
      mapLng: org.mapLng,
      hoursWeekday: org.hoursWeekday,
      hoursFriday: loc(org.hoursFriday),
      hoursShabbat: loc(org.hoursShabbat),
      legalStatus: org.legalStatus,
      copyrightSuffix: loc(org.copyrightSuffix),
      updatedAt: org.updatedAt.toISOString(),
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
      campaignId: num(campaign.id),
    });
    if (!redirectUrl) {
      sendError(res, 503, 'PROVIDER_NOT_CONFIGURED', 'Платёжный провайдер не настроен');
      return;
    }
    sendData(res, { provider: 'israelgives', redirectUrl });
  }),
);

// POST /api/donations/confirm — учёт завершённого пожертвования (после возврата
// с формы IsraelGives). Идемпотентно по externalId (donid): повторный вызов
// (обновление страницы) не задваивает сумму. Донор сам выбирает видимость.
publicRouter.post(
  '/donations/confirm',
  asyncHandler(async (req, res) => {
    const parsed = donationConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Проверьте данные пожертвования', flattenZod(parsed.error));
      return;
    }
    const { campaignId, externalId, amount, currency, name, showInList } = parsed.data;

    const campaign = await prisma.campaign.findUnique({ where: { id: BigInt(campaignId) } });
    if (!campaign) {
      sendError(res, 404, 'NOT_FOUND', 'Кампания не найдена');
      return;
    }

    // Идемпотентность: если запись с таким externalId уже есть — ничего не меняем.
    const existing = await prisma.donor.findUnique({ where: { externalId } });
    if (existing) {
      sendData(res, { id: num(existing.id), recorded: false, duplicate: true });
      return;
    }

    const trimmed = (name ?? '').trim();
    const isAnonymous = !showInList || trimmed.length === 0;

    // Конвертация в шекели: сбор кампании ведётся в ILS.
    await ensureRates();
    const amountIls = convertToIls(amount, currency);
    const ilsValue = amountIls ?? amount; // нет курса → считаем 1:1 (best effort)

    // Транзакция: создать донора и увеличить собранную сумму кампании.
    const donor = await prisma.$transaction(async (tx) => {
      const created = await tx.donor.create({
        data: {
          campaignId: campaign.id,
          name: isAnonymous ? 'Аноним' : trimmed,
          amount,
          currency,
          amountIls,
          donatedAt: new Date(),
          isAnonymous,
          isPublic: showInList,
          provider: 'israelgives',
          externalId,
        },
      });
      await tx.campaign.update({
        where: { id: campaign.id },
        data: { raisedAmount: { increment: ilsValue } },
      });
      return created;
    });

    // Обновить ISR-кэш сайта (страница пожертвований).
    void triggerRevalidate();
    sendData(res, { id: num(donor.id), recorded: true, isPublic: showInList });
  }),
);

// PATCH /api/donations/:externalId/visibility — донор меняет, показывать ли его
// в публичном списке. Ключ — externalId (donid из его ссылки возврата).
publicRouter.patch(
  '/donations/:externalId/visibility',
  asyncHandler(async (req, res) => {
    const showInList = Boolean((req.body as { showInList?: unknown }).showInList);
    const donor = await prisma.donor.findUnique({
      where: { externalId: req.params.externalId },
    });
    if (!donor) {
      sendError(res, 404, 'NOT_FOUND', 'Пожертвование не найдено');
      return;
    }
    await prisma.donor.update({
      where: { id: donor.id },
      // Скрытие → анонимность; имя в записи сохраняется для отчётности.
      data: { isPublic: showInList, isAnonymous: !showInList || donor.name === 'Аноним' },
    });
    void triggerRevalidate();
    sendData(res, { id: num(donor.id), isPublic: showInList });
  }),
);

