'use client'

import { CartProvider } from "@/context/CartContext"
import { FavoritesProvider } from "@/context/FavoritesContext"

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <FavoritesProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </FavoritesProvider>
  )
}
