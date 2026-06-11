import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCursos, getCategorias } from '../services/api'
import CourseCard from '../components/ui/CourseCard'
import SectionLabel from '../components/ui/SectionLabel'

const MODALIDADES = ['Todos', 'Presencial', 'E-Learning', 'E-Learning asincrónico', 'B-Learning']

export default function Cursos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cursos, setCursos]         = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [catActiva, setCatActiva]   = useState(searchParams.get('categoria') || 'Todos')
  const [modalidad, setModalidad]   = useState('Todos')
  const [senceOnly, setSenceOnly]   = useState(searchParams.get('sence') === '1')

  useEffect(() => {
    Promise.all([
      getCursos(),
      getCategorias(),
    ]).then(([cd, catd]) => {
      setCursos(cd?.data || [])
      setCategorias(catd?.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const queryCat = searchParams.get('categoria')
    if (queryCat) {
      setCatActiva(queryCat)
    } else {
      setCatActiva('Todos')
    }
    setSenceOnly(searchParams.get('sence') === '1')
  }, [searchParams])

  function handleCategorySelect(cat) {
    setCatActiva(cat)
    const newParams = new URLSearchParams(searchParams)
    if (cat === 'Todos') {
      newParams.delete('categoria')
    } else {
      newParams.set('categoria', cat)
    }
    setSearchParams(newParams)
  }

  function handleSenceSelect(checked) {
    setSenceOnly(checked)
    const newParams = new URLSearchParams(searchParams)
    if (checked) {
      newParams.set('sence', '1')
    } else {
      newParams.delete('sence')
    }
    setSearchParams(newParams)
  }

  function clearFilters() {
    setSearch('')
    setModalidad('Todos')
    setCatActiva('Todos')
    setSenceOnly(false)
    setSearchParams(new URLSearchParams())
  }

  const filtered = cursos.filter(c => {
    const a = c.attributes
    const matchSearch = !search || a.titulo?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catActiva === 'Todos' || a.categoria?.data?.attributes?.nombre === catActiva
    const matchMod = modalidad === 'Todos' || a.modalidad === modalidad
    const matchSence = !senceOnly || !!a.franquicia_sence
    return matchSearch && matchCat && matchMod && matchSence
  })

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left text-white">
            <SectionLabel><span className="text-white/70">Catálogo de cursos</span></SectionLabel>
            <h1 className="text-4xl font-black mt-2 mb-3">Todos los cursos</h1>
            <p className="text-white/70">Más de 120 programas certificados. Encuentra el que impulsa tu carrera.</p>
          </div>
        </div>
      </section>
 
      <section className="py-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-stretch lg:items-start">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-[var(--border)] p-5 lg:sticky lg:top-24 space-y-6">
                <div>
                  <h4 className="font-black text-[var(--text-dark)] text-xs uppercase tracking-wider mb-2">Buscar</h4>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Nombre del curso..."
                      className="form-control" style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
 
                <div>
                  <h4 className="font-black text-[var(--text-dark)] text-xs uppercase tracking-wider mb-2">Modalidad</h4>
                  <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="form-control w-full">
                    {MODALIDADES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
 
                <div>
                  <h4 className="font-black text-[var(--text-dark)] text-xs uppercase tracking-wider mb-2">Categoría</h4>
                  <div className="relative">
                    <select
                      value={catActiva}
                      onChange={e => handleCategorySelect(e.target.value)}
                      className="form-control w-full pr-10 appearance-none cursor-pointer"
                    >
                      {['Todos', ...categorias.map(c => c.attributes.nombre)].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">arrow_drop_down</span>
                  </div>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-light)] px-3 py-3 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-dark)]">
                    <span className="material-icons text-[var(--accent)] text-base">verified</span>
                    Solo franquicia SENCE
                  </span>
                  <input
                    type="checkbox"
                    checked={senceOnly}
                    onChange={e => handleSenceSelect(e.target.checked)}
                    className="w-4 h-4 accent-[var(--primary)]"
                  />
                </label>
              </div>
            </aside>
 
            {/* Courses Content */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-[var(--bg-light)] rounded-2xl border border-[var(--border)] h-72 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Results header */}
                  <div className="flex items-center justify-center sm:justify-between mb-5 text-center sm:text-left">
                    <p className="text-sm text-[var(--text-muted)]">
                      {filtered.length} curso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                    </p>
                  </div>
 
                  {/* Grid */}
                  {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-[var(--border)]">
                      <span className="material-icons text-5xl text-[var(--text-muted)] mb-4 block">search_off</span>
                      <p className="text-[var(--text-muted)]">No hay cursos que coincidan con tu búsqueda.</p>
                      <button onClick={clearFilters}
                        className="btn-ghost mt-4">
                        Limpiar filtros
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filtered.map(c => (
                        <CourseCard key={c.id} curso={c} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
 
          </div>
        </div>
      </section>
    </>
  )
}
