import { useState, useEffect } from 'react'
import { getNoticias } from '../services/api'
import BlogCard from '../components/ui/BlogCard'
import SectionLabel from '../components/ui/SectionLabel'

export default function Noticias() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getNoticias()
      .then(d => setNoticias(d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const isSearching = !!search.trim()
  const filtered = noticias.filter(n =>
    !isSearching ||
    n.attributes.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    n.attributes.resumen?.toLowerCase().includes(search.toLowerCase())
  )

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionLabel><span className="text-white/70">Está pasando</span></SectionLabel>
          <h1 className="text-4xl font-black text-white mt-2">Noticias y novedades</h1>
          <p className="text-white/70 mt-2">Lo último de CETMED y el mundo de la capacitación.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative max-w-md mb-10" data-reveal>
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar noticias..."
              className="form-control" style={{ paddingLeft: '2.5rem' }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-light)] rounded-2xl border border-[var(--border)] h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Featured */}
              {!isSearching && featured && (
                <div className="mb-12" data-reveal>
                  <SectionLabel>Destacado</SectionLabel>
                  <BlogCard noticia={featured} />
                </div>
              )}

              {/* Grid */}
              {((isSearching && filtered.length > 0) || (!isSearching && rest.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(isSearching ? filtered : rest).map((n, i) => (
                    <div key={n.id} data-reveal data-delay={String(i % 3 + 1)}>
                      <BlogCard noticia={n} />
                    </div>
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <span className="material-icons text-5xl text-[var(--text-muted)] mb-3 block">article</span>
                  <p className="text-[var(--text-muted)]">No se encontraron noticias.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
