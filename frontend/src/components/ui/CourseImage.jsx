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
    <div className={`course-image-frame relative overflow-hidden bg-[var(--primary)] ${className}`}>
      <img
        src={currentSrc}
        alt={title}
        loading={loading}
        decoding="async"
        onError={handleError}
        className={`course-image-img relative z-10 h-full w-full object-cover object-center ${imageClassName}`}
      />
      {children && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {children}
        </div>
      )}
    </div>
  )
}
