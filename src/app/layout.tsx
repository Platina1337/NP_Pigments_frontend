import type { Metadata } from "next";
import { Dancing_Script, Montserrat } from 'next/font/google';
import "./globals.css";
import "@/styles/critical.css";
import { SignatureHeader } from "@/components/layout/SignatureHeader";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNavbar } from "@/components/layout/MobileBottomNavbar";
import ClientProviders from "@/components/ClientProviders";
import { ThemeProvider, ThemeLoader } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

// Рукописный шрифт (аналог Rosa Marena) - для заголовков
const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['Brush Script MT', 'cursive'],
});

// Основной шрифт (аналог Century Gothic) - для текста
const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  fallback: ['Avenir', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "NP Perfumes - Имидж-академия | Элитная Парфюмерия",
  description: "Официальный интернет-магазин NP Academy. Эксклюзивная парфюмерия и профессиональные продукты для создания уникального образа. Доставка по всей России.",
  keywords: "NP Perfumes, NP Academy, парфюмерия, имидж-академия, элитные духи, пигменты, косметика",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3B7171" />
      </head>
      <body className={`${dancingScript.variable} ${montserrat.variable} font-body bg-background text-foreground antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <ThemeLoader>
              <ClientProviders>
                <div className="relative flex min-h-screen flex-col">
                  {/* Header только для десктопов, на мобильных - нижний навбар */}
                  <div className="hidden md:block">
                    <SignatureHeader />
                  </div>
                  <main className="flex-1 pt-4 sm:pt-10 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
                      {children}
                    </div>
                  </main>
                  <Footer />
                  {/* Мобильный нижний навбар - только на мобильных */}
                  <div className="md:hidden">
                    <MobileBottomNavbar />
                  </div>
                </div>
              </ClientProviders>
            </ThemeLoader>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

