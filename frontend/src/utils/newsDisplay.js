export const NEWS_PLACEHOLDER = '/images/hero/hero-cetmed.png'

const NEWS_IMAGE_FALLBACKS = {
  'tecnicas-de-primeros-auxilios-basicos-rcp-y-dea': '/images/news/primeros-auxilios-rcp-dea.jpg',
  'gestor-de-inclusion-laboral': '/images/news/gestor-inclusion-laboral.jpg',
  'gestor-de-inclusion-laboral-capacitate': '/images/news/gestor-inclusion-laboral.jpg',
  'tecnicas-de-trabajo-seguro-en-espacios-confinados': '/images/news/trabajo-seguro-espacios-confinados.jpg',
  'tecnicas-de-seguridad-montaje-desmontaje-andamios': '/images/news/seguridad-andamios.jpg',
  'tecnicas-de-seguridad-en-el-montaje-y-desmontaje-de-andamios': '/images/news/seguridad-andamios.jpg',
}

export function getNewsImageFallback(slug = '') {
  return NEWS_IMAGE_FALLBACKS[slug] || NEWS_PLACEHOLDER
}

export function getNewsImageUrl(media, slug = '') {
  if (NEWS_IMAGE_FALLBACKS[slug]) return NEWS_IMAGE_FALLBACKS[slug]

  const url = media?.data?.attributes?.url || media?.attributes?.url || media?.url
  const fallback = getNewsImageFallback(slug)

  if (!url || isOldWordPressAsset(url)) return fallback
  if (url.startsWith('http') || url.startsWith('/')) return url

  const base = import.meta.env.VITE_CMS_URL || ''
  return `${base}/${url.replace(/^\/+/, '')}`
}

export function handleNewsImageError(event, slug = '') {
  const image = event.currentTarget
  const fallback = getNewsImageFallback(slug)

  if (image.getAttribute('src') !== fallback) {
    image.src = fallback
    return
  }

  image.onerror = null
  image.src = NEWS_PLACEHOLDER
}

function isOldWordPressAsset(url = '') {
  return /^https?:\/\/(?:www\.)?cetmed\.cl\/wp-content\/uploads\//i.test(String(url || ''))
    || /^https?:\/\/old\.cetmed\.cl\/wp-content\/uploads\//i.test(String(url || ''))
}
