'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Stars, ShoppingBag, Check, ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import { useFeaturedProducts, saveBreadcrumbPath, type FeaturedItem, usePromotions, useTrending } from '@/lib/swr-hooks'
import { formatPrice, getImageUrl } from '@/lib/api'
import { getPriceInfo } from '@/lib/product-pricing'
import { useScrollAnimation, useScrollFade } from '@/lib/useScrollAnimation'
import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import FeedbackModal from '@/components/FeedbackModal'
import { ProductCard } from '@/components/products/ProductCard'

export default function Home() {
  const { featuredProducts } = useFeaturedProducts()
  const { theme } = useTheme()
  const { addItem, state: cartState } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [addingId, setAddingId] = useState<number | null>(null)
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(new Set())
  const { promotions: promotionsSlot1, isLoading: promo1Loading } = usePromotions({ slot: 'homepage_deals_1', active: 'true' })
  const { promotions: promotionsSlot2, isLoading: promo2Loading } = usePromotions({ slot: 'homepage_deals_2', active: 'true' })
  const { promotions: promotionsSlot3, isLoading: promo3Loading } = usePromotions({ slot: 'homepage_deals_3', active: 'true' })
  const { trending, isLoading: trendingLoading } = useTrending()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

  // Scroll animations for different sections
  const heroAnimation = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    exitAnimation: false // Hero section doesn't use exit animation
  })
  const categoriesAnimation = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
    exitAnimation: false // Hero section elements don't use exit animation
  })
  const ctaAnimation = useScrollAnimation<HTMLDivElement>({
    threshold: 0.3,
    exitAnimation: false // Hero section elements don't use exit animation
  })

  // All other sections use default exit animation settings
  const trendingHeaderAnimation = useScrollAnimation<HTMLDivElement>()
  const trendingProductsAnimation = useScrollAnimation<HTMLDivElement>()
  const excellenceHeaderAnimation = useScrollAnimation<HTMLDivElement>()
  const excellenceCardsAnimation = useScrollAnimation<HTMLDivElement>()
  const excellenceTrustIndicatorsAnimation = useScrollAnimation<HTMLDivElement>()
  const journeyHeaderAnimation = useScrollAnimation<HTMLDivElement>()
  const journeyCardsAnimation = useScrollAnimation<HTMLDivElement>()
  const journeyWhyChooseAnimation = useScrollAnimation<HTMLDivElement>()
  const journeyMetricsAnimation = useScrollAnimation<HTMLDivElement>()
  const journeyCtaAnimation = useScrollAnimation<HTMLDivElement>({
    threshold: 0.05, // Very low threshold for immediate visibility
    exitAnimation: false // This block should not exit animation - stay visible
  })
  const journeyAdvantagesAnimation = useScrollAnimation<HTMLDivElement>()
  const testimonialsHeaderAnimation = useScrollAnimation<HTMLDivElement>()
  const testimonialsCardsAnimation = useScrollAnimation<HTMLDivElement>()
  const testimonialsStatsAnimation = useScrollAnimation<HTMLDivElement>()
  const finalCtaHeaderAnimation = useScrollAnimation<HTMLDivElement>()
  const finalCtaCardsAnimation = useScrollAnimation<HTMLDivElement>()
  const finalCtaTrustIndicatorsAnimation = useScrollAnimation<HTMLDivElement>()

  // Fade animations for hero elements when scrolling up
  const logoFade = useScrollFade<HTMLDivElement>(150)
  const titleFade = useScrollFade<HTMLDivElement>(150)
  const subtitleFade = useScrollFade<HTMLParagraphElement>(150)
  const aromatyFade = useScrollFade<HTMLDivElement>(150)
  const bystryiStartFade = useScrollFade<HTMLDivElement>(150)

  const getProductLink = useCallback((item: FeaturedItem) => {
    return `/products/${item.slug || item.id}`
  }, [])

  const handleProductClick = useCallback((item: FeaturedItem) => {
    // Сохраняем breadcrumb путь для главной страницы: Главная > Товар
    const breadcrumbPath: Array<{ label: string; href: string }> = [];
    saveBreadcrumbPath(breadcrumbPath);
  }, [])

  const getProductPriceInfo = useCallback((item: FeaturedItem) => {
    const { currentPrice, originalPrice, hasDiscount } = getPriceInfo(item as any)
    const discountPercent =
      hasDiscount && originalPrice > 0
        ? Math.max(1, Math.round((1 - currentPrice / originalPrice) * 100))
        : null

    return {
      current: formatPrice(currentPrice),
      original: formatPrice(originalPrice),
      hasDiscount: hasDiscount && originalPrice > currentPrice,
      discountPercent,
    }
  }, [])

  const getProductVolume = useCallback((item: FeaturedItem) => {
    return item.type === 'perfume'
      ? `${item.volume_ml} мл`
      : `${item.weight_gr} г`
  }, [])

  const mapPromoProducts = useCallback((promo: any) => {
    const perfumes = (promo.perfumes || []).map((p: any) => ({ ...p, productType: 'perfume' as const }))
    const pigments = (promo.pigments || []).map((p: any) => ({ ...p, productType: 'pigment' as const }))
    return [...perfumes, ...pigments]
  }, [])

  const trendingProducts = useMemo(() => {
    if (!trending) return []
    return trending
      .map((item: any) => {
        if (!item?.product) return null
        return { ...item.product, productType: item.product_type }
      })
      .filter(Boolean)
  }, [trending])


  const renderPromoBlock = useCallback(
    (promos: any[], loading: boolean, fallbackTitle: string) => {
      if (loading) {
        return (
          <section className="py-20 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#D4A373]/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse h-12 w-64 bg-primary/10 rounded-xl mb-8" />
              <div className="flex space-x-6 overflow-hidden">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="flex-shrink-0 w-80 h-96 bg-muted/40 rounded-3xl animate-pulse" />
                ))}
              </div>
            </div>
          </section>
        )
      }
      const promoList = Array.isArray(promos) ? promos.filter(Boolean) : []
      if (promoList.length === 0) return null

      // Collect all products from all promos into a single array, limit to 6
      const allPromoProducts = promoList
        .flatMap(promo => mapPromoProducts(promo))
        .slice(0, 6)


      return (
        <section className="py-20 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#D4A373]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#6B9999]/10 via-transparent to-transparent rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header with enhanced design */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-[#D4A373]/10 border border-primary/20 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-[#D4A373] rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">Эксклюзивные акции</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Восточные
                <span className="bg-gradient-to-r from-primary via-[#6B9999] to-[#D4A373] bg-clip-text text-transparent"> скидки</span>
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                Специальные предложения от лучших брендов. Экономьте до 30% на премиум парфюмерии
              </p>
            </div>

            {/* Swiper carousel promo cards */}
            <div className="relative">
              {/* Navigation buttons */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <button className="swiper-button-prev-promo group w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300">
                  <ChevronLeft className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                <button className="swiper-button-next-promo group w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300">
                  <ChevronRight className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={24}
                slidesPerView={1.2}
                loop={allPromoProducts.length > 3}
                speed={800}
                navigation={{
                  nextEl: '.swiper-button-next-promo',
                  prevEl: '.swiper-button-prev-promo',
                }}
                pagination={{
                  el: '.swiper-pagination-promo',
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  stopOnLastSlide: false,
                  waitForTransition: true,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 2.2,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                  },
                  1280: {
                    slidesPerView: 3.5,
                    spaceBetween: 28,
                  },
                }}
                className="!pb-12"
              >
                {allPromoProducts.map((product: any, index) => (
                  <SwiperSlide key={`${product.productType}-${product.id}`} className="!h-auto">
                    <div className="group h-full">
                      <div className="relative bg-gradient-to-br from-card/95 via-card/90 to-card/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl border border-white/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col">

                        {/* Product image */}
                        <div className="relative aspect-square overflow-hidden">
                          <Link href={`/products/${product.slug || product.id}`} className="block h-full">
                            <img
                              src={getImageUrl(product.image || '')}
                              alt={product.name || product.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-perfume.svg';
                              }}
                            />
                          </Link>

                          {/* Overlay gradient on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {/* Action buttons */}
                          <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              aria-label="Добавить в избранное"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const key = `${product.productType}-${product.id}`;
                                if (pendingFavorites.has(key)) return;
                                setPendingFavorites(prev => new Set(prev).add(key));
                                try {
                                  await toggleFavorite({
                                    id: product.id,
                                    productType: product.productType,
                                    name: product.name || product.title,
                                    image: product.image,
                                    price: product.current_price || product.price,
                                    data: product,
                                  });
                                } finally {
                                  setPendingFavorites(prev => {
                                    const next = new Set(prev);
                                    next.delete(key);
                                    return next;
                                  });
                                }
                              }}
                              disabled={pendingFavorites.has(`${product.productType}-${product.id}`)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm border border-white/20 transition-colors duration-200 shadow-lg ${
                                isFavorite(product.id, product.productType)
                                  ? 'text-red-500'
                                  : 'text-gray-700 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`h-5 w-5 ${isFavorite(product.id, product.productType) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              aria-label="Добавить в корзину"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (addingId === product.id) return;
                                setAddingId(product.id);
                                try {
                                  addItem(product, product.productType);
                                } finally {
                                  setTimeout(() => setAddingId(null), 1000);
                                }
                              }}
                              disabled={addingId === product.id}
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors duration-200 shadow-lg ${
                                addingId === product.id
                                  ? 'bg-green-500'
                                  : 'bg-primary hover:bg-primary/90'
                              }`}
                            >
                              {addingId === product.id ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                            </button>
                          </div>

                          {/* Discount badge */}
                          {(product.current_price || product.price) && (product.original_price || product.old_price) && (
                            <div className="absolute top-4 left-4">
                              <div className="relative">
                                <div className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                                  -{Math.round(((product.original_price || product.old_price) - (product.current_price || product.price)) / (product.original_price || product.old_price) * 100)}%
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status badge */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm ${
                                product.productType === 'perfume'
                                  ? 'bg-primary/20 text-white border border-white/20'
                                  : 'bg-amber-500/20 text-white border border-white/20'
                              }`}>
                                {product.productType === 'perfume' ? 'Парфюм' : 'Пигмент'}
                              </span>
                              {!product.in_stock && (
                                <span className="inline-flex items-center rounded-full bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 text-xs font-medium text-white">
                                  Нет в наличии
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="flex-1 flex flex-col p-6">
                          <div className="mb-4">
                            <Link href={`/products/${product.slug || product.id}`}>
                              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 font-medium mb-1.5">
                                {product.brand?.name || 'Бренд'}
                              </p>
                              <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                {product.name || product.title}
                              </h3>
                            </Link>
                          </div>

                          <div className="mt-auto">
                            {/* Specs */}
                            <div className="mb-4 text-sm text-foreground/60">
                              {product.productType === 'perfume'
                                ? `${product.volume_ml} мл`
                                : `${product.weight_gr} г`
                              }
                            </div>

                            {/* Pricing */}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xl font-bold text-primary">
                                  {formatPrice(product.current_price || product.price)}
                                </span>
                                {(product.original_price || product.old_price) && (
                                  <span className="text-sm text-foreground/50 line-through">
                                    {formatPrice(product.original_price || product.old_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Pagination */}
              <div className="swiper-pagination-promo flex justify-center mt-6"></div>
            </div>
          </div>
        </section>
      )
    },
    [mapPromoProducts]
  )

  // New creative product cards
  const creativeProductCards = useMemo(() => {
    if (trendingLoading || !trendingProducts.length) {
      return (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E8F3F3] border-t-[#3B7171]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#E8F3F3] border-t-[#6B9999] animate-spin animation-reverse"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {trendingProducts.slice(0, 6).map((product: any, index) => (
          <ProductCard key={`${product.productType}-${product.id}`} product={product} />
        ))}
      </div>
    )
  }, [trendingProducts, trendingLoading])

  return (
    <div className="min-h-screen relative">
      {/* Hero Section - Первый экран с единым фоном */}
      <section ref={heroAnimation.ref} className="relative min-h-screen overflow-hidden">

        {/* Контейнер для контента */}
        <div className="relative z-10 flex items-center min-h-screen py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center space-y-6 sm:space-y-8">
              {/* Main Brand Visual */}
              <div className="mb-16">
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="relative w-48 h-48 flex items-center justify-center overflow-hidden">

                    {/* Орбитальная анимация */}
                    <div className="absolute inset-0 animate-hero-icon-orbit">
                      <div className="w-3 h-3 bg-primary rounded-full opacity-60"></div>
                    </div>
                    <div className="absolute inset-0 animate-hero-icon-orbit" style={{ animationDelay: '2s' }}>
                      <div className="w-2 h-2 bg-accent rounded-full opacity-40"></div>
                    </div>
                    <div className="absolute inset-0 animate-hero-icon-orbit" style={{ animationDelay: '4s' }}>
                      <div className="w-2.5 h-2.5 bg-secondary rounded-full opacity-50"></div>
                    </div>

                    {/* NP Logo Image */}
                    <div ref={logoFade.ref} className="animate-hero-icon-dynamic-flow relative z-10 opacity-0 scale-90" style={{
                      animation: 'heroFadeInScale 1.0s ease-out 0.1s forwards',
                      opacity: logoFade.opacity
                    }}>
                      <Image
                        src={theme === 'dark' ? '/np-logo-light.png' : '/np-logo-dark.png'}
                        alt="NP Perfumes Logo"
                        width={192}
                        height={192}
                        className="w-48 h-48 object-contain drop-shadow-lg"
                        priority
                      />
                    </div>
                  </div>
                </div>

                <div ref={titleFade.ref} className="opacity-0 scale-95" style={{
                  animation: 'heroFadeInScale 1.0s ease-out 0.3s forwards',
                  opacity: titleFade.opacity
                }}>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                    <span className="inline-block animate-logo-shimmer px-2 py-1 opacity-0 scale-95" style={{
                      animation: 'heroFadeInScale 1.0s ease-out 0.5s forwards'
                    }}>
                      NP Perfumes
                    </span>
                  </h1>
                  <p ref={subtitleFade.ref} className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 drop-shadow-lg opacity-0 scale-95" style={{
                    animation: 'heroFadeInScale 1.0s ease-out 0.7s forwards',
                    opacity: subtitleFade.opacity
                  }}>
                    Элитная парфюмерия и профессиональные пигменты премиум-класса
                  </p>
                </div>
              </div>

              {/* Creative Discovery Cards */}
              <div ref={categoriesAnimation.ref} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-8 max-w-7xl mx-auto mb-16 sm:mb-20">

                {/* Ароматы и Искусство */}
                <div ref={aromatyFade.ref} className="group relative lg:col-span-2 opacity-0 scale-95" style={{
                  animation: 'heroFadeInScale 1.0s ease-out 0.4s forwards',
                  opacity: aromatyFade.opacity
                }}>
                  <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-primary/10 to-[#D4A373]/15 p-8 sm:p-10 shadow-2xl backdrop-blur-xl transform group-hover:scale-[1.02] transition-all duration-700">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -left-10 top-0 w-44 h-44 bg-primary/20 blur-3xl"></div>
                      <div className="absolute right-0 bottom-0 w-56 h-56 bg-[#D4A373]/25 blur-3xl"></div>
                      <div className="absolute inset-0 opacity-70 mix-blend-overlay bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(212,163,115,0.16),transparent_30%),radial-gradient(circle_at_75%_70%,rgba(59,113,113,0.18),transparent_32%)]"></div>
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-[1.1fr,0.9fr] items-center gap-8 lg:gap-12">
                      <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-[0.12em]">
                          <Sparkles className="w-4 h-4" />
                          <span>NP Perfumes universe</span>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                            Ароматы и искусство
                          </h3>
                          <p className="text-base sm:text-lg text-foreground/70 leading-relaxed max-w-2xl">
                            Новые настроения, текстуры и палитры, которые объединяют парфюмерию и визуальное искусство. Картины из запахов, пигменты для сценического образа и смелые коллаборации.
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-foreground mb-1">Кураторские капсулы</p>
                            <p className="text-xs text-foreground/60">Подборки по настроению и сезону с готовыми сетами.</p>
                          </div>
                          <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-foreground mb-1">Арт-пигменты</p>
                            <p className="text-xs text-foreground/60">Текстуры для визажистов и художников без компромиссов.</p>
                          </div>
                          <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur px-4 py-3 shadow-sm">
                            <p className="text-sm font-semibold text-foreground mb-1">Лимитированные релизы</p>
                            <p className="text-xs text-foreground/60">Редкие ароматы и спецвыпуски, которые не повторяются.</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href="/products"
                            className="group/btn inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:translate-y-[-1px] shadow-lg shadow-primary/25 text-sm"
                          >
                            <svg className="w-5 h-5 mr-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Смотреть коллекцию</span>
                          </Link>
                          <Link
                            href="#trending"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border/60 bg-card/70 text-foreground font-semibold hover:border-primary/60 hover:text-primary transition-all duration-300 transform hover:translate-y-[-1px] text-sm"
                          >
                            <svg className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            </svg>
                            <span>Что сейчас в тренде</span>
                          </Link>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#D4A373] flex items-center justify-center text-white shadow-md">
                              <Stars className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">Сцены и истории</p>
                              <p className="font-semibold text-foreground leading-snug">Вдохновение через запах и цвет</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-foreground/50">Обновления</p>
                            <p className="text-lg font-bold text-primary">каждую неделю</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary font-semibold flex items-center justify-center">01</div>
                            <div>
                              <p className="font-semibold text-foreground">Слушайте атмосферу</p>
                              <p className="text-sm text-foreground/60">Тонкие композиции для разных настроений — от камерных вечеров до яркой сцены.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#6B9999]/20 text-[#3B7171] font-semibold flex items-center justify-center">02</div>
                            <div>
                              <p className="font-semibold text-foreground">Соберите сет</p>
                              <p className="text-sm text-foreground/60">Скомбинируйте аромат, пигмент и аксессуары, чтобы создать цельный образ.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#D4A373]/20 text-[#D4A373] font-semibold flex items-center justify-center">03</div>
                            <div>
                              <p className="font-semibold text-foreground">Покажите миру</p>
                              <p className="text-sm text-foreground/60">Получите рекомендации стилистов NP и оформите заказ без лишних кликов.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions CTA */}
                <div ref={ctaAnimation.ref} className="group relative opacity-0 scale-95" style={{
                  animation: 'heroFadeInScale 1.0s ease-out 0.6s forwards',
                  opacity: bystryiStartFade.opacity
                }}>
                  <div ref={bystryiStartFade.ref} className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-card to-primary/10 p-6 sm:p-8 shadow-2xl transform group-hover:scale-[1.02] transition-all duration-700 h-full">
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute -top-6 right-4 w-28 h-28 bg-primary/20 blur-2xl"></div>
                      <div className="absolute bottom-0 left-2 w-32 h-32 bg-[#D4A373]/25 blur-3xl"></div>
                      <div className="absolute inset-0 opacity-60 mix-blend-overlay bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,113,113,0.22),transparent_30%)]"></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-[#D4A373] flex items-center justify-center text-white shadow-md">
                            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.08em] text-foreground/60">Быстрый старт</p>
                            <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight">Начните с готовых сценариев</h3>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full border border-border/50 bg-card/80 text-xs font-semibold text-foreground/70">~2 минуты</span>
                      </div>

                      <p className="text-sm text-foreground/70 leading-relaxed">
                        Подберите маршрут под себя: посмотреть тренды, вдохновиться отзывами или сразу уйти в каталог. Светлая и тёмная темы теперь выглядят одинаково чисто.
                      </p>

                      <div className="space-y-3">
                        <Link
                          href="#trending"
                          className="group/btn w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary font-semibold flex items-center justify-center">1</div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-foreground">Сразу к популярному</p>
                              <p className="text-xs text-foreground/60">Последние хиты и капсульные подборки.</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-foreground/60 group-hover/btn:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          href="#testimonials"
                          className="group/btn w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#6B9999]/15 text-[#3B7171] font-semibold flex items-center justify-center">2</div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-foreground">Убедиться по отзывам</p>
                              <p className="text-xs text-foreground/60">Реальные истории клиентов и их любимые ароматы.</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-foreground/60 group-hover/btn:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>

                        <Link
                          href="/products"
                          className="group/btn w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl border border-primary/60 bg-gradient-to-r from-primary to-[#D4A373] text-white font-semibold hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 text-white font-semibold flex items-center justify-center">3</div>
                            <div className="text-left">
                              <p className="text-sm font-semibold">Перейти к заказу</p>
                              <p className="text-xs text-white/80">Полный каталог без лишних экранов.</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now - Creative Product Showcase */}
      <section id="trending" className="py-16 sm:py-20 lg:py-24 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={trendingHeaderAnimation.ref} className={`text-center mb-12 sm:mb-16 ${trendingHeaderAnimation.isInitiallyVisible ? '' :
            trendingHeaderAnimation.isVisible ? 'scroll-visible-header' : trendingHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
            }`}>
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl mb-4 sm:mb-6 group hover:shadow-xl hover:shadow-[#D4A373]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 cursor-pointer animate-logo-water-flow">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              В тренде сейчас
            </h2>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto px-4">
              Самые популярные продукты среди творческих душ
            </p>
          </div>

          <div ref={trendingProductsAnimation.ref} className={`${trendingProductsAnimation.isInitiallyVisible ? '' :
            trendingProductsAnimation.isVisible ? 'scroll-visible-cards' : trendingProductsAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
            }`}>
            {creativeProductCards}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/products"
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-transparent backdrop-blur-xl border border-primary/40 text-primary font-bold rounded-3xl hover:border-primary/80 hover:bg-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 transform hover:-translate-y-1 active:scale-95"
            >
              {/* Фоновый градиент при hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Сверкающий эффект */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse" />

              {/* Основной контент */}
              <div className="relative flex items-center gap-4">
                {/* Иконка каталога с эффектом */}
                <div className="relative">
                  <svg className="w-6 h-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {/* Звездочки эффекта */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" />
                  <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#D4A373] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping animation-delay-200" />
                </div>

                {/* Текст с градиентом */}
                <span className="text-lg bg-gradient-to-r from-primary to-[#D4A373] bg-clip-text text-transparent group-hover:from-[#D4A373] group-hover:to-primary transition-all duration-500">
                  Открыть полный каталог
                </span>

                {/* Стрелка с эффектом */}
                <div className="relative">
                  <svg className="w-5 h-5 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  {/* Светящийся след */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Краевой эффект */}
              <div className="absolute inset-0 rounded-3xl border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </div>
        </div>
      </section>


      <section className="py-32 relative">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={journeyHeaderAnimation.ref} className={`text-center mb-20 ${journeyHeaderAnimation.isInitiallyVisible ? '' :
            journeyHeaderAnimation.isVisible ? 'scroll-visible-header' : journeyHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
            }`}>
            {/* Header Icon - фирменный бирюзовый NP Academy */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-8 shadow-xl group hover:shadow-xl hover:shadow-[#D4A373]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 cursor-pointer animate-logo-water-flow">
              <svg className="w-10 h-10 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

          </div>

          <div ref={journeyCardsAnimation.ref} className={`relative mb-20 ${journeyCardsAnimation.isInitiallyVisible ? '' :
            journeyCardsAnimation.isVisible ? 'scroll-visible-cards' : journeyCardsAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
            }`}>
            {/* Central Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#3B7171] via-[#6B9999] to-[#D4A373] rounded-full opacity-30"></div>

            {/* Timeline Container */}
            <div className="relative max-w-6xl mx-auto">
              {/* Stage 1 - Left Side */}
              <div className="flex items-center mb-24">
                <div className="w-1/2 pr-12 text-right">
                  <div className="group relative">
                    {/* Timeline Dot */}
                    <div className="absolute right-0 top-8 transform translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-card shadow-lg group-hover:scale-125 transition-transform duration-300 z-10"></div>

                    <div className="bg-gradient-to-l from-[#3B7171]/10 to-transparent rounded-2xl p-8 shadow-xl border border-white/10 transform group-hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                      <div className="flex flex-col items-end">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-2xl flex items-center justify-center mb-6 shadow-lg ml-auto">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Знакомство</h3>
                        <p className="text-foreground/70 leading-relaxed mb-4">
                          Мир NP Perfumes открывает перед вами двери в элитную парфюмерию и профессиональные пигменты премиум-класса
                        </p>
                        <div className="text-right">
                          <span className="inline-flex items-center text-sm text-primary font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Первый шаг к совершенству
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>

              {/* Stage 2 - Right Side */}
              <div className="flex items-center mb-24">
                <div className="w-1/2"></div>
                <div className="w-1/2 pl-12">
                  <div className="group relative">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-8 transform -translate-x-1/2 w-6 h-6 bg-[#6B9999] rounded-full border-4 border-card shadow-lg group-hover:scale-125 transition-transform duration-300 z-10"></div>

                    <div className="bg-gradient-to-r from-[#6B9999]/10 to-transparent rounded-2xl p-8 shadow-xl border border-white/10 transform group-hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                      <div className="flex flex-col items-start">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#6B9999] to-[#D4A373] rounded-2xl flex items-center justify-center mb-6 shadow-lg mr-auto">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Эксперименты</h3>
                        <p className="text-foreground/70 leading-relaxed mb-4">
                          Тестируйте образцы, получайте персональные рекомендации и открывайте новые грани своего стиля
                        </p>
                        <div className="text-left">
                          <span className="inline-flex items-center text-sm text-[#6B9999] font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Открытие идеального аромата
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage 3 - Left Side */}
              <div className="flex items-center">
                <div className="w-1/2 pr-12 text-right">
                  <div className="group relative">
                    {/* Timeline Dot */}
                    <div className="absolute right-0 top-8 transform translate-x-1/2 w-6 h-6 bg-[#D4A373] rounded-full border-4 border-card shadow-lg group-hover:scale-125 transition-transform duration-300 z-10"></div>

                    <div className="bg-gradient-to-l from-[#D4A373]/10 to-transparent rounded-2xl p-8 shadow-xl border border-white/10 transform group-hover:scale-105 transition-all duration-500 hover:shadow-2xl">
                      <div className="flex flex-col items-end">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#D4A373] to-[#B8956A] rounded-2xl flex items-center justify-center mb-6 shadow-lg ml-auto">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Совершенство</h3>
                        <p className="text-foreground/70 leading-relaxed mb-4">
                          Ваш идеальный аромат найден. Присоединяйтесь к сообществу ценителей NP Perfumes и наслаждайтесь премиум-сервисом
                        </p>
                        <div className="text-right">
                          <span className="inline-flex items-center text-sm text-[#D4A373] font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Ваш стиль навсегда
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>
            </div>
          </div>

          {/* Why Choose Us - Premium Store Advantages */}
          <div className="max-w-7xl mx-auto">
            <div ref={journeyWhyChooseAnimation.ref} className={`text-center mb-16 ${journeyWhyChooseAnimation.isInitiallyVisible ? '' :
              journeyWhyChooseAnimation.isVisible ? 'scroll-visible-header' : journeyWhyChooseAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
              }`}>
              <h3 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
                <span className="bg-gradient-to-r from-[#3B7171] via-[#6B9999] to-[#D4A373] bg-clip-text text-transparent">
                  Почему выбирают нас
                </span>
              </h3>
              <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
                Премиум-магазин парфюмерии с безупречной репутацией и индивидуальным подходом к каждому клиенту
              </p>
            </div>

            {/* Advantages Grid */}
            <div ref={journeyAdvantagesAnimation.ref} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 ${journeyAdvantagesAnimation.isInitiallyVisible ? '' :
              journeyAdvantagesAnimation.isVisible ? 'scroll-visible-cards' : journeyAdvantagesAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
              }`}>
              {/* Advantage 1 - Premium Collection */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-3xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:-rotate-1 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Элитные бренды</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Только проверенные мировые бренды парфюмерии с многолетней историей и безупречной репутацией. От классических ароматов до современных композиций.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#3B7171]/20">
                      <div className="flex items-center justify-center space-x-2 text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">100+ мировых брендов</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage 2 - Expert Consultation */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B9999] to-[#3B7171] rounded-3xl transform -rotate-1 group-hover:rotate-1 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:rotate-1 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#6B9999] to-[#3B7171] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Профессиональные консультанты</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Наша команда экспертов поможет подобрать идеальный аромат именно для вас. Учитываем ваш стиль, предпочтения и даже характер.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#6B9999]/20">
                      <div className="flex items-center justify-center space-x-2 text-[#6B9999]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span className="text-sm font-medium">Сертифицированные парфюмеры</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage 3 - Quality Guarantee */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373] to-[#B8956A] rounded-3xl transform rotate-2 group-hover:-rotate-1 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:-rotate-1 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#D4A373] to-[#B8956A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Гарантия качества</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Каждый аромат проходит тщательную проверку подлинности. Мы гарантируем оригинальность продукции и ее соответствие заявленным характеристикам.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#D4A373]/20">
                      <div className="flex items-center justify-center space-x-2 text-[#D4A373]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">100% оригинальная продукция</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage 4 - Fast Delivery */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#B8956A] to-[#D4A373] rounded-3xl transform -rotate-2 group-hover:rotate-1 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:rotate-1 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#B8956A] to-[#D4A373] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Быстрая доставка</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Оперативная доставка по всей стране. Курьерская доставка в день заказа в пределах города. Упаковка, защищающая от повреждений.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#B8956A]/20">
                      <div className="flex items-center justify-center space-x-2 text-[#B8956A]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Доставка за 1-3 дня</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage 5 - Loyalty Program */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B7171] to-[#D4A373] rounded-3xl transform rotate-1 group-hover:-rotate-1 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:-rotate-1 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#3B7171] to-[#D4A373] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Программа лояльности</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Возвращаем 5% от каждой покупки баллами на ваш счет. Используйте баллы для оплаты следующих заказов.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#3B7171]/20">
                      <div className="flex items-center justify-center space-x-2 text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-medium">5% кэшбэк на всё</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advantage 6 - Premium Service */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B9999] to-[#B8956A] rounded-3xl transform -rotate-1 group-hover:rotate-2 transition-transform duration-500 opacity-10 group-hover:opacity-20"></div>
                <div className="relative bg-transparent backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 transform group-hover:rotate-2 transition-all duration-500 hover:scale-105 h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#6B9999] to-[#B8956A] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-foreground mb-4">Премиум сервис</h4>
                    <p className="text-foreground/70 leading-relaxed flex-grow">
                      Персональный подход к каждому клиенту. Бесплатные образцы, консультации и подарочная упаковка для особых случаев.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#6B9999]/20">
                      <div className="flex items-center justify-center space-x-2 text-[#6B9999]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="text-sm font-medium">Индивидуальный подход</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div ref={journeyMetricsAnimation.ref} className={`bg-gradient-to-r from-[#3B7171]/5 via-[#6B9999]/5 to-[#D4A373]/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10 mb-16 ${journeyMetricsAnimation.isInitiallyVisible ? '' :
              journeyMetricsAnimation.isVisible ? 'scroll-visible-stats' : journeyMetricsAnimation.isExiting ? 'scroll-exiting-stats' : 'scroll-hidden-stats'
              }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
                  <p className="text-foreground/70">Довольных клиентов</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-bold text-[#6B9999] mb-2 group-hover:scale-110 transition-transform duration-300">100+</div>
                  <p className="text-foreground/70">Брендов парфюмерии</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-bold text-[#D4A373] mb-2 group-hover:scale-110 transition-transform duration-300">5 лет</div>
                  <p className="text-foreground/70">На рынке</p>
                </div>
                <div className="group">
                  <div className="text-4xl font-bold text-[#B8956A] mb-2 group-hover:scale-110 transition-transform duration-300">4.9/5</div>
                  <p className="text-foreground/70">Средний рейтинг</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Promotion slots */}
      {renderPromoBlock(promotionsSlot1, promo1Loading, 'Специальные предложения')}
      {renderPromoBlock(promotionsSlot2, promo2Loading, 'Акции брендов')}
      {renderPromoBlock(promotionsSlot3, promo3Loading, 'Акции категорий')}


      {/* Creator Stories */}
      <section id="testimonials" className="py-24 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={testimonialsHeaderAnimation.ref} className={`text-center mb-16 ${testimonialsHeaderAnimation.isInitiallyVisible ? '' :
            testimonialsHeaderAnimation.isVisible ? 'scroll-visible-header' : testimonialsHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
            }`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 cursor-pointer animate-logo-water-flow">
              <svg className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Отзывы клиентов
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Что говорят наши клиенты о продукции NP Perfumes
            </p>
          </div>

          {/* Testimonials */}
          <div ref={testimonialsCardsAnimation.ref} className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${testimonialsCardsAnimation.isInitiallyVisible ? '' :
            testimonialsCardsAnimation.isVisible ? 'scroll-visible-cards' : testimonialsCardsAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
            }`}>
            <div className="glass-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Анна К.</div>
                  <div className="text-sm text-foreground/60">Художник-дизайнер</div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-4">
                "Парфюмы NP Perfumes - это настоящее открытие! Качество ароматов и обслуживание на высшем уровне. Теперь только сюда за покупками!"
              </p>
              <div className="flex text-[#D4A373]">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Мария С.</div>
                  <div className="text-sm text-foreground/60">Парфюмер</div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-4">
                "Пигменты NP pigments превосходного качества! Быстрая доставка и отличное соотношение цены и качества. Рекомендую всем профессионалам!"
              </p>
              <div className="flex text-[#D4A373]">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-foreground">Дмитрий В.</div>
                  <div className="text-sm text-foreground/60">Арт-директор</div>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-4">
                "NP Perfumes - мой любимый интернет-магазин! Широкий ассортимент, честные цены и всегда свежее поступление новинок. Отличная работа!"
              </p>
              <div className="flex text-[#D4A373]">
                {'★'.repeat(5)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div ref={testimonialsStatsAnimation.ref} className={`mt-16 glass-card rounded-3xl p-12 shadow-lg ${testimonialsStatsAnimation.isInitiallyVisible ? '' :
            testimonialsStatsAnimation.isVisible ? 'scroll-visible-stats' : testimonialsStatsAnimation.isExiting ? 'scroll-exiting-stats' : 'scroll-hidden-stats'
            }`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#3B7171] to-[#6B9999] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  5000+
                </div>
                <div className="text-foreground/60 font-medium">Довольных клиентов</div>
                <div className="text-sm text-gray-500 mt-1">постоянных покупателей</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#6B9999] to-[#D4A373] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  200+
                </div>
                <div className="text-foreground/60 font-medium">Уникальных оттенков</div>
                <div className="text-sm text-gray-500 mt-1">в коллекции</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#3B7171] to-[#D4A373] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  50+
                </div>
                <div className="text-foreground/60 font-medium">Мировых брендов</div>
                <div className="text-sm text-gray-500 mt-1">партнеров</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#6B9999] to-[#3B7171] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                  7
                </div>
                <div className="text-foreground/60 font-medium">Лет творчества</div>
                <div className="text-sm text-gray-500 mt-1">опыта</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}
