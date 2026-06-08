import { Link } from 'react-router-dom'
import useCart from '../../hooks/useCart'

function fmt(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)
}

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, total } = useCart()

  return (
    <aside className={`cart-drawer${open ? ' open' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="material-icons text-[var(--primary)]">shopping_cart</span>
          <h2 className="font-bold text-[var(--text-dark)]">Tu carrito</h2>
          <span className="tag">{items.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="material-icons text-[var(--text-muted)]">close</span>
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
            <span className="material-icons text-5xl text-[var(--text-muted)]">shopping_cart</span>
            <p className="text-[var(--text-muted)]">Tu carrito está vacío</p>
            <button onClick={onClose} className="btn-ghost text-sm">
              Ver cursos
            </button>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-light)]">
              {item.imagen && (
                <img src={item.imagen} alt={item.titulo} loading="lazy" decoding="async"
                  className="w-16 h-16 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[var(--text-dark)] leading-tight line-clamp-2 mb-1">
                  {item.titulo}
                </h3>
                {item.modalidad && (
                  <span className="tag text-xs mb-2 inline-block">{item.modalidad}</span>
                )}
                <p className="font-bold text-[var(--primary)]">{fmt(item.precio)}</p>
              </div>
              <button onClick={() => removeItem(item.id)}
                className="shrink-0 p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <span className="material-icons text-sm">delete_outline</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-5 py-5 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Subtotal</span>
            <span className="font-bold text-lg text-[var(--text-dark)]">{fmt(total)}</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Los valores incluyen IVA. Franquicia SENCE disponible.
          </p>
          <Link to="/checkout" onClick={onClose}
            className="btn-primary w-full justify-center text-base">
            <span className="material-icons text-base">lock</span>
            Proceder al pago
          </Link>
          <Link to="/carrito" onClick={onClose}
            className="btn-ghost w-full justify-center">
            Ver carrito completo
          </Link>
        </div>
      )}
    </aside>
  )
}
