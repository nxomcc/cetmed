import { createContext, useContext, useEffect, useReducer } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'cetmed_cart'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const exists = state.find(i => i.id === action.item.id)
      if (exists) return state
      return [...state, { ...action.item, qty: 1 }]
    }
    case 'REMOVE':
      return state.filter(i => i.id !== action.id)
    case 'CLEAR':
      return []
    case 'INIT':
      return action.payload
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      dispatch({ type: 'INIT', payload: saved })
    } catch (_) {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem    = item => dispatch({ type: 'ADD', item })
  const removeItem = id   => dispatch({ type: 'REMOVE', id })
  const clearCart  = ()   => dispatch({ type: 'CLEAR' })
  const inCart     = id   => items.some(i => i.id === id)
  const total      = items.reduce((sum, i) => sum + (i.precio || 0) * i.qty, 0)
  const count      = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, inCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export default CartContext
