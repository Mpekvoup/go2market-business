// Return fixed diagnostic codes only: never log Telegram URLs, tokens or payloads.
export function telegramErrorCode(status, result) {
  const code = result?.error_code || status;
  const description = typeof result?.description === 'string' ? result.description.toLowerCase() : '';
  if (code === 401) return 'TG_AUTH';
  if (code === 404) return 'TG_TOKEN_FORMAT';
  if (code === 403) return 'TG_ACCESS';
  if (code === 429) return 'TG_RATE_LIMIT';
  if (code === 400 && description.includes('chat not found')) return 'TG_CHAT_NOT_FOUND';
  if (code === 400 && (description.includes('not enough rights') || description.includes('administrator'))) return 'TG_ACCESS';
  if (result?.parameters?.migrate_to_chat_id) return 'TG_CHAT_MIGRATED';
  return 'TG_REJECTED';
}
