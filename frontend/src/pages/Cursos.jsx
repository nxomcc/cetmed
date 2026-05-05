import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCursos, getCategorias } from '../services/api'
import CourseCard from '../components/ui/CourseCard'
import SectionLabel from '../components/ui/SectionLabel'
import useCart from '../hooks/useCart'

const MOCK_CATEGORIAS = [
  { id:1, attributes:{ nombre:'Prevención de Riesgos' } },
  { id:2, attributes:{ nombre:'Construcción' } },
  { id:3, attributes:{ nombre:'Salud Ocupacional' } },
  { id:4, attributes:{ nombre:'Electricidad' } },
  { id:5, attributes:{ nombre:'Administración' } },
  { id:6, attributes:{ nombre:'Medio Ambiente' } },
]

const MOCK_CURSOS = [
  { id:1,  attributes:{ titulo:'Prevención de Riesgos en Obra', precio:120000, modalidad:'Presencial', horas:40, slug:'prevencion-riesgos-obra', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:1,attributes:{nombre:'Prevención de Riesgos'}}} } },
  { id:2,  attributes:{ titulo:'Primeros Auxilios Empresarial', precio:85000, modalidad:'Blended', horas:16, slug:'primeros-auxilios', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:3,attributes:{nombre:'Salud Ocupacional'}}} } },
  { id:3,  attributes:{ titulo:'Seguridad en Instalaciones Eléctricas', precio:95000, modalidad:'Presencial', horas:32, slug:'seguridad-electrica', imagen:{data:null}, categoria:{data:{id:4,attributes:{nombre:'Electricidad'}}} } },
  { id:4,  attributes:{ titulo:'Liderazgo y Gestión de Equipos', precio:110000, modalidad:'E-Learning', horas:24, slug:'liderazgo-gestion', imagen:{data:null}, categoria:{data:{id:5,attributes:{nombre:'Administración'}}} } },
  { id:5,  attributes:{ titulo:'Excel Avanzado para Gestión', precio:75000, modalidad:'E-Learning', horas:20, slug:'excel-avanzado', imagen:{data:null}, categoria:{data:{id:5,attributes:{nombre:'Administración'}}} } },
  { id:6,  attributes:{ titulo:'Manejo Defensivo de Vehículos', precio:88000, modalidad:'Presencial', horas:16, slug:'manejo-defensivo', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:1,attributes:{nombre:'Prevención de Riesgos'}}} } },
  { id:7,  attributes:{ titulo:'Carpintería y Construcción en Seco', precio:92000, modalidad:'Presencial', horas:48, slug:'carpinteria-construccion', imagen:{data:null}, categoria:{data:{id:2,attributes:{nombre:'Construcción'}}} } },
  { id:8,  attributes:{ titulo:'Instalaciones Eléctricas Domiciliarias', precio:105000, modalidad:'Blended', horas:40, slug:'instalaciones-electricas', imagen:{data:null}, categoria:{data:{id:4,attributes:{nombre:'Electricidad'}}} } },
  { id:9,  attributes:{ titulo:'Gestión Ambiental en Obras', precio:78000, modalidad:'E-Learning', horas:20, slug:'gestion-ambiental', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:6,attributes:{nombre:'Medio Ambiente'}}} } },
  { id:10, attributes:{ titulo:'Operador de Grúa Torre', precio:180000, modalidad:'Presencial', horas:80, slug:'operador-grua', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:2,attributes:{nombre:'Construcción'}}} } },
  { id:11, attributes:{ titulo:'Salud y Seguridad en el Trabajo', precio:65000, modalidad:'E-Learning', horas:16, slug:'salud-seguridad', franquicia_sence:true, imagen:{data:null}, categoria:{data:{id:3,attributes:{nombre:'Salud Ocupacional'}}} } },
  { id:12, attributes:{ titulo:'Contabilidad Básica', precio:72000, modalidad:'E-Learning', horas:24, slug:'contabilidad-basica', imagen:{data:null}, categoria:{data:{id:5,attributes:{nombre:'Administración'}}} } },
]

const MODALIDADES = ['Todos','Presencial','E-Learning','Blended']

export default function Cursos() {
  const [searchParams] = useSearchParams()
  const [cursos, setCursos]         = useState(MOCK_CURSOS)
  const [categorias, setCategorias] = useState(MOCK_CATEGORIAS)
  const [search, setSearch]         = useState('')
  const [catActiva, setCatActiva]   = useState('Todos')
  const [modalidad, setModalidad]   = useState('Todos')
  const [cartVisible, setCartVisible] = useState(false)

  useEffect(() => {
    getCursos().then(d => { if (d?.data?.length) setCursos(d.data) }).catch(()=>{})
    getCategorias().then(d => { if (d?.data?.length) setCategorias(d.data) }).catch(()=>{})
  }, [])

  const filtered = cursos.filter(c => {
    const a = c.attributes
    const matchSearch = !search || a.titulo?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catActiva === 'Todos' || a.categoria?.data?.attributes?.nombre === catActiva
    const matchMod = modalidad === 'Todos' || a.modalidad === modalidad
    return matchSearch && matchCat && matchMod
  })

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-xl text-white">
            <SectionLabel><span className="text-white/70">Catálogo de cursos</span></SectionLabel>
            <h1 className="text-4xl font-black mt-2 mb-3">Todos los cursos</h1>
            <p className="text-white/70">Más de 120 programas certificados. Encuentra el que impulsa tu carrera.</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-8 flex flex-col gap-4" data-reveal>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cursos..."
                  className="form-control pl-9" />
              </div>
              {/* Modalidad */}
              <select value={modalidad} onChange={e => setModalidad(e.target.value)} className="form-control sm:w-44">
                {MODALIDADES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {['Todos', ...categorias.map(c => c.attributes.nombre)].map(cat => (
                <button key={cat} onClick={() => setCatActiva(cat)}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
                    catActiva === cat
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-white text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[var(--text-muted)]">
              {filtered.length} curso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-icons text-5xl text-[var(--text-muted)] mb-4 block">search_off</span>
              <p className="text-[var(--text-muted)]">No hay cursos que coincidan con tu búsqueda.</p>
              <button onClick={() => { setSearch(''); setCatActiva('Todos'); setModalidad('Todos') }}
                className="btn-ghost mt-4">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(c => (
                <CourseCard key={c.id} curso={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
