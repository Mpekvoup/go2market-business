import type { Language } from '../types';

export async function postContact(data: Record<string, string>, lang: Language) {
  const message = (ru: string, en: string) => lang === 'ru' ? ru : en;
  let response: Response;
  try {
    response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error(message('Не удалось связаться с сервером. Попробуйте позже или напишите нам в WhatsApp.', 'Could not reach the server. Please try again or contact us on WhatsApp.'));
  }
  const body = await response.text();
  let result: { ok?: boolean; error?: string } | null = null;
  try { result = JSON.parse(body); } catch { /* A proxy can return an empty body or HTML. */ }
  if (response.ok && result?.ok === true) return { ok: true };
  if (response.status === 503) throw new Error(message('Приём заявок временно недоступен. Напишите нам в WhatsApp.', 'Enquiries are temporarily unavailable. Please contact us on WhatsApp.'));
  if (response.status === 429) throw new Error(message('Слишком много попыток. Повторите через минуту.', 'Too many attempts. Please try again in a minute.'));
  if (response.status === 400 && (result?.error === 'Invalid contact' || result?.error === 'Enter a valid phone number or email')) {
    throw new Error(message('Укажите корректный телефон или email.', 'Enter a valid phone number or email.'));
  }
  if (response.status === 400 || response.status === 413) throw new Error(message('Проверьте заполненные поля и длину сообщения.', 'Check your fields and message length.'));
  throw new Error(message(`Не удалось отправить заявку (HTTP ${response.status}). Попробуйте позже или напишите нам в WhatsApp.`, `Could not send the enquiry (HTTP ${response.status}). Please try again or contact us on WhatsApp.`));
}
