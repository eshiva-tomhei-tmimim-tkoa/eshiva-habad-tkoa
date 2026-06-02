/** Плоская карта ошибок валидации zod: поле → первое сообщение. */
type IssueLike = { path: (string | number)[]; message: string };

export function flattenZod(error: { issues: IssueLike[] }): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
