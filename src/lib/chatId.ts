export function phoneToChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@c.us`; // ← проверь формат для Telegram в доке GREEN-API!
}
