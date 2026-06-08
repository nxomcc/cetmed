import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { consultarPagoGetnet } from '../services/api'
import useCart from '../hooks/useCart'
import SectionLabel from '../components/ui/SectionLabel'

export default function CheckoutRetorno() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const { clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null) // 'completado' | 'rechazado' | 'pendiente'
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('No se encontró el identificador del pedido.')
      setLoading(false)
      return
    }

    let attempts = 0
    const maxAttempts = 3

    async function checkStatus() {
      try {
        const data = await consultarPagoGetnet(orderId)
        setStatus(data.status)

        if (data.status === 'completado') {
          clearCart()
        } else if (data.status === 'pendiente' && attempts < maxAttempts) {
          // Retry after 3 seconds (Getnet may take a moment to process)
          attempts++
          setTimeout(checkStatus, 3000)
          return
        }
      } catch {
        setError('No pudimos verificar el estado de tu pago. Contacta soporte si el cobro se realizó.')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 px-4">
        <span className="material-icons animate-spin text-5xl text-[var(--primary)]">refresh</span>
        <p className="text-lg font-semibold text-[var(--text-dark)]">Verificando tu pago...</p>
        <p className="text-sm text-[var(--text-muted)]">Esto puede tomar unos segundos.</p>
      </div>
    )
  }

  if (error) {
    return (
      <>
        <section className="page-hero">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <SectionLabel><span className="text-white/70">Resultado del pago</span></SectionLabel>
            <h1 className="text-4xl font-black text-white mt-2">Estado de tu compra</h1>
          </div>
        </section>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5 px-4 text-center py-16">
          <span className="material-icons text-6xl text-amber-500">warning</span>
          <h2 className="text-2xl font-black text-[var(--text-dark)]">No pudimos verificar tu pago</h2>
          <p className="text-[var(--text-muted)] max-w-md">{error}</p>
          <div className="flex gap-3 mt-4">
            <Link to="/contacto" className="btn-primary">
              <span className="material-icons text-sm">support_agent</span>
              Contactar soporte
            </Link>
            <Link to="/" className="btn-ghost">Volver al inicio</Link>
          </div>
        </div>
      </>
    )
  }

  if (status === 'completado') {
    return (
      <>
        <section className="page-hero">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <SectionLabel><span className="text-white/70">Pago exitoso</span></SectionLabel>
            <h1 className="text-4xl font-black text-white mt-2">¡Gracias por tu compra!</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-10 shadow-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-4xl text-green-600">check_circle</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text-dark)] mb-3">Pago aprobado</h2>
              <p className="text-[var(--text-body)] mb-2">
                Tu inscripción ha sido procesada exitosamente.
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-8">
                Número de pedido: <span className="font-bold text-[var(--primary)]">#{orderId}</span>
              </p>

              <div className="bg-[var(--bg-light)] rounded-xl p-5 mb-8 text-left space-y-3">
                <p className="flex items-center gap-2 text-sm">
                  <span className="material-icons text-sm text-green-500">email</span>
                  Recibirás un correo de confirmación con los detalles de tu inscripción.
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span className="material-icons text-sm text-[var(--primary)]">verified</span>
                  Tu certificado estará disponible al completar el curso.
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <span className="material-icons text-sm text-[var(--accent)]">receipt</span>
                  Puedes solicitar factura o boleta contactando a soporte.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/cursos" className="btn-primary justify-center">
                  <span className="material-icons text-sm">school</span>
                  Ver más cursos
                </Link>
                <Link to="/" className="btn-ghost justify-center">Volver al inicio</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (status === 'rechazado') {
    return (
      <>
        <section className="page-hero">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <SectionLabel><span className="text-white/70">Resultado del pago</span></SectionLabel>
            <h1 className="text-4xl font-black text-white mt-2">Pago no procesado</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-10 shadow-sm">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-4xl text-red-500">cancel</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text-dark)] mb-3">Pago rechazado</h2>
              <p className="text-[var(--text-body)] mb-8">
                La transacción no pudo ser completada. Esto puede ocurrir por fondos insuficientes,
                datos incorrectos o una restricción de tu banco. No se realizó ningún cobro.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/carrito" className="btn-primary justify-center">
                  <span className="material-icons text-sm">replay</span>
                  Intentar nuevamente
                </Link>
                <Link to="/contacto" className="btn-ghost justify-center">
                  <span className="material-icons text-sm">support_agent</span>
                  Contactar soporte
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  // status === 'pendiente'
  return (
    <>
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionLabel><span className="text-white/70">Resultado del pago</span></SectionLabel>
          <h1 className="text-4xl font-black text-white mt-2">Pago en proceso</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-10 shadow-sm">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-4xl text-amber-500">schedule</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--text-dark)] mb-3">Tu pago está siendo procesado</h2>
            <p className="text-[var(--text-body)] mb-2">
              La transacción aún no ha sido confirmada por Getnet.
            </p>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              Pedido: <span className="font-bold">#{orderId}</span> — Te notificaremos por correo cuando se confirme.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="btn-primary justify-center">Volver al inicio</Link>
              <Link to="/contacto" className="btn-ghost justify-center">Contactar soporte</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
