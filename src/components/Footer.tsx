export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 hover:text-primary transition-colors duration-300">NP Perfumes</h3>
            <p className="text-foreground/60 text-sm">
              Ваш надежный партнер в мире элитной парфюмерии и профессиональных пигментов.
              Только оригинальная продукция от ведущих мировых брендов.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 hover:text-primary transition-colors duration-300">Быстрые ссылки</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/products" className="text-foreground/60 hover:text-primary transition-colors duration-300">
                  Каталог
                </a>
              </li>
              <li>
                <a href="/brands" className="text-foreground/60 hover:text-primary transition-colors duration-300">
                  Бренды
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 hover:text-primary transition-colors duration-300">Контакты</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li className="hover:text-foreground transition-colors duration-300">📞 +7 (495) 123-45-67</li>
              <li className="hover:text-foreground transition-colors duration-300">✉️ info@npperfumes.ru</li>
              <li className="hover:text-foreground transition-colors duration-300">📍 Москва, ул. Парфюмерная, 1</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-foreground/60 hover:text-foreground transition-colors duration-300">
          <p>&copy; 2025 NP Perfumes. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}