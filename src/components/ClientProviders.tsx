'use client'

import { CartProvider } from "@/context/CartContext"

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
