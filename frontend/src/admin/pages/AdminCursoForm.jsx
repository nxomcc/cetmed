import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as api from '../services/adminApi'
import { imgSrc, slugify } from '../utils/helpers'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const EMPTY = {
  titulo: '', slug: '', descripcion: '', objetivo: '', precio: 0,
  horas: '', modalidad: 'Presencial', nivel: 'Básico-Intermedio',
  franquicia_sence: false, activo: true, categoria: null, moodle_course_id: '', contenidos: '',
}

export default function AdminCursoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, toast, remove } = useToast()
  const isEdit = !!id

  const [form, setForm]         = useState(EMPTY)
  const [categorias, setCategorias] = useState([])
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(isEdit)
  const [moodleCourses, setMoodleCourses] = useState([])
  const [moodleQuery, setMoodleQuery] = useState('')
  const [loadingMoodle, setLoadingMoodle] = useState(false)
  const [creatingMoodle, setCreatingMoodle] = useState(false)

  useEffect(() => {
    api.getCategorias().then(r => setCategorias(r.data || []))
    if (isEdit) {
      api.getCurso(id)
        .then(r => {
          const a = r.data.attributes
          setForm({
            titulo: a.titulo || '',
            slug: a.slug || '',
            descripcion: a.descripcion || '',
            objetivo: a.objetivo || '',
            precio: a.precio || 0,
            horas: a.horas || '',
            modalidad: a.modalidad || 'Presencial',
            nivel: a.nivel || 'Básico-Intermedio',
            franquicia_sence: !!a.franquicia_sence,
            activo: !!a.activo,
            categoria: a.categoria?.data?.id || null,
            moodle_course_id: a.moodle_course_id || '',
            contenidos: a.contenidos ? JSON.stringify(a.contenidos, null, 2) : '',
          })
          setCurrentImage(imgSrc(a.imagen, a.titulo, a.slug))
        })
        .catch(() => toast('Error cargando curso', 'error'))
        .finally(() => setLoading(false))
    }
  }, [id])

  function set(field, value) {
    setForm(p => {
      const next = { ...p, [field]: value }
      if (field === 'titulo' && !isEdit) next.slug = slugify(value)
      return next
    })
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function loadMoodleCourses() {
    setLoadingMoodle(true)
    try {
      const courses = await api.listarCursosMoodle()
      setMoodleCourses(courses)
      toast('Cursos Moodle cargados')
    } catch (err) {
      toast(err.message || 'Error cargando cursos Moodle', 'error')
    } finally {
      setLoadingMoodle(false)
    }
  }

  async function linkMoodleCourse(course) {
    set('moodle_course_id', String(course.id))
    try {
      if (isEdit) {
        await api.updateCurso(id, { moodle_course_id: Number(course.id) })
        toast(`Vinculado con Moodle #${course.id}`)
      } else {
        toast(`ID Moodle #${course.id} seleccionado. Guarda el curso para completar.`)
      }
    } catch (err) {
      toast(err.message || 'Error guardando vinculacion Moodle', 'error')
    }
  }

  async function createAndLinkMoodleCourse() {
    if (!form.titulo.trim()) {
      toast('Primero ingresa un titulo para el curso', 'error')
      return
    }

    setCreatingMoodle(true)
    try {
      const course = await api.crearCursoMoodle({
        fullname: form.titulo.trim(),
        shortname: form.slug || slugify(form.titulo),
        summary: form.descripcion || form.objetivo || '',
      })
      await linkMoodleCourse(course)
      setMoodleCourses(prev => [course, ...prev.filter(c => c.id !== course.id)])
      toast(`Curso creado en Moodle: #${course.id}`)
    } catch (err) {
      toast(err.message || 'Error creando curso Moodle', 'error')
    } finally {
      setCreatingMoodle(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageId = undefined
      if (imageFile) {
        setUploading(true)
        const uploaded = await api.uploadFile(imageFile)
        imageId = uploaded.id
        setUploading(false)
      }

      let contenidosParsed = null
      if (form.contenidos.trim()) {
        try { contenidosParsed = JSON.parse(form.contenidos) } catch { toast('El campo "Contenidos" debe ser JSON válido.', 'error'); setSaving(false); return }
      }

      const data = {
        titulo: form.titulo,
        slug: form.slug,
        descripcion: form.descripcion,
        objetivo: form.objetivo,
        precio: Number(form.precio),
        horas: form.horas ? Number(form.horas) : null,
        modalidad: form.modalidad,
        nivel: form.nivel,
        franquicia_sence: form.franquicia_sence,
        activo: form.activo,
        categoria: form.categoria ? Number(form.categoria) : null,
        moodle_course_id: form.moodle_course_id ? Number(form.moodle_course_id) : null,
        contenidos: contenidosParsed,
        ...(imageId !== undefined ? { imagen: imageId } : {}),
      }

      if (isEdit) {
        await api.updateCurso(id, data)
        toast('Curso actualizado')
      } else {
        await api.createCurso(data)
        toast('Curso creado')
        setTimeout(() => navigate('/admin/cursos'), 1000)
      }
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>

  const filteredMoodleCourses = moodleCourses.filter(course => {
    const q = moodleQuery.trim().toLowerCase()
    if (!q) return true
    return [course.fullname, course.shortname, String(course.id)]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(q))
  }).slice(0, 20)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/cursos" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
          <span className="material-icons">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Editar curso' : 'Nuevo curso'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{isEdit ? `ID: ${id}` : 'Completá los datos del curso'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Información básica</h2>

          <div>
            <label className="label">Título *</label>
            <input required value={form.titulo} onChange={e => set('titulo', e.target.value)} className="field" placeholder="Ej: Prevención de Riesgos en la Construcción" />
          </div>

          <div>
            <label className="label">Slug (URL)</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} className="field font-mono text-sm" placeholder="prevencion-riesgos-construccion" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Precio (CLP) *</label>
              <input required type="number" min={0} value={form.precio} onChange={e => set('precio', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label">Horas</label>
              <input type="number" min={1} value={form.horas} onChange={e => set('horas', e.target.value)} className="field" />
            </div>
            <div>
              <label className="label">Modalidad</label>
              <select value={form.modalidad} onChange={e => set('modalidad', e.target.value)} className="field">
                {['Presencial', 'E-Learning', 'Online sincrónico', 'Blended', 'In Company'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Nivel</label>
              <select value={form.nivel} onChange={e => set('nivel', e.target.value)} className="field">
                {['Básico', 'Básico-Intermedio', 'Intermedio', 'Avanzado'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select value={form.categoria || ''} onChange={e => set('categoria', e.target.value || null)} className="field">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.attributes.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ID curso Moodle</label>
              <input
                type="number"
                min={1}
                value={form.moodle_course_id}
                onChange={e => set('moodle_course_id', e.target.value)}
                className="field"
                placeholder="Ej: 42"
              />
              <p className="text-xs text-gray-400 mt-1">Solo para cursos e-learning asincrónicos enlazados al aula virtual. En presenciales o sincrónicos déjalo vacío.</p>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Vinculación Moodle</h3>
                <p className="text-xs text-gray-500 mt-0.5">Úsalo solo cuando el alumno deba recibir acceso automático al aula virtual.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadMoodleCourses}
                  disabled={loadingMoodle}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60 flex items-center gap-1"
                >
                  <span className={`material-icons text-[16px] ${loadingMoodle ? 'animate-spin' : ''}`}>{loadingMoodle ? 'refresh' : 'search'}</span>
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={createAndLinkMoodleCourse}
                  disabled={creatingMoodle}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#003d7a] text-white hover:bg-[#002d5a] disabled:opacity-60 flex items-center gap-1"
                >
                  <span className={`material-icons text-[16px] ${creatingMoodle ? 'animate-spin' : ''}`}>{creatingMoodle ? 'refresh' : 'add'}</span>
                  Crear en Moodle
                </button>
              </div>
            </div>

            {moodleCourses.length > 0 && (
              <div className="space-y-2">
                <input
                  value={moodleQuery}
                  onChange={e => setMoodleQuery(e.target.value)}
                  className="field bg-white"
                  placeholder="Filtrar por nombre, nombre corto o ID..."
                />
                <div className="max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                  {filteredMoodleCourses.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-4 text-center">Sin coincidencias</p>
                  ) : filteredMoodleCourses.map(course => (
                    <div key={course.id} className="flex items-center gap-3 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{course.fullname}</p>
                        <p className="text-xs text-gray-400 truncate">ID {course.id} · {course.shortname || 'sin shortname'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => linkMoodleCourse(course)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#003d7a]/20 text-[#003d7a] hover:bg-[#003d7a]/5"
                      >
                        Vincular
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.franquicia_sence} onChange={e => set('franquicia_sence', e.target.checked)} className="w-4 h-4 accent-[#003d7a]" />
              <span className="text-sm font-medium text-gray-700">Franquicia SENCE</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} className="w-4 h-4 accent-[#003d7a]" />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Descripción</h2>
          <div>
            <label className="label">Descripción general</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={4} className="field resize-none" />
          </div>
          <div>
            <label className="label">Objetivo del curso</label>
            <textarea value={form.objetivo} onChange={e => set('objetivo', e.target.value)} rows={3} className="field resize-none" />
          </div>
          <div>
            <label className="label">Contenidos (JSON)</label>
            <textarea value={form.contenidos} onChange={e => set('contenidos', e.target.value)} rows={5} className="field resize-none font-mono text-xs" placeholder={'[{"modulo": "Módulo 1", "temas": ["Tema 1", "Tema 2"]}]'} />
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Imagen</h2>
          {(imagePreview || currentImage) && (
            <img src={imagePreview || currentImage} alt="" className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-100" />
          )}
          <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:border-[#003d7a]/40 transition-colors">
            <span className="material-icons text-gray-400">image</span>
            <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Seleccionar imagen...'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#003d7a] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#002d5a] transition-colors disabled:opacity-60"
          >
            {(saving || uploading) && <span className="animate-spin material-icons text-[18px]">refresh</span>}
            <span className="material-icons text-[18px]">save</span>
            {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear curso'}
          </button>
          <Link to="/admin/cursos" className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
        </div>
      </form>

      <Toast toasts={toasts} remove={remove} />

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .field { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; outline: none; transition: border-color 0.15s; }
        .field:focus { border-color: #003d7a; box-shadow: 0 0 0 3px rgba(0,61,122,0.08); }
      `}</style>
    </div>
  )
}
