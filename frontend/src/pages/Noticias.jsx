import { useState, useEffect } from 'react'
import { getNoticias } from '../services/api'
import BlogCard from '../components/ui/BlogCard'
import SectionLabel from '../components/ui/SectionLabel'

const MOCK = [
  { id:1, attributes:{ titulo:'CETMED renueva certificación SENCE para 2025', resumen:'Nuestro centro supera con éxito el proceso de renovación de la acreditación SENCE, confirmando el compromiso con la calidad formativa.', slug:'renovacion-sence-2025', publishedAt:'2025-04-01', imagen:{data:null} } },
  { id:2, attributes:{ titulo:'Nueva oferta de cursos E-Learning disponible', resumen:'Ampliamos nuestra plataforma virtual con 12 nuevos cursos certificados, disponibles desde cualquier dispositivo y a tu propio ritmo.', slug:'nuevos-cursos-elearning', publishedAt:'2025-03-20', imagen:{data:null} } },
  { id:3, attributes:{ titulo:'Alianza estratégica con constructoras regionales', resumen:'Firmamos convenio con las principales empresas del sector construcción de la Región de Coquimbo para fortalecer la formación laboral.', slug:'alianza-constructoras', publishedAt:'2025-03-05', imagen:{data:null} } },
  { id:4, attributes:{ titulo:'Nuevos cursos de electricidad industrial', resumen:'Lanzamos 4 nuevos programas en el área de electricidad, en respuesta a la creciente demanda del sector energético regional.', slug:'cursos-electricidad-industrial', publishedAt:'2025-02-18', imagen:{data:null} } },
  { id:5, attributes:{ titulo:'Graduación de la promoción verano 2025', resumen:'Más de 200 profesionales recibieron sus certificaciones en la emotiva ceremonia realizada en nuestras dependencias de Coquimbo.', slug:'graduacion-verano-2025', publishedAt:'2025-02-01', imagen:{data:null} } },
  { id:6, attributes:{ titulo:'CETMED en la Feria Laboral de La Serena', resumen:'Participamos en la feria de empleo más importante de la región, orientando a más de 500 personas sobre nuestros programas de capacitación.', slug:'feria-laboral-la-serena', publishedAt:'2025-01-15', imagen:{data:null} } },
]

export default function Noticias() {
  const [noticias, setNoticias] = useState(MOCK)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getNoticias().then(d => { if (d?.data?.length) setNoticias(d.data) }).catch(()=>{})
  }, [])

  const filtered = noticias.filter(n =>
    !search || n.attributes.titulo?.toLowerCase().includes(search.toLowerCase())
  )

  const [featured, ...rest] = filtered

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
          {/* Search */}
          <div className="relative max-w-md mb-10" data-reveal>
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar noticias..."
              className="form-control pl-9" />
          </div>

          {/* Featured */}
          {featured && !search && (
            <div className="mb-12" data-reveal>
              <SectionLabel>Destacado</SectionLabel>
              <BlogCard noticia={featured} />
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search ? filtered : rest).map((n,i) => (
                <div key={n.id} data-reveal data-delay={String(i%3+1)}>
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
        </div>
      </section>
    </>
  )
}
