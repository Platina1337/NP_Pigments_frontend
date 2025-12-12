'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { formatPrice, formatVolume, formatWeight, formatGender, getImageUrl } from '@/lib/api'
import { getPriceInfo } from '@/lib/product-pricing'
import type { Perfume, Pigment } from '@/types/api'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import { Check, ShoppingBag } from 'lucide-react'

export type CatalogProduct = (Perfume & { productType: 'perfume' }) | (Pigment & { productType: 'pigment' })

const TYPE_LABELS: Record<string, string> = {
    perfume: 'Парфюмы',
    pigment: 'Пигменты',
}

const APPLICATION_LABELS: Record<string, string> = {
    cosmetics: 'Косметика',
    art: 'Арт-проекты',
    industrial: 'Индустрия',
    food: 'Пищевой стандарт',
}

interface ProductCardProps {
    product: CatalogProduct
    isRecent?: boolean
}

export function ProductCard({ product, isRecent }: ProductCardProps) {
    const { currentPrice, originalPrice, hasDiscount } = getPriceInfo(product)
    const { toggleFavorite, isFavorite } = useFavorites()
    const { addItem, state } = useCart()
    const [pending, setPending] = useState(false)
    const [adding, setAdding] = useState(false)
    const [justAdded, setJustAdded] = useState(false)
    const favorite = isFavorite(product.id, product.productType)
    const discountPercent =
        hasDiscount && originalPrice > 0
            ? Math.max(1, Math.round((1 - currentPrice / originalPrice) * 100))
            : null
    const inCart = state.items.some(
        (item) => item.perfume.id === product.id && item.productType === product.productType
    )

    const onToggleFavorite = async (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        if (pending) return
        setPending(true)
        try {
            await toggleFavorite({
                id: product.id,
                productType: product.productType,
                name: product.name,
                image: product.image,
                price: currentPrice,
                data: product,
            })
        } finally {
            setPending(false)
        }
    }

    return (
        <Link
            href={`/products/${product.slug || product.id}`}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-card border border-black/10 dark:border-border/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary/20">
                <img
                    src={getImageUrl(product.image || '')}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badges row */}
                <div className="absolute top-4 left-4 right-16 flex items-center justify-between gap-3 pointer-events-none">
                    <div className="flex flex-wrap items-center gap-2">
                        {hasDiscount && (
                            <span className="inline-flex items-center rounded-full bg-red-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                {discountPercent ? `-${discountPercent}%` : 'Скидка'}
                            </span>
                        )}
                        {product.featured && (
                            <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                                ★ Выбор
                            </span>
                        )}
                        {isRecent && (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                New
                            </span>
                        )}
                    </div>
                    <span
                        className={clsx(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm pointer-events-auto',
                            product.productType === 'perfume'
                                ? 'bg-primary/20 text-white border border-white/20'
                                : 'bg-amber-500/20 text-white border border-white/20'
                        )}
                    >
                        {TYPE_LABELS[product.productType]}
                    </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                        aria-label="Добавить в избранное"
                        onClick={onToggleFavorite}
                        className={clsx(
                            'flex h-10 w-10 items-center justify-center rounded-full border transition-all backdrop-blur-sm',
                            favorite
                                ? 'bg-primary text-white border-primary'
                                : 'bg-black/40 text-white border-white/20 hover:border-primary hover:text-primary'
                        )}
                        disabled={pending}
                    >
                        <Heart className={clsx('h-5 w-5', favorite && 'fill-white')} />
                    </button>
                </div>

                {/* Status badge (bottom left) */}
                {!product.in_stock && (
                    <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-flex items-center justify-center w-full rounded-xl bg-black/70 backdrop-blur-md border border-white/10 py-2 text-xs font-medium text-white">
                            Ожидается поступление
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 font-medium mb-1.5">
                        {product.brand?.name ?? 'Без бренда'}
                    </p>
                    <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                        {product.name}
                    </h3>
                    {product.sku && (
                        <p className="text-xs text-foreground/50 mt-1">SKU: {product.sku}</p>
                    )}
                </div>

                <div className="mt-auto space-y-4">
                    {/* Specs grid */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-black/15 dark:border-primary/30 pt-4">
                        {product.productType === 'perfume' ? (
                            <>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-foreground/40">Объем</p>
                                    <p className="text-sm font-medium text-foreground/80">{formatVolume(product.volume_ml)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-foreground/40">Гендер</p>
                                    <p className="text-sm font-medium text-foreground/80">{formatGender(product.gender)}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-foreground/40">Вес</p>
                                    <p className="text-sm font-medium text-foreground/80">{formatWeight(product.weight_gr)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-foreground/40">Тип</p>
                                    <p className="text-sm font-medium text-foreground/80 truncate">
                                        {APPLICATION_LABELS[product.application_type] || product.application_type}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            {/* Show price range for multi-volume/weight products */}
                            {((product.productType === 'perfume' && product.has_multiple_volumes) ||
                                (product.productType === 'pigment' && 'has_multiple_weights' in product && product.has_multiple_weights)) ? (
                                <p className="text-xl font-bold text-primary">
                                    от {formatPrice(product.min_price ?? currentPrice)}
                                </p>
                            ) : (
                                <>
                                    <p className="text-xl font-bold text-primary">
                                        {formatPrice(currentPrice)}
                                    </p>
                                    {hasDiscount && (
                                        <span className="text-sm line-through text-foreground/50">
                                            {formatPrice(originalPrice as unknown as number)}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                        <button
                            aria-label={inCart || justAdded ? 'Уже в корзине' : 'Добавить в корзину'}
                            className={clsx(
                                'h-10 w-10 rounded-full text-white flex items-center justify-center transition-all duration-200 shadow-md',
                                'bg-primary hover:bg-primary/90',
                                adding ? 'opacity-80 scale-95' : 'hover:scale-105 active:scale-95'
                            )}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (adding) return
                                setAdding(true)
                                try {
                                    addItem(product as unknown as Perfume, product.productType)
                                    setJustAdded(true)
                                    setTimeout(() => setJustAdded(false), 1200)
                                } finally {
                                    setTimeout(() => setAdding(false), 200)
                                }
                            }}
                        >
                            {inCart || justAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
