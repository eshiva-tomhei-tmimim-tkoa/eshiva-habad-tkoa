/**
 * Интеграция с платёжной системой Israel Toremet / IsraelGives.
 *
 * Модель: хостинговая донат-форма на secureddonation.com. Сервер строит ссылку
 * с параметрами (сумма, валюта, частота) и возвращает её фронту, который
 * редиректит донора на оплату. По завершении IsraelGives возвращает донора на
 * нашу successurl с данными платежа.
 *
 * Параметры формы (см. help.israeltoremet.org → advanced donation form):
 *   currency — id валюты (USD=2; ILS/др. — задаются TOREMET_CURRENCY_IDS)
 *   sum      — сумма
 *   freq     — 1 разово, 2 ежемесячно, 3 ежегодно
 *   step=2   — сразу к шагу оплаты (нужны currency+sum+freq)
 *   pptop=1  — thank-you в родительском окне, а не в модалке
 *   successurl — возврат с плейсхолдерами {tsum},{tcurrency},{tfname},{lname},{frequency},{trid},{donid}
 */

// Полный базовый URL кастомной формы, напр. https://secureddonation.com/en/pay/<slug>
const PAY_URL = process.env.TOREMET_PAY_URL;
// Альтернатива для некастомной формы: gov-id амуты (тогда PAY_URL можно не задавать).
const AMUTA_GOV_ID = process.env.TOREMET_AMUTA_GOV_ID;
// Публичный URL сайта для successurl (напр. https://yeshiva-tkoa.org).
const WEB_PUBLIC_URL = process.env.WEB_PUBLIC_URL ?? 'http://localhost:3000';

// Соответствие код валюты → id IsraelGives. USD=2 подтверждён докой; остальные
// уточнить у IsraelGives и переопределить через TOREMET_CURRENCY_IDS (JSON).
const DEFAULT_CURRENCY_IDS: Record<string, number> = { ILS: 1, USD: 2, EUR: 4, GBP: 5 };
const CURRENCY_IDS: Record<string, number> = (() => {
  try {
    return process.env.TOREMET_CURRENCY_IDS
      ? { ...DEFAULT_CURRENCY_IDS, ...JSON.parse(process.env.TOREMET_CURRENCY_IDS) }
      : DEFAULT_CURRENCY_IDS;
  } catch {
    return DEFAULT_CURRENCY_IDS;
  }
})();

export interface DonationLinkInput {
  amount: number;
  currency: string;
  recurring: boolean;
  locale: 'ru' | 'he' | 'en';
  campaignId: number;
}

/** Язык хостинговой формы IsraelGives (ru → en, отдельной ru-локали у них нет). */
const formLang = (locale: string): string => (locale === 'he' ? 'he' : 'en');

/** Построить ссылку на оплату. null, если провайдер не сконфигурирован. */
export function buildDonationUrl(input: DonationLinkInput): string | null {
  const lang = formLang(input.locale);
  let base: string;
  const extra: Record<string, string> = {};

  if (PAY_URL) {
    base = PAY_URL;
  } else if (AMUTA_GOV_ID) {
    base = `https://secureddonation.com/${lang}/pay/makedonation`;
    extra.MakeDonation = '1';
    extra.AmutaGovId = AMUTA_GOV_ID;
  } else {
    return null; // не настроено
  }

  const currencyId = CURRENCY_IDS[input.currency] ?? CURRENCY_IDS.USD!;
  const freq = input.recurring ? '2' : '1';

  // successurl с плейсхолдерами IsraelGives (подставляются на их стороне).
  // cid — наша кампания, чтобы учесть пожертвование при возврате донора.
  const successUrl =
    `${WEB_PUBLIC_URL}/${input.locale}/donate/thanks` +
    `?cid=${input.campaignId}` +
    `&sum={tsum}&cur={tcurrency}&fname={tfname}&lname={lname}&freq={frequency}&trid={trid}&donid={donid}`;

  const url = new URL(base);
  const params: Record<string, string> = {
    ...extra,
    currency: String(currencyId),
    sum: String(input.amount),
    freq,
    step: '2',
    pptop: '1',
    successurl: successUrl,
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

export const isToremetConfigured = (): boolean => Boolean(PAY_URL || AMUTA_GOV_ID);
