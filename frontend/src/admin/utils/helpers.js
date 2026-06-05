export function imgSrc(media) {
  const url = media?.data?.attributes?.url
  if (!url) return null
  const base = import.meta.env.VITE_CMS_URL || 'http://localhost:1337'
  return url.startsWith('http') ? url : `${base}${url}`
}

export function fmtClp(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(n || 0)
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
