import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('guide_cart') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('guide_cart', JSON.stringify(items))
  }, [items])

  const addItem = (guide) => {
    setItems(prev => prev.find(i => i.id === guide.id) ? prev : [...prev, guide])
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.price, 0)

  const hasItem = (id) => items.some(i => i.id === id)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, hasItem, count: items.length }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
