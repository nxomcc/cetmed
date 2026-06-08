import { useState, useEffect, useMemo } from 'react'
import SectionLabel from '../components/ui/SectionLabel'
import { crearLead, getCategorias, getCursos } from '../services/api'

const FAQS = [
  { q:'¿Qué es la franquicia tributaria SENCE?', a:'La franquicia SENCE permite a las empresas descontar el costo de capacitación de sus impuestos. Todos nuestros cursos certificados la contemplan.' },
  { q:'¿Cómo puedo inscribirme en un curso?', a:'Puedes inscribirte directamente desde la web añadiendo el curso al carrito y completando el proceso de pago, o contactándonos directamente.' },
  { q:'¿Qué modalidades de pago aceptan?', a:'Aceptamos tarjeta de débito/crédito, transferencia bancaria y pago en cuotas con tarjetas del comercio. Para empresas, también facturamos.' },
  { q:'¿Los certificados tienen validez nacional?', a:'Sí. Al ser un OTEC certificado por SENCE, todos nuestros certificados son reconocidos a nivel nacional.' },
  { q:'¿Ofrecen capacitación en empresas (In Company)?', a:'Sí, podemos diseñar e impartir programas personalizados directamente en las instalaciones de tu empresa.' },
]

export default function Contacto() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({
    nombre:'', rut:'', email:'', telefono:'', empresa:'',
    tipo:'persona', categoria_slug:'', curso_id:'', mensaje:'',
  })
  const [sent, setSent]           = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')
  const [categorias, setCategorias] = useState([])
  const [cursos, setCursos]       = useState([])

  useEffect(() => {
    getCategorias()
      .then(d => setCategorias(d.data || []))
      .catch(() => {})

    getCursos({ 'pagination[pageSize]': 200 })
      .then(d => setCursos(d.data || []))
      .catch(() => {})
  }, [])

  const cursosFiltered = useMemo(() => {
    if (!form.categoria_slug) return cursos
    return cursos.filter(c => {
      const cat = c.attributes?.categoria?.data?.attributes
      return cat?.slug === form.categoria_slug
    })
  }, [cursos, form.categoria_slug])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(p => {
      const next = { ...p, [name]: value }
      // reset course when category changes
      if (name === 'categoria_slug') next.curso_id = ''
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // Resolve area from selected category name
      const catName = categorias.find(c => c.attributes?.slug === form.categoria_slug)?.attributes?.nombre || ''
      await crearLead({
        nombre:   form.nombre,
        email:    form.email,
        telefono: form.telefono,
        mensaje:  form.mensaje,
        rut:      form.rut,
        empresa:  form.empresa,
        tipo:     form.tipo,
        area:     catName || form.categoria_slug || null,
        curso_id: form.curso_id ? Number(form.curso_id) : null,
      })
      setSent(true)
    } catch {
      setError('No se pudo enviar el mensaje. Intentá de nuevo o contactanos directamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionLabel><span className="text-white/70">Comunícate con nosotros</span></SectionLabel>
          <h1 className="text-4xl font-black text-white mt-2">Contacto</h1>
          <p className="text-white/70 mt-2">Estamos aquí para orientarte. Escríbenos o llámanos.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Info */}
            <div className="space-y-6">
              {[
                { icon:'location_on',  title:'Dirección',    content:'Coquimbo, Región de Coquimbo, Chile' },
                { icon:'phone',        title:'Teléfono',     content:'+56 9 2778 1966', href:'tel:+56927781966' },
                { icon:'email',        title:'Email',        content:'contacto@cetmed.cl', href:'mailto:contacto@cetmed.cl' },
                { icon:'access_time',  title:'Horario',      content:'Lun–Vie 09:00–18:00' },
              ].map(d => (
                <div key={d.title} className="flex gap-4 p-5 bg-[var(--bg-light)] rounded-xl border border-[var(--border)]" data-reveal>
                  <div className="w-11 h-11 bg-[var(--primary)] rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-icons text-white text-lg">{d.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">{d.title}</p>
                    {d.href
                      ? <a href={d.href} className="font-semibold text-[var(--primary)] hover:underline">{d.content}</a>
                      : <p className="font-semibold text-[var(--text-dark)]">{d.content}</p>}
                  </div>
                </div>
              ))}

              <div className="rounded-xl overflow-hidden border border-[var(--border)] aspect-video bg-[var(--bg-light)] flex items-center justify-center" data-reveal>
                <div className="text-center text-[var(--text-muted)]">
                  <span className="material-icons text-4xl mb-2 block">map</span>
                  <p className="text-sm">Coquimbo, Chile</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2" data-reveal>
              <div className="bg-white rounded-2xl border border-[var(--border)] p-8">
                <h2 className="text-2xl font-black text-[var(--text-dark)] mb-6">Envíanos un mensaje</h2>

                {sent ? (
                  <div className="text-center py-12">
                    <span className="material-icons text-5xl text-green-500 mb-3 block">check_circle</span>
                    <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
                    <p className="text-[var(--text-muted)]">Te responderemos a la brevedad.</p>
                    <button onClick={() => { setSent(false); setForm(p => ({ ...p, nombre:'', email:'', mensaje:'', rut:'', telefono:'', empresa:'', categoria_slug:'', curso_id:'' })) }} className="btn-ghost mt-5">
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Tipo */}
                    <div className="flex gap-3">
                      {['persona','empresa'].map(t => (
                        <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-semibold ${
                          form.tipo === t ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)]'
                        }`}>
                          <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={handleChange} className="sr-only" />
                          <span className="material-icons text-sm">{t === 'persona' ? 'person' : 'business'}</span>
                          {t === 'persona' ? 'Persona natural' : 'Empresa'}
                        </label>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">Nombre completo *</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} required
                          className="form-control" placeholder="Tu nombre" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">RUT</label>
                        <input name="rut" value={form.rut} onChange={handleChange}
                          className="form-control" placeholder="12.345.678-9" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">Email *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required
                          className="form-control" placeholder="tu@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">Teléfono</label>
                        <input name="telefono" value={form.telefono} onChange={handleChange}
                          className="form-control" placeholder="+56 9 0000 0000" />
                      </div>
                      {form.tipo === 'empresa' && (
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">Empresa</label>
                          <input name="empresa" value={form.empresa} onChange={handleChange}
                            className="form-control" placeholder="Nombre de la empresa" />
                        </div>
                      )}

                      {/* Área de interés */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">
                          <span className="material-icons text-[14px] align-middle mr-1 text-[var(--primary)]">category</span>
                          Área de interés
                        </label>
                        <select name="categoria_slug" value={form.categoria_slug} onChange={handleChange} className="form-control">
                          <option value="">Todas las áreas...</option>
                          {categorias.map(c => (
                            <option key={c.id} value={c.attributes.slug}>{c.attributes.nombre}</option>
                          ))}
                        </select>
                      </div>

                      {/* Curso específico */}
                      <div>
                        <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">
                          <span className="material-icons text-[14px] align-middle mr-1 text-[var(--primary)]">school</span>
                          Curso de interés
                        </label>
                        <select name="curso_id" value={form.curso_id} onChange={handleChange} className="form-control">
                          <option value="">Selecciona un curso...</option>
                          {cursosFiltered.map(c => (
                            <option key={c.id} value={c.id}>{c.attributes.titulo}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-dark)] mb-1.5">Mensaje *</label>
                      <textarea name="mensaje" value={form.mensaje} onChange={handleChange} required rows={5}
                        className="form-control resize-none" placeholder="¿En qué podemos ayudarte?" />
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        {error}
                      </div>
                    )}
                    <button type="submit" disabled={submitting} className="btn-primary w-full justify-center text-base py-3 disabled:opacity-60">
                      <span className="material-icons">{submitting ? 'refresh' : 'send'}</span>
                      {submitting ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <div className="text-center mb-8" data-reveal>
              <SectionLabel>Preguntas frecuentes</SectionLabel>
              <h2 className="text-3xl font-black text-[var(--text-dark)]">¿Tienes dudas?</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQS.map((f,i) => (
                <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden" data-reveal data-delay={String(i%3+1)}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[var(--text-dark)] hover:bg-[var(--bg-light)] transition-colors">
                    {f.q}
                    <span className={`material-icons text-[var(--primary)] transition-transform shrink-0 ml-3 ${openFaq === i ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-[var(--text-body)] leading-relaxed border-t border-[var(--border)] pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
