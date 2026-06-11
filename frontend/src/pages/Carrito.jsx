import { Link } from 'react-router-dom'
import useCart from '../hooks/useCart'
import SectionLabel from '../components/ui/SectionLabel'
import { COURSE_PLACEHOLDER, fmtPrice } from '../utils/courseDisplay'

export default function Carrito() {
  const { items, removeItem, clearCart, total } = useCart()

  if (items.length === 0) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <span className="material-icons text-6xl text-[var(--text-muted)]">shopping_cart</span>
      <h1 className="text-2xl font-black text-[var(--text-dark)]">Tu carrito está vacío</h1>
      <p className="text-[var(--text-muted)]">Aún no has añadido ningún curso.</p>
      <Link to="/cursos" className="btn-primary">
        <span className="material-icons">school</span>
        Ver catálogo
      </Link>
    </div>
  )

  return (
    <>
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <SectionLabel><span className="text-white/70">Tu selección</span></SectionLabel>
          <h1 className="text-4xl font-black text-white mt-2">Carrito</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id}
                  className="flex gap-4 p-5 bg-white rounded-2xl border border-[var(--border)] shadow-card">
                  {item.imagen && (
                    <img src={item.imagen} alt={item.titulo} loading="lazy" decoding="async"
                      onError={e => { e.currentTarget.src = COURSE_PLACEHOLDER }}
                      className="w-24 h-24 object-cover rounded-xl shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-dark)] leading-tight mb-1">{item.titulo}</h3>
                    <span className="tag text-xs">{item.modalidad}</span>
                    <p className="mt-2 font-black text-[var(--primary)] text-xl">{fmtPrice(item.precio)}</p>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    className="shrink-0 p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors self-start">
                    <span className="material-icons">delete_outline</span>
                  </button>
                </div>
              ))}

              <button onClick={clearCart} className="btn-ghost text-sm text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300">
                <span className="material-icons text-sm">delete_sweep</span>
                Vaciar carrito
              </button>
            </div>

            {/* Summary */}
            <aside>
              <div className="bg-white rounded-2xl border-2 border-[var(--primary)] p-6 sticky top-20">
                <h2 className="font-bold text-[var(--text-dark)] text-lg mb-5">Resumen del pedido</h2>

                <div className="space-y-2 mb-4">
                  {items.map(i => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)] line-clamp-1 flex-1 mr-2">{i.titulo}</span>
                      <span className="font-semibold shrink-0">{fmtPrice(i.precio)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] pt-4 mb-5 flex justify-between items-center">
                  <span className="text-[var(--text-muted)] text-sm">Total</span>
                  <span className="text-2xl font-black text-[var(--primary)]">{fmtPrice(total)}</span>
                </div>

                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Valores incluyen IVA. Franquicia SENCE disponible para empresas.
                </p>

                <Link to="/checkout" className="btn-primary w-full justify-center text-base py-3">
                  <span className="material-icons">lock</span>
                  Proceder al pago
                </Link>

                <Link to="/cursos" className="btn-ghost w-full justify-center mt-3 text-sm">
                  <span className="material-icons text-sm">add</span>
                  Agregar más cursos
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
