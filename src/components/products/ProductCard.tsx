import Link from 'next/link'
import { clsx } from 'clsx'
import { formatPrice, formatVolume, formatWeight, formatGender, getImageUrl } from '@/lib/api'
import type { Perfume, Pigment } from '@/types/api'

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
    return (
        <Link
            href={`/products/${product.id}`}
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

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
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

                <div className="absolute top-4 right-4">
                    <span
                        className={clsx(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm',
                            product.productType === 'perfume'
                                ? 'bg-primary/20 text-white border border-white/20'
                                : 'bg-amber-500/20 text-white border border-white/20'
                        )}
                    >
                        {TYPE_LABELS[product.productType]}
                    </span>
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
                        <p className="text-xl font-bold text-primary">
                            {formatPrice(product.price)}
                        </p>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                            →
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
