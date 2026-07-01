import { useEffect, useState } from 'react'
import { getCoursePlaceholder, getLegacyCourseImageUrl } from '../../utils/courseDisplay'

export default function CourseImage({
  src,
  slug,
  title = 'CETMED',
  loading = 'lazy',
  fit = 'cover',
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

  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover'

  return (
    <div className={`course-image-frame relative overflow-hidden bg-[var(--primary)] ${className}`}>
      <img
        src={currentSrc}
        alt={title}
        loading={loading}
        decoding="async"
        onError={handleError}
        className={`course-image-img relative z-10 h-full w-full ${fitClass} object-center ${imageClassName}`}
      />
      {children && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {children}
        </div>
      )}
    </div>
  )
}
