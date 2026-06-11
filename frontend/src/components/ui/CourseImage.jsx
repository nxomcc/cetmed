import { useEffect, useState } from 'react'
import { getCoursePlaceholder, getLegacyCourseImageUrl } from '../../utils/courseDisplay'

export default function CourseImage({
  src,
  slug,
  title = 'CETMED',
  loading = 'lazy',
  className = '',
  imageClassName = '',
  children,
}) {
  const [currentSrc, setCurrentSrc] = useState(src)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  function handleError() {
    const legacyUrl = getLegacyCourseImageUrl(slug)
    if (legacyUrl && currentSrc !== legacyUrl) {
      setCurrentSrc(legacyUrl)
      return
    }

    const placeholder = getCoursePlaceholder(title)
    if (currentSrc !== placeholder) setCurrentSrc(placeholder)
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--primary)] ${className}`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-center bg-cover opacity-80 blur-lg"
        style={{ backgroundImage: `url("${currentSrc}")` }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/10" />
      <img
        src={currentSrc}
        alt={title}
        loading={loading}
        decoding="async"
        onError={handleError}
        className={`relative z-10 h-full w-full object-contain drop-shadow-sm ${imageClassName}`}
      />
      {children && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {children}
        </div>
      )}
    </div>
  )
}
