const HONEYPOT_FIELDS = ['website', 'homepage', 'company_url', 'fax']

export function isHoneypotFilled(body: Record<string, unknown>) {
  return HONEYPOT_FIELDS.some((field) => String(body?.[field] || '').trim() !== '')
}
