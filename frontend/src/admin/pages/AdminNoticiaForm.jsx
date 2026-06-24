import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as api from '../services/adminApi'
import { imgSrc, slugify } from '../utils/helpers'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

const EMPTY = { titulo: '', slug: '', resumen: '', contenido: '', publicado: false }

export default function AdminNoticiaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toasts, toast, remove } = useToast()
  const isEdit = !!id

  const [form, setForm]         = useState(EMPTY)
  const [imageFile, setImageFile]   = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading]     = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.getNoticia(id)
      .then(r => {
        const a = r.data.attributes
        setForm({
          titulo: a.titulo || '',
          slug: a.slug || '',
          resumen: a.resumen || '',
          contenido: a.contenido || '',
          publicado: !!a.publishedAt,
        })
        setCurrentImage(imgSrc(a.imagen, a.titulo, a.slug, 'news'))
      })
      .catch(() => toast('Error cargando noticia', 'error'))
      .finally(() => setLoading(false))
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

      const data = {
        titulo: form.titulo,
        slug: form.slug,
        resumen: form.resumen,
        contenido: form.contenido,
        publishedAt: form.publicado ? new Date().toISOString() : null,
        ...(imageId !== undefined ? { imagen: imageId } : {}),
      }

      if (isEdit) {
        await api.updateNoticia(id, data)
        toast('Noticia actualizada')
      } else {
        await api.createNoticia(data)
        toast('Noticia creada')
        setTimeout(() => navigate('/admin/noticias'), 1000)
      }
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003d7a]" /></div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/noticias" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
          <span className="material-icons">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Editar noticia' : 'Nueva noticia'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Información</h2>

          <div>
            <label className="label">Título *</label>
            <input required value={form.titulo} onChange={e => set('titulo', e.target.value)} className="field" placeholder="Título de la noticia" />
          </div>

          <div>
            <label className="label">Slug (URL)</label>
            <input value={form.slug} onChange={e => set('slug', e.target.value)} className="field font-mono text-sm" />
          </div>

          <div>
            <label className="label">Resumen</label>
            <textarea value={form.resumen} onChange={e => set('resumen', e.target.value)} rows={2} className="field resize-none" placeholder="Breve descripción para listados y SEO" />
          </div>

          <div>
            <label className="label">Contenido</label>
            <textarea
              value={form.contenido}
              onChange={e => set('contenido', e.target.value)}
              rows={14}
              className="field resize-none font-mono text-sm"
              placeholder="Contenido completo de la noticia..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.publicado} onChange={e => set('publicado', e.target.checked)} className="w-4 h-4 accent-[#003d7a]" />
            <span className="text-sm font-medium text-gray-700">Publicar noticia</span>
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Imagen de portada</h2>
          {(imagePreview || currentImage) && (
            <img src={imagePreview || currentImage} alt="" className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-100" />
          )}
          <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 hover:border-[#003d7a]/40 transition-colors">
            <span className="material-icons text-gray-400">image</span>
            <span className="text-sm text-gray-500">{imageFile ? imageFile.name : 'Seleccionar imagen...'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
          </label>
        </div>

        <div className="flex items-center gap-3 pb-8">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#003d7a] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#002d5a] transition-colors disabled:opacity-60">
            {(saving || uploading) && <span className="animate-spin material-icons text-[18px]">refresh</span>}
            <span className="material-icons text-[18px]">save</span>
            {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear noticia'}
          </button>
          <Link to="/admin/noticias" className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
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
