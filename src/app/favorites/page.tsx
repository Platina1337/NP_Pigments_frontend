'use client'

import { FavoriteProducts } from '@/components/profile/FavoriteProducts'

export default function FavoritesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/50">Избранное</p>
        <h1 className="text-3xl font-bold text-foreground">Любимые ароматы и пигменты</h1>
        <p className="text-foreground/60 text-sm">
          Синхронизируется между устройствами — добавляйте в корзину или очищайте список.
        </p>
      </div>
      <FavoriteProducts />
    </div>
  )
}

