/**
 * Checkout con Getnet Chile (Placetopay)
 *
 * Flujo:
 * 1. El usuario llena sus datos personales (nombre, email, RUT, teléfono)
 * 2. Al confirmar, el backend crea un pedido pendiente y solicita una sesión a Getnet
 * 3. El frontend redirige al usuario al portal seguro de Getnet para pagar
 * 4. Getnet procesa el pago y redirige de vuelta a /checkout/retorno
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import useCart from '../hooks/useCart'
import { crearPagoGetnet, validarDescuento } from '../services/api'
import SectionLabel from '../components/ui/SectionLabel'
import { COURSE_PLACEHOLDER, fmtPrice } from '../utils/courseDisplay'

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [datos, setDatos] = useState({ nombre: '', email: '', rut: '', telefono: '', website: '' })
  function handleDatos(e) { setDatos(p => ({ ...p, [e.target.name]: e.target.value })) }

  // Discount
  const [codigoDesc, setCodigoDesc] = useState('')
  const [descuento, setDescuento] = useState(null)
  const [descError, setDescError] = useState('')
  const [validandoDesc, setValidandoDesc] = useState(false)

  async function aplicarDescuento() {
    if (!codigoDesc.trim()) return
    setValidandoDesc(true)
    setDescError('')
    try {
      const res = await validarDescuento(codigoDesc.trim(), items)
      setDescuento(res)
    } catch {
      setDescError('Código inválido o expirado')
      setDescuento(null)
    } finally {
      setValidandoDesc(false)
    }
  }

  const descuentoMonto = descuento ? Number(descuento.monto ?? (descuento.tipo === 'porcentaje' ? Math.round(total * descuento.valor / 100) : descuento.valor)) : 0
  const totalFinal = Math.max(0, total - descuentoMonto)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!datos.nombre || !datos.email || !datos.rut) {
      setError('Por favor completa los campos obligatorios (nombre, email y RUT).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        items: items.map(i => ({ id: i.id })),
        nombre_cliente: datos.nombre,
        email_cliente: datos.email,
        telefono_cliente: datos.telefono,
        rut_cliente: datos.rut,
        codigo_descuento: descuento ? codigoDesc.trim() : null,
        website: datos.website,
      }

      const data = await crearPagoGetnet(payload)

      if (data.processUrl) {
        // Redirect to Getnet secure payment portal
        window.location.href = data.processUrl
      } else {
        throw new Error('No se recibió la URL de pago de Getnet')
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el pago. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="material-icons text-6xl text-[var(--text-muted)]">shopping_cart</span>
      <h1 className="text-2xl font-black">Carrito vacío</h1>
      <Link to="/cursos" className="btn-primary">Ver catálogo</Link>
    </div>
  )

  return (
    <>
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionLabel><span className="text-white/70">Finaliza tu compra</span></SectionLabel>
          <h1 className="text-4xl font-black text-white mt-2">Checkout</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[var(--text-dark)] mb-6">Datos de inscripción</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="hidden" aria-hidden="true">
                    <label>
                      Sitio web
                      <input
                        type="text"
                        name="website"
                        value={datos.website}
                        onChange={handleDatos}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Nombre completo *</label>
                      <input name="nombre" value={datos.nombre} onChange={handleDatos} required
                        className="form-control" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">RUT *</label>
                      <input name="rut" value={datos.rut} onChange={handleDatos} required
                        className="form-control" placeholder="12.345.678-9" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Email *</label>
                      <input type="email" name="email" value={datos.email} onChange={handleDatos} required
                        className="form-control" placeholder="tu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Teléfono</label>
                      <input name="telefono" value={datos.telefono} onChange={handleDatos}
                        className="form-control" placeholder="+56 9 0000 0000" />
                    </div>
                  </div>

                  {/* Discount code */}
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Código de descuento</label>
                    <div className="flex gap-2">
                      <input
                        value={codigoDesc}
                        onChange={e => { setCodigoDesc(e.target.value); setDescError(''); setDescuento(null) }}
                        className="form-control flex-1"
                        placeholder="Ingresa tu código"
                      />
                      <button type="button" onClick={aplicarDescuento} disabled={validandoDesc || !codigoDesc.trim()}
                        className="btn-ghost px-4 shrink-0 disabled:opacity-50">
                        {validandoDesc ? <span className="material-icons animate-spin text-sm">refresh</span> : 'Aplicar'}
                      </button>
                    </div>
                    {descError && <p className="text-xs text-red-500 mt-1">{descError}</p>}
                    {descuento && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="material-icons text-xs">check_circle</span>
                        Descuento aplicado: -{fmt(descuentoMonto)}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <span className="material-icons text-sm">error</span>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading
                      ? <><span className="material-icons animate-spin text-sm">refresh</span>Redirigiendo a Getnet...</>
                      : <><span className="material-icons">lock</span>Pagar {fmt(totalFinal)} con Getnet</>
                    }
                  </button>

                  <p className="text-xs text-center text-[var(--text-muted)] flex items-center justify-center gap-1">
                    <span className="material-icons text-sm text-green-500">verified_user</span>
                    Serás redirigido al portal seguro de Getnet (Santander) para completar el pago.
                  </p>
                </form>
              </div>
            </div>

            {/* Order summary */}
            <aside className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[var(--border)] p-6 sticky top-20">
                <h2 className="font-bold text-[var(--text-dark)] mb-4">Tu pedido</h2>
                <div className="space-y-3 mb-4">
                  {items.map(i => (
                    <div key={i.id} className="flex gap-3">
                      {i.imagen && (
                        <img
                          src={i.imagen}
                          alt={i.titulo}
                          loading="lazy"
                          decoding="async"
                          onError={e => { e.currentTarget.src = COURSE_PLACEHOLDER }}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-dark)] line-clamp-2">{i.titulo}</p>
                        <p className="text-xs text-[var(--text-muted)]">{i.modalidad}</p>
                      </div>
                      <p className="text-sm font-bold shrink-0">{fmtPrice(i.precio)}</p>
                    </div>
                  ))}
                </div>

                {descuentoMonto > 0 && (
                  <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span>Descuento</span>
                    <span>-{fmt(descuentoMonto)}</span>
                  </div>
                )}

                <div className="border-t border-[var(--border)] pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-black text-[var(--primary)]">{fmt(totalFinal)}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)]">
                  <p className="flex items-center gap-1.5">
                    <span className="material-icons text-sm text-green-500">verified</span>
                    Certificado incluido al completar el curso
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="material-icons text-sm text-[var(--primary)]">receipt</span>
                    Factura/boleta disponible
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="material-icons text-sm text-[var(--accent)]">savings</span>
                    Franquicia SENCE para empresas
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
