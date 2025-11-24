import Link from 'next/link'

export default function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-cool rounded-2xl flex items-center justify-center animate-morph shadow-lg">
                <span className="text-white font-bold text-xl">CL</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div>
              <Link href="/" className="text-2xl font-bold bg-gradient-cool bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 font-display">
                NP Perfumes
              </Link>
              <p className="text-xs text-foreground/60 -mt-1 font-medium">Парфюмерия & Пигменты</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-foreground/80 hover:text-primary font-medium transition-all duration-300 relative group rounded-lg hover:bg-primary/5"
            >
              Главная
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-primary group-hover:w-1/2 transition-all duration-300 transform -translate-x-1/2"></span>
            </Link>
            <Link
              href="/perfumes"
              className="px-4 py-2 text-foreground/80 hover:text-primary font-medium transition-all duration-300 relative group rounded-lg hover:bg-primary/5"
            >
              Парфюмы
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-primary group-hover:w-1/2 transition-all duration-300 transform -translate-x-1/2"></span>
            </Link>
            <Link
              href="/pigments"
              className="px-4 py-2 text-foreground/80 hover:text-primary font-medium transition-all duration-300 relative group rounded-lg hover:bg-primary/5"
            >
              Пигменты
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-primary group-hover:w-1/2 transition-all duration-300 transform -translate-x-1/2"></span>
            </Link>
            <Link
              href="/brands"
              className="px-4 py-2 text-foreground/80 hover:text-primary font-medium transition-all duration-300 relative group rounded-lg hover:bg-primary/5"
            >
              Бренды
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-primary group-hover:w-1/2 transition-all duration-300 transform -translate-x-1/2"></span>
            </Link>
          </nav>

          {/* CTA Section */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-foreground/70 bg-secondary/50 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">+7 (495) 123-45-67</span>
            </div>
            <button className="btn-primary animate-glow">
              Связаться
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-foreground/80 hover:text-primary p-3 rounded-xl hover:bg-primary/10 transition-all duration-300 neumorph">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}