'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFeaturedProducts, saveBreadcrumbPath, type FeaturedItem } from '@/lib/swr-hooks'
import { useScrollAnimation, useScrollFade } from '@/lib/useScrollAnimation'
import { useTheme } from '@/context/ThemeContext'
import FeedbackModal from '@/components/FeedbackModal'

export default function Home() {
  const { featuredProducts, isLoading } = useFeaturedProducts()
  const { theme } = useTheme()
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
    return `/products/${item.id}`
  }, [])

  const handleProductClick = useCallback((item: FeaturedItem) => {
    // Сохраняем breadcrumb путь для главной страницы: Главная > Товар
    const breadcrumbPath: Array<{ label: string; href: string }> = [];
    saveBreadcrumbPath(breadcrumbPath);
  }, [])

  const getProductPrice = useCallback((item: FeaturedItem) => {
    return item.type === 'perfume'
      ? `${item.price.toLocaleString('ru-RU')} ₽`
      : `${item.price.toLocaleString('ru-RU')} ₽`
  }, [])

  const getProductVolume = useCallback((item: FeaturedItem) => {
    return item.type === 'perfume'
      ? `${item.volume_ml} мл`
      : `${item.weight_gr} г`
  }, [])

  // New creative product cards
  const creativeProductCards = useMemo(() => {
    if (isLoading || !featuredProducts.length) {
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
        {featuredProducts.slice(0, 6).map((item: FeaturedItem, index) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={getProductLink(item)}
              onClick={() => handleProductClick(item)}
              className="group relative glass-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 block"
              style={{
                animation: `slideInUp 0.8s ease-out ${index * 0.15}s forwards`,
                opacity: 1,
                transform: 'translateY(0px) rotate(0deg)'
              }}
            >
            {/* Простой темный фон */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-card/50"></div>

            {/* Индикатор типа */}
            <div className="absolute top-4 right-4 z-10">
              <div className={`w-2 h-2 rounded-full ${item.type === 'perfume' ? 'bg-primary' : 'bg-orange-500'}`}></div>
            </div>

            <div className="relative z-10 p-8">
              {/* Product type badge */}
              <div className="flex justify-between items-start mb-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  item.type === 'perfume'
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-orange-500/20 text-orange-600 border border-orange-500/30'
                }`}>
                  <span className="mr-1">
                    {item.type === 'perfume' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    )}
                  </span>
                  {item.type === 'perfume' ? 'Парфюм' : 'Пигмент'}
                </div>
                <div className="text-right">
                  <div className="text-xs text-foreground/60 font-medium hover:text-primary transition-colors duration-300 cursor-pointer">{item.brand.name}</div>
                </div>
              </div>

              {/* Product image with creative frame */}
              <div className="relative mb-6">
                <div className="aspect-square relative overflow-hidden rounded-2xl bg-secondary">
                  {item.image ? (
                    <>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        priority={index < 3}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </>
                  ) : (
                    <Image
                      src={item.type === 'perfume'
                        ? "/placeholder-perfume.svg"
                        : "/placeholder-perfume.svg"
                      }
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      priority={index < 3}
                    />
                  )}
                </div>
                </div>

                {/* Product info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {item.name}
                </h3>

                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {getProductPrice(item)}
                  </span>
                  <span className="text-xs text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">
                    {getProductVolume(item)}
                  </span>
                </div>
              </div>
            </div>
            </Link>
        ))}
      </div>
    )
  }, [featuredProducts, isLoading, getProductLink, getProductPrice, getProductVolume, handleProductClick])

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
                      src={theme === 'dark' ? '/np-logo-dark.png' : '/np-logo-light.png'}
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
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                  <span className="inline-block animate-logo-shimmer px-2 py-1 opacity-0 scale-95" style={{
                    animation: 'heroFadeInScale 1.0s ease-out 0.5s forwards'
                  }}>
                    NP Perfumes
                  </span>
                </h1>
                <p ref={subtitleFade.ref} className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 drop-shadow-lg opacity-0 scale-95" style={{
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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 sm:p-8 lg:p-10 shadow-2xl transform group-hover:scale-[1.02] transition-all duration-700">

                  {/* Декоративные элементы */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
                      {/* Иконка с анимацией */}
                      <div className="flex-shrink-0">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                        </div>
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3 leading-tight">
                          Ароматы и Искусство
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed mb-4 lg:mb-6 max-w-xl">
                          Мир элитных парфюмов и профессиональных пигментов для истинных ценителей красоты и творчества
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link
                            href="/products"
                            className="group/btn inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-sm"
                          >
                            <svg className="w-5 h-5 mr-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Каталог</span>
                          </Link>
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
                <div ref={bystryiStartFade.ref} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 p-6 sm:p-8 shadow-2xl transform group-hover:scale-[1.02] transition-all duration-700 h-full">

                  {/* Декоративные элементы */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>

                  <div className="relative z-10 text-center h-full flex flex-col">
                    {/* Иконка */}
                    <div className="flex-shrink-0 mb-4">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mx-auto">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Контент */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight">
                          Быстрый старт
                        </h3>
                        <p className="text-sm text-white/90 leading-relaxed mb-4">
                          Выберите направление вашего творческого пути
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Link
                          href="#trending"
                          className="group/btn w-full inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          <svg className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <span>Популярное</span>
                        </Link>

                        <Link
                          href="#testimonials"
                          className="group/btn w-full inline-flex items-center justify-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          <svg className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Отзывы</span>
                        </Link>

                        <Link
                          href="/products"
                          className="group/btn w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 text-sm"
                        >
                          <svg className="w-4 h-4 mr-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Каталог</span>
                        </Link>
                      </div>
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
            <div ref={trendingHeaderAnimation.ref} className={`text-center mb-12 sm:mb-16 ${
              trendingHeaderAnimation.isInitiallyVisible ? '' :
              trendingHeaderAnimation.isVisible ? 'scroll-visible-header' : trendingHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
            }`}>
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#3B7171] rounded-2xl mb-4 sm:mb-6 group hover:shadow-xl hover:shadow-[#D4A373]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 cursor-pointer animate-logo-water-flow">
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

          <div ref={trendingProductsAnimation.ref} className={`${
            trendingProductsAnimation.isInitiallyVisible ? '' :
            trendingProductsAnimation.isVisible ? 'scroll-visible-cards' : trendingProductsAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
          }`}>
            {creativeProductCards}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {/* Иконка каталога */}
              <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>

              {/* Текст */}
              <span>Смотреть каталог</span>

              {/* Стрелка */}
              <svg className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* NP Customer Excellence - Your Advantages */}
      <section className="py-32 relative">
        {/* Elegant background with subtle scent patterns */}
        <div className="absolute inset-0 pointer-events-none opacity-3">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#3B7171]/20 blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-[#D4A373]/20 blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-[#6B9999]/20 blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={excellenceHeaderAnimation.ref} className={`text-center mb-20 ${
            excellenceHeaderAnimation.isInitiallyVisible ? '' :
            excellenceHeaderAnimation.isVisible ? 'scroll-visible-header' : excellenceHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
          }`}>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-8">
              <span className="bg-gradient-to-r from-[#3B7171] via-[#6B9999] to-[#D4A373] bg-clip-text text-transparent">
                Ваше преимущество с NP
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto leading-relaxed">
              Откройте для себя мир премиум парфюмерии, где каждая покупка становится незабываемым опытом
            </p>
          </div>

          {/* Customer Benefits Showcase */}
          <div ref={excellenceCardsAnimation.ref} className={`mb-20 ${
            excellenceCardsAnimation.isInitiallyVisible ? '' :
            excellenceCardsAnimation.isVisible ? 'scroll-visible-cards' : excellenceCardsAnimation.isExiting ? 'scroll-exiting-cards' : 'scroll-hidden-cards'
          }`}>
            {/* Top Row - Core Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Authentic Luxury */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B7171]/10 to-[#3B7171]/5 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="relative glass-card rounded-3xl p-8 shadow-xl border border-white/10 group-hover:border-[#3B7171]/30 transition-all duration-500 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-[#3B7171] to-[#6B9999] bg-clip-text text-transparent">100%</div>
                      <div className="text-sm text-foreground/60 font-medium">Оригинал</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">Подлинная роскошь</h3>
                  <p className="text-foreground/70 leading-relaxed flex-grow mb-6">
                    Только аутентичные ароматы от ведущих мировых брендов. Каждая бутылочка - это гарантия подлинности и непревзойденного качества.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Сертификаты подлинности</span>
                      <span className="text-sm font-bold text-[#3B7171]">✓ Включены</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Гарантия качества</span>
                      <span className="text-sm font-bold text-[#3B7171]">Пожизненная</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Scent Journey */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B9999]/10 to-[#6B9999]/5 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="relative glass-card rounded-3xl p-8 shadow-xl border border-white/10 group-hover:border-[#6B9999]/30 transition-all duration-500 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#6B9999] to-[#D4A373] rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-[#6B9999] to-[#D4A373] bg-clip-text text-transparent">24/7</div>
                      <div className="text-sm text-foreground/60 font-medium">Поддержка</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">Персональный аромат</h3>
                  <p className="text-foreground/70 leading-relaxed flex-grow mb-6">
                    Наши эксперты помогут найти идеальный аромат именно для вас. Учитываем ваш характер, стиль жизни и предпочтения.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Бесплатная консультация</span>
                      <span className="text-sm font-bold text-[#6B9999]">✓ Онлайн</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Образцы для тестирования</span>
                      <span className="text-sm font-bold text-[#6B9999]">До 5 ароматов</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seamless Experience */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/10 to-[#D4A373]/5 rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="relative glass-card rounded-3xl p-8 shadow-xl border border-white/10 group-hover:border-[#D4A373]/30 transition-all duration-500 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4A373] to-[#B8956A] rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-[#D4A373] to-[#B8956A] bg-clip-text text-transparent">1-2 дня</div>
                      <div className="text-sm text-foreground/60 font-medium">Доставка</div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">Идеальная доставка</h3>
                  <p className="text-foreground/70 leading-relaxed flex-grow mb-6">
                    Быстрая и аккуратная доставка с премиум упаковкой. Отслеживайте заказ на каждом этапе и получайте в идеальном состоянии.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Бесплатная доставка</span>
                      <span className="text-sm font-bold text-[#D4A373]">От 3000₽</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/30">
                      <span className="text-sm text-foreground/70">Специальная упаковка</span>
                      <span className="text-sm font-bold text-[#D4A373]">Элегантная</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Exclusive Perks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* VIP Experience */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B7171]/8 to-[#6B9999]/8 rounded-3xl opacity-70 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative glass-card rounded-3xl p-8 shadow-xl border border-white/15">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">VIP-преимущества</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#3B7171]/5 to-[#6B9999]/5 rounded-xl border border-[#3B7171]/20">
                      <div className="w-10 h-10 bg-[#3B7171] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Программа лояльности</h4>
                        <p className="text-sm text-foreground/70">Накопите баллы и получайте эксклюзивные скидки до 25%</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#6B9999]/5 to-[#D4A373]/5 rounded-xl border border-[#6B9999]/20">
                      <div className="w-10 h-10 bg-[#6B9999] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m0 0l-2-2m2 2l2-2m4-16l2 2m0 0l-2 2m-2-2l2 2" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Эксклюзивные предложения</h4>
                        <p className="text-sm text-foreground/70">Специальные лимитированные коллекции только для наших клиентов</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-[#D4A373]/5 to-[#B8956A]/5 rounded-xl border border-[#D4A373]/20">
                      <div className="w-10 h-10 bg-[#D4A373] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Персональные рекомендации</h4>
                        <p className="text-sm text-foreground/70">Индивидуальные подборки на основе ваших предпочтений</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Success Stories */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6B9999]/8 to-[#D4A373]/8 rounded-3xl opacity-70 group-hover:opacity-90 transition-all duration-500"></div>
                <div className="relative glass-card rounded-3xl p-8 shadow-xl border border-white/15">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-foreground">Истории успеха</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#6B9999] to-[#D4A373] rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Customer Journey Visualization */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-foreground">Путь клиента к идеальному аромату</span>
                        <span className="text-sm text-[#3B7171] font-bold">4.9/5</span>
                      </div>

                      {/* Journey Steps */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#3B7171]/10 to-[#6B9999]/10 rounded-lg">
                          <div className="w-8 h-8 bg-[#3B7171] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">1</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">Консультация</span>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                              <div className="bg-[#3B7171] h-1 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#6B9999]/10 to-[#D4A373]/10 rounded-lg">
                          <div className="w-8 h-8 bg-[#6B9999] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">2</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">Тестирование образцов</span>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                              <div className="bg-[#6B9999] h-1 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#D4A373]/10 to-[#B8956A]/10 rounded-lg">
                          <div className="w-8 h-8 bg-[#D4A373] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">3</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">Выбор идеального аромата</span>
                            <div className="w-full bg-secondary rounded-full h-1 mt-1">
                              <div className="bg-[#D4A373] h-1 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Satisfaction Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-card/40 rounded-lg border border-border/30">
                        <div className="text-2xl font-bold text-[#3B7171] mb-1">98%</div>
                        <div className="text-xs text-foreground/60">Повторные покупки</div>
                      </div>
                      <div className="text-center p-4 bg-card/40 rounded-lg border border-border/30">
                        <div className="text-2xl font-bold text-[#6B9999] mb-1">15 мин</div>
                        <div className="text-xs text-foreground/60">Среднее время выбора</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Promise */}
          <div ref={excellenceTrustIndicatorsAnimation.ref} className={`text-center ${
            excellenceTrustIndicatorsAnimation.isInitiallyVisible ? '' :
            excellenceTrustIndicatorsAnimation.isVisible ? 'scroll-visible-stats' : excellenceTrustIndicatorsAnimation.isExiting ? 'scroll-exiting-stats' : 'scroll-hidden-stats'
          }`}>
            <div className="max-w-4xl mx-auto">
              <div className="glass-card rounded-3xl p-8 md:p-12 shadow-xl border border-white/20">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Наше обещание клиентам
                </h3>
                <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                  Каждый аромат, который вы выбираете у нас, становится частью вашей истории успеха.
                  Мы гарантируем не просто покупку, а незабываемый опыт премиум обслуживания.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#3B7171] to-[#6B9999] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Подлинность</h4>
                    <p className="text-sm text-foreground/70">100% оригинальная продукция от брендов</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6B9999] to-[#D4A373] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Доверие</h4>
                    <p className="text-sm text-foreground/70">25+ лет опыта и тысячи довольных клиентов</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4A373] to-[#B8956A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Удобство</h4>
                    <p className="text-sm text-foreground/70">Простой процесс от выбора до доставки</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Journey - The Path to Mastery */}
      <section className="py-32 relative">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={journeyHeaderAnimation.ref} className={`text-center mb-20 ${
            journeyHeaderAnimation.isInitiallyVisible ? '' :
            journeyHeaderAnimation.isVisible ? 'scroll-visible-header' : journeyHeaderAnimation.isExiting ? 'scroll-exiting-header' : 'scroll-hidden-header'
          }`}>
            {/* Header Icon - фирменный бирюзовый NP Academy */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#3B7171] rounded-full mb-8 shadow-xl group hover:shadow-xl hover:shadow-[#D4A373]/20 transition-all duration-300 hover:scale-110 hover:rotate-3 active:scale-95 cursor-pointer animate-logo-water-flow">
              <svg className="w-10 h-10 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Путь к мастерству
            </h2>
            <p className="text-2xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-light">
              Искусство создания парфюма - это путешествие от вдохновения к совершенству
            </p>
          </div>

          {/* Customer Journey Timeline - Completely New Design */}
          <div ref={journeyCardsAnimation.ref} className={`relative mb-20 ${
            journeyCardsAnimation.isInitiallyVisible ? '' :
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
                    <div className="absolute right-0 top-8 transform translate-x-1/2 w-6 h-6 bg-[#3B7171] rounded-full border-4 border-card shadow-lg group-hover:scale-125 transition-transform duration-300 z-10"></div>

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
                          <span className="inline-flex items-center text-sm text-[#3B7171] font-medium">
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
            <div ref={journeyWhyChooseAnimation.ref} className={`text-center mb-16 ${
              journeyWhyChooseAnimation.isInitiallyVisible ? '' :
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
            <div ref={journeyAdvantagesAnimation.ref} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 ${
              journeyAdvantagesAnimation.isInitiallyVisible ? '' :
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
                      <div className="flex items-center justify-center space-x-2 text-[#3B7171]">
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
                      Накапливайте бонусы за каждую покупку и получайте эксклюзивные скидки. Специальные предложения для постоянных клиентов.
                    </p>
                    <div className="mt-6 pt-4 border-t border-[#3B7171]/20">
                      <div className="flex items-center justify-center space-x-2 text-[#3B7171]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-sm font-medium">До 15% кэшбэк</span>
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
            <div ref={journeyMetricsAnimation.ref} className={`bg-gradient-to-r from-[#3B7171]/5 via-[#6B9999]/5 to-[#D4A373]/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10 mb-16 ${
              journeyMetricsAnimation.isInitiallyVisible ? '' :
              journeyMetricsAnimation.isVisible ? 'scroll-visible-stats' : journeyMetricsAnimation.isExiting ? 'scroll-exiting-stats' : 'scroll-hidden-stats'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl font-bold text-[#3B7171] mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
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

            {/* CTA Section */}
            <div ref={journeyCtaAnimation.ref} className={`text-center ${
              journeyCtaAnimation.isInitiallyVisible ? '' :
              journeyCtaAnimation.isVisible ? 'scroll-visible' : journeyCtaAnimation.isExiting ? 'scroll-exiting' : 'scroll-hidden'
            }`}>
              <div className="bg-transparent backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/30 shadow-xl">
                <h4 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Начните свое путешествие в мир ароматов
                </h4>
                <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                  Откройте для себя идеальный аромат с помощью наших экспертов
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="group bg-gradient-to-r from-[#3B7171] to-[#6B9999] text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Найти свой аромат</span>
                  </Link>
                  <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="group bg-white/80 backdrop-blur-sm border-2 border-[#6B9999]/30 text-[#3B7171] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-[#6B9999]/10 hover:border-[#6B9999] transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Получить консультацию</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Stories */}
      <section id="testimonials" className="py-24 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={testimonialsHeaderAnimation.ref} className={`text-center mb-16 ${
            testimonialsHeaderAnimation.isInitiallyVisible ? '' :
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
          <div ref={testimonialsCardsAnimation.ref} className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${
            testimonialsCardsAnimation.isInitiallyVisible ? '' :
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
          <div ref={testimonialsStatsAnimation.ref} className={`mt-16 glass-card rounded-3xl p-12 shadow-lg ${
            testimonialsStatsAnimation.isInitiallyVisible ? '' :
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


