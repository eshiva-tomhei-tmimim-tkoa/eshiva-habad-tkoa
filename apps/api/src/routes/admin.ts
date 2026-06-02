import { Router } from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import type { ZodTypeAny } from 'zod';
import {
  personInputSchema,
  subjectInputSchema,
  studentInputSchema,
  scheduleSlotInputSchema,
  positionInputSchema,
  courseInputSchema,
  dailyBlockInputSchema,
  siteContentInputSchema,
  donorInputSchema,
  campaignInputSchema,
  reorderSchema,
  idSetSchema,
} from '@yeshiva/types';
import { prisma } from '../db.js';
import { sendData, sendError, asyncHandler } from '../lib/respond.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { flattenZod } from '../lib/validate.js';
import { num, dec, loc, locArray, dayArray, timeHHMM } from '../lib/serialize.js';

export const adminRouter: Router = Router();

// Все админские роуты — только под авторизацией.
adminRouter.use(requireAuth);

// GET /api/admin/me — текущий пользователь (ARCHITECTURE §3.2).
adminRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: BigInt(req.user!.sub) } });
    if (!user) {
      sendError(res, 404, 'NOT_FOUND', 'Пользователь не найден');
      return;
    }
    sendData(res, {
      id: num(user.id),
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    });
  }),
);

/** "HH:MM" → Date для колонок TIME (UTC, дата-плейсхолдер 1970-01-01). */
const toTime = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00.000Z`);

// ---------------------------------------------------------------------------
// Универсальная CRUD-фабрика поверх Prisma-делегата.
// model — делегат (prisma.person и т.п.); конкретная типизация делегатов
// несовместима между собой, поэтому используем минимальный структурный тип.
// ---------------------------------------------------------------------------
interface PrismaDelegate {
  findMany: (args?: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
}

interface CrudOptions {
  model: PrismaDelegate;
  createSchema: ZodTypeAny;
  updateSchema?: ZodTypeAny;
  /** Преобразование валидированного ввода в data для Prisma (create/update). */
  toData: (input: Record<string, unknown>) => Record<string, unknown>;
  /** Преобразование строки БД в DTO ответа. */
  toDto: (row: Record<string, unknown>) => unknown;
  /** Опции findMany (include/orderBy). */
  findManyArgs?: Record<string, unknown>;
  /** Опции findUnique (include). */
  findUniqueArgs?: Record<string, unknown>;
  /** Поддерживает ли сущность reorder (sort_order). */
  reorderModel?: 'person' | 'subject' | 'student' | 'position' | 'dailyBlock';
}

function crud(opts: CrudOptions): Router {
  const r = Router();
  const updateSchema = opts.updateSchema ?? opts.createSchema;

  // LIST (вкл. черновики)
  r.get(
    '/',
    asyncHandler(async (_req, res) => {
      const rows = (await opts.model.findMany(opts.findManyArgs)) as Record<string, unknown>[];
      const data = rows.map(opts.toDto);
      sendData(res, data, { count: data.length });
    }),
  );

  // REORDER (до /:id, иначе перехватится как id)
  if (opts.reorderModel) {
    r.patch(
      '/reorder',
      asyncHandler(async (req, res) => {
        const parsed = reorderSchema.safeParse(req.body);
        if (!parsed.success) {
          sendError(res, 422, 'VALIDATION', 'Некорректный список', flattenZod(parsed.error));
          return;
        }
        await prisma.$transaction(
          parsed.data.items.map((it) =>
            // @ts-expect-error — динамический выбор делегата по имени модели
            prisma[opts.reorderModel].update({
              where: { id: BigInt(it.id) },
              data: { sortOrder: it.sortOrder },
            }),
          ),
        );
        sendData(res, { ok: true, count: parsed.data.items.length });
      }),
    );
  }

  // GET ONE
  r.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const row = (await opts.model.findUnique({
        where: { id: BigInt(req.params.id!) },
        ...(opts.findUniqueArgs ?? {}),
      })) as Record<string, unknown> | null;
      if (!row) {
        sendError(res, 404, 'NOT_FOUND', 'Элемент не найден');
        return;
      }
      sendData(res, opts.toDto(row));
    }),
  );

  // CREATE
  r.post(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = opts.createSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 422, 'VALIDATION', 'Проверьте поля', flattenZod(parsed.error));
        return;
      }
      const row = (await opts.model.create({
        data: opts.toData(parsed.data as Record<string, unknown>),
        ...(opts.findUniqueArgs ?? {}),
      })) as Record<string, unknown>;
      sendData(res, opts.toDto(row));
    }),
  );

  // UPDATE
  r.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 422, 'VALIDATION', 'Проверьте поля', flattenZod(parsed.error));
        return;
      }
      const row = (await opts.model.update({
        where: { id: BigInt(req.params.id!) },
        data: opts.toData(parsed.data as Record<string, unknown>),
        ...(opts.findUniqueArgs ?? {}),
      })) as Record<string, unknown>;
      sendData(res, opts.toDto(row));
    }),
  );

  // DELETE
  r.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await opts.model.delete({ where: { id: BigInt(req.params.id!) } });
      sendData(res, { ok: true });
    }),
  );

  return r;
}

// ---------------------------------------------------------------------------
// Сущности
// ---------------------------------------------------------------------------

// positions
adminRouter.use(
  '/positions',
  crud({
    model: prisma.position as unknown as PrismaDelegate,
    createSchema: positionInputSchema,
    findManyArgs: { orderBy: { sortOrder: 'asc' } },
    reorderModel: 'position',
    toData: (i) => ({ title: i.title, sortOrder: i.sortOrder ?? 0 }),
    toDto: (r) => ({ id: num(r.id as bigint), title: loc(r.title as never), sortOrder: r.sortOrder }),
  }),
);

// courses
adminRouter.use(
  '/courses',
  crud({
    model: prisma.course as unknown as PrismaDelegate,
    createSchema: courseInputSchema,
    toData: (i) => ({
      title: i.title,
      description: i.description ?? null,
      provider: i.provider ?? null,
      isPublished: i.isPublished ?? true,
    }),
    toDto: (r) => ({
      id: num(r.id as bigint),
      title: loc(r.title as never),
      description: r.description ? loc(r.description as never) : null,
      provider: r.provider ?? null,
      isPublished: r.isPublished,
    }),
  }),
);

// daily (блоки распорядка)
adminRouter.use(
  '/daily',
  crud({
    model: prisma.dailyBlock as unknown as PrismaDelegate,
    createSchema: dailyBlockInputSchema,
    findManyArgs: { orderBy: { sortOrder: 'asc' } },
    reorderModel: 'dailyBlock',
    toData: (i) => ({
      time: toTime(i.time as string),
      title: i.title,
      category: i.category,
      description: i.description,
      sortOrder: i.sortOrder ?? 0,
    }),
    toDto: (r) => ({
      id: num(r.id as bigint),
      time: timeHHMM(r.time as Date),
      title: loc(r.title as never),
      category: r.category,
      description: loc(r.description as never),
      sortOrder: r.sortOrder,
    }),
  }),
);

// content (site_content)
adminRouter.use(
  '/content',
  crud({
    model: prisma.siteContent as unknown as PrismaDelegate,
    createSchema: siteContentInputSchema,
    findManyArgs: { orderBy: { pageGroup: 'asc' } },
    toData: (i) => ({ contentKey: i.contentKey, value: i.value, pageGroup: i.pageGroup }),
    toDto: (r) => ({
      id: num(r.id as bigint),
      contentKey: r.contentKey,
      value: loc(r.value as never),
      pageGroup: r.pageGroup,
    }),
  }),
);

// donors
adminRouter.use(
  '/donors',
  crud({
    model: prisma.donor as unknown as PrismaDelegate,
    createSchema: donorInputSchema,
    findManyArgs: { orderBy: { donatedAt: 'desc' } },
    toData: (i) => ({
      campaignId: BigInt(i.campaignId as number),
      name: i.name,
      amount: i.amount,
      donatedAt: new Date(i.donatedAt as string),
      isAnonymous: i.isAnonymous ?? false,
    }),
    toDto: (r) => ({
      id: num(r.id as bigint),
      campaignId: num(r.campaignId as bigint),
      name: r.name,
      amount: dec(r.amount as never),
      donatedAt: (r.donatedAt as Date).toISOString(),
      isAnonymous: r.isAnonymous,
    }),
  }),
);

// subjects (предметы Торы)
adminRouter.use(
  '/subjects',
  crud({
    model: prisma.subject as unknown as PrismaDelegate,
    createSchema: subjectInputSchema,
    findManyArgs: { orderBy: { sortOrder: 'asc' }, include: { leadPerson: true } },
    findUniqueArgs: { include: { leadPerson: true } },
    reorderModel: 'subject',
    toData: (i) => ({
      code: i.code,
      title: i.title,
      hours: i.hours,
      color: i.color,
      items: i.items ?? [],
      leadPersonId: i.leadPersonId ? BigInt(i.leadPersonId as number) : null,
      sortOrder: i.sortOrder ?? 0,
      isPublished: i.isPublished ?? true,
    }),
    toDto: (r) => {
      const lead = r.leadPerson as { id: bigint; name: never } | null;
      return {
        id: num(r.id as bigint),
        code: r.code,
        title: loc(r.title as never),
        hours: r.hours,
        color: r.color,
        items: locArray(r.items as never),
        leadPerson: lead ? { id: num(lead.id), name: loc(lead.name) } : null,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
      };
    },
  }),
);

// team → people (без subjectIds в toData; набор предметов задаётся отдельным роутом)
adminRouter.use(
  '/team',
  crud({
    model: prisma.person as unknown as PrismaDelegate,
    createSchema: personInputSchema,
    findManyArgs: {
      orderBy: { sortOrder: 'asc' },
      include: { position: true, subjects: { include: { subject: true } } },
    },
    findUniqueArgs: { include: { position: true, subjects: { include: { subject: true } } } },
    reorderModel: 'person',
    toData: (i) => ({
      name: i.name,
      positionId: BigInt(i.positionId as number),
      bio: i.bio,
      photoUrl: i.photoUrl ?? null,
      sortOrder: i.sortOrder ?? 0,
      isPublished: i.isPublished ?? true,
    }),
    toDto: (r) => {
      const position = r.position as { id: bigint; title: never };
      const subjects = (r.subjects as { subject: { id: bigint; code: string; title: never } }[]) ?? [];
      return {
        id: num(r.id as bigint),
        name: loc(r.name as never),
        bio: loc(r.bio as never),
        photoUrl: r.photoUrl ?? null,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
        position: { id: num(position.id), title: loc(position.title) },
        subjects: subjects.map((ps) => ({
          id: num(ps.subject.id),
          code: ps.subject.code,
          title: loc(ps.subject.title),
        })),
      };
    },
  }),
);

// students
adminRouter.use(
  '/students',
  crud({
    model: prisma.student as unknown as PrismaDelegate,
    createSchema: studentInputSchema,
    findManyArgs: {
      orderBy: { sortOrder: 'asc' },
      include: { teacher: true, courses: { include: { course: true } } },
    },
    findUniqueArgs: { include: { teacher: true, courses: { include: { course: true } } } },
    reorderModel: 'student',
    toData: (i) => ({
      name: i.name,
      quote: i.quote,
      story: i.story,
      duration: i.duration,
      teacherId: i.teacherId ? BigInt(i.teacherId as number) : null,
      photoUrl: i.photoUrl ?? null,
      sortOrder: i.sortOrder ?? 0,
      isPublished: i.isPublished ?? true,
    }),
    toDto: (r) => {
      const teacher = r.teacher as { id: bigint; name: never } | null;
      const courses = (r.courses as { course: { id: bigint; title: never } }[]) ?? [];
      return {
        id: num(r.id as bigint),
        name: loc(r.name as never),
        quote: loc(r.quote as never),
        story: loc(r.story as never),
        duration: r.duration,
        photoUrl: r.photoUrl ?? null,
        sortOrder: r.sortOrder,
        isPublished: r.isPublished,
        teacher: teacher ? { id: num(teacher.id), name: loc(teacher.name) } : null,
        courses: courses.map((sc) => ({ id: num(sc.course.id), title: loc(sc.course.title) })),
      };
    },
  }),
);

// schedule (расписание)
adminRouter.use(
  '/schedule',
  crud({
    model: prisma.scheduleSlot as unknown as PrismaDelegate,
    createSchema: scheduleSlotInputSchema,
    findManyArgs: { orderBy: { startTime: 'asc' }, include: { subject: true, person: true } },
    findUniqueArgs: { include: { subject: true, person: true } },
    toData: (i) => ({
      subjectId: BigInt(i.subjectId as number),
      personId: BigInt(i.personId as number),
      days: i.days,
      startTime: toTime(i.startTime as string),
      endTime: toTime(i.endTime as string),
    }),
    toDto: (r) => {
      const subject = r.subject as { id: bigint; code: string; title: never; color: string };
      const person = r.person as { id: bigint; name: never };
      return {
        id: num(r.id as bigint),
        days: dayArray(r.days as never),
        startTime: timeHHMM(r.startTime as Date),
        endTime: timeHHMM(r.endTime as Date),
        subject: { id: num(subject.id), code: subject.code, title: loc(subject.title), color: subject.color },
        person: { id: num(person.id), name: loc(person.name) },
      };
    },
  }),
);

// ---------------------------------------------------------------------------
// Спец-роуты M:N
// ---------------------------------------------------------------------------

// PUT /api/admin/team/:id/subjects — перезаписать набор предметов человека.
adminRouter.put(
  '/team/:id/subjects',
  asyncHandler(async (req, res) => {
    const parsed = idSetSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Некорректный набор предметов', flattenZod(parsed.error));
      return;
    }
    const personId = BigInt(req.params.id!);
    await prisma.$transaction([
      prisma.personSubject.deleteMany({ where: { personId } }),
      prisma.personSubject.createMany({
        data: parsed.data.ids.map((sid) => ({ personId, subjectId: BigInt(sid) })),
      }),
    ]);
    sendData(res, { ok: true, count: parsed.data.ids.length });
  }),
);

// PUT /api/admin/students/:id/courses — перезаписать набор курсов ученика.
adminRouter.put(
  '/students/:id/courses',
  asyncHandler(async (req, res) => {
    const parsed = idSetSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Некорректный набор курсов', flattenZod(parsed.error));
      return;
    }
    const studentId = BigInt(req.params.id!);
    await prisma.$transaction([
      prisma.studentCourse.deleteMany({ where: { studentId } }),
      prisma.studentCourse.createMany({
        data: parsed.data.ids.map((cid) => ({ studentId, courseId: BigInt(cid) })),
      }),
    ]);
    sendData(res, { ok: true, count: parsed.data.ids.length });
  }),
);

// ---------------------------------------------------------------------------
// Кампания (одна активная; правка цели/суммы/дат)
// ---------------------------------------------------------------------------
adminRouter.put(
  '/campaign',
  asyncHandler(async (req, res) => {
    const parsed = campaignInputSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 422, 'VALIDATION', 'Проверьте поля кампании', flattenZod(parsed.error));
      return;
    }
    const data = {
      title: parsed.data.title,
      goalAmount: parsed.data.goalAmount,
      raisedAmount: parsed.data.raisedAmount ?? 0,
      currency: parsed.data.currency,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      isActive: parsed.data.isActive,
    };
    // Активная кампания одна: при isActive снимаем флаг с прочих.
    const existing = await prisma.campaign.findFirst({ where: { isActive: true } });
    const saved = existing
      ? await prisma.campaign.update({ where: { id: existing.id }, data })
      : await prisma.campaign.create({ data });
    sendData(res, {
      id: num(saved.id),
      title: loc(saved.title),
      goalAmount: dec(saved.goalAmount),
      raisedAmount: dec(saved.raisedAmount),
      currency: saved.currency,
      endsAt: saved.endsAt ? saved.endsAt.toISOString() : null,
      isActive: saved.isActive,
    });
  }),
);

// ---------------------------------------------------------------------------
// Загрузка фото (только admin/editor). Сохраняет в UPLOAD_DIR, отдаёт photoUrl.
// ---------------------------------------------------------------------------
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? './uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

adminRouter.post(
  '/upload',
  requireRole('admin', 'editor'),
  upload.single('file'),
  (req: Request, res: Response) => {
    if (!req.file) {
      sendError(res, 422, 'VALIDATION', 'Файл не получен (ожидается image/*, поле file)');
      return;
    }
    sendData(res, { photoUrl: `/uploads/${req.file.filename}` });
  },
);
