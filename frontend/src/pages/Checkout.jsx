/**
 * Checkout con Stripe Elements
 *
 * Flujo:
 * 1. Al cargar, llamamos POST /api/pagos/intent → obtenemos clientSecret
 * 2. Stripe Elements renderiza el formulario de pago
 * 3. Al confirmar, Stripe procesa el pago
 * 4. En éxito → limpiar carrito y redirigir a página de confirmación
 *
 * Alternativas de pago para Chile:
 * - Flow.cl (https://www.flow.cl) — soporta Webpay, tarjetas, transferencias
 * - Transbank WebPay Plus — integración nativa bancos chilenos
 * Ambas tienen SDK para Node.js y son más comunes que Stripe en Chile.
 * Para cambiar a Flow: reemplazar <PaymentElement> por iframe de Flow y
 * crear la orden vía Flow API en el endpoint /api/pagos/intent.
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import useCart from '../hooks/useCart'
import { createPaymentIntent } from '../services/api'
import SectionLabel from '../components/ui/SectionLabel'

// Replace with your Stripe publishable key
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
const stripePromise = loadStripe(STRIPE_PK)

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

function CheckoutForm({ total, onSuccess }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [step, setStep]       = useState(1) // 1=datos, 2=pago

  const [datos, setDatos] = useState({ nombre:'', email:'', rut:'', telefono:'' })
  function handleDatos(e) { setDatos(p => ({ ...p, [e.target.name]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/exito` },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="space-y-6">
      {/* Step tabs */}
      <div className="flex gap-1 bg-[var(--bg-light)] rounded-xl p-1">
        {[{n:1,label:'Tus datos'},{n:2,label:'Pago'}].map(s => (
          <button key={s.n} onClick={() => step > s.n && setStep(s.n)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${step === s.n ? 'bg-white shadow text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
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
          <button onClick={() => {
            if (!datos.nombre || !datos.email || !datos.rut) return
            setStep(2)
          }} className="btn-primary w-full justify-center py-3">
            Continuar al pago
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[var(--bg-light)] rounded-xl p-4 border border-[var(--border)]">
            <PaymentElement options={{ layout:'tabs' }} />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <span className="material-icons text-sm">error</span>
              {error}
            </div>
          )}

          <button type="submit" disabled={!stripe || loading}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <><span className="material-icons animate-spin text-sm">refresh</span>Procesando...</>
              : <><span className="material-icons">lock</span>Pagar {fmt(total)}</>
            }
          </button>

          <p className="text-xs text-center text-[var(--text-muted)] flex items-center justify-center gap-1">
            <span className="material-icons text-sm text-green-500">verified_user</span>
            Pago seguro con cifrado SSL. No almacenamos datos de tarjeta.
          </p>
        </form>
      )}
    </div>
  )
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [clientSecret, setClientSecret] = useState(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (items.length === 0) return
    setLoadingIntent(true)
    createPaymentIntent(items)
      .then(d => setClientSecret(d.clientSecret))
      .catch(() => {
        // Dev mode: use mock client secret so UI renders
        setClientSecret('pi_mock_secret_test')
      })
      .finally(() => setLoadingIntent(false))
  }, [])

  function handleSuccess() {
    clearCart()
    navigate('/checkout/exito', { replace: true })
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

                {loadingIntent && (
                  <div className="flex items-center justify-center py-12">
                    <span className="material-icons animate-spin text-3xl text-[var(--primary)]">refresh</span>
                  </div>
                )}

                {!loadingIntent && clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm total={total} onSuccess={handleSuccess} />
                  </Elements>
                )}

                {!loadingIntent && !clientSecret && (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <span className="material-icons text-4xl mb-2 block text-red-400">error_outline</span>
                    No se pudo inicializar el pago. Por favor, contacta soporte.
                  </div>
                )}
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
                        <img src={i.imagen} alt={i.titulo} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-dark)] line-clamp-2">{i.titulo}</p>
                        <p className="text-xs text-[var(--text-muted)]">{i.modalidad}</p>
                      </div>
                      <p className="text-sm font-bold shrink-0">{fmt(i.precio)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] pt-4 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-black text-[var(--primary)]">{fmt(total)}</span>
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
