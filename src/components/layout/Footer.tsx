'use client'

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart, FlaskConical, Palette, Award, Package, Truck, RotateCcw, HelpCircle, MessageCircle, Shield, Star, Users, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-background to-[#E8F3F3]/50 text-foreground relative overflow-hidden border-t border-[#DFE6E9]/50">
      {/* Background decorative elements - фирменный бирюзовый NP Academy */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-[#3B7171]/5 to-[#6B9999]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-gradient-to-r from-[#6B9999]/5 to-[#3B7171]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* О компании */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#3B7171] to-[#2A4A4A] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl font-heading">NP</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading">NP Perfumes</h3>
                <p className="text-sm text-foreground/60">Элитная парфюмерия и пигменты</p>
              </div>
            </div>
            <p className="text-foreground/80 mb-8 max-w-md leading-relaxed">
              Создаем экосистему совершенства для вашего творчества. Более 5000 клиентов уже выбрали качество и надежность NP.
            </p>

            {/* Социальные сети - фирменные цвета NP Academy */}
            <div className="flex space-x-4 mb-8">
              <a
                href="#"
                className="w-10 h-10 bg-card hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-foreground/70 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-card hover:bg-accent rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-foreground/70 group-hover:text-white transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-card hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-foreground/70 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Каталог */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Каталог</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/perfumes" className="text-foreground/60 hover:text-primary transition-colors duration-300 flex items-center group">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Парфюмерия</span>
                </Link>
              </li>
              <li>
                <Link href="/pigments" className="text-foreground/60 hover:text-accent transition-colors duration-300 flex items-center group">
                  <Palette className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Пигменты</span>
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-foreground/60 hover:text-primary transition-colors duration-300 flex items-center group">
                  <Award className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Бренды</span>
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-foreground/60 hover:text-primary/80 transition-colors duration-300 flex items-center group">
                  <Package className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Все товары</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Поддержка */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Поддержка</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/delivery" className="text-foreground/60 hover:text-primary transition-colors duration-300 flex items-center group">
                  <Truck className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Доставка</span>
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-foreground/60 hover:text-primary/80 transition-colors duration-300 flex items-center group">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Возврат</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-foreground/60 hover:text-primary transition-colors duration-300 flex items-center group">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">FAQ</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {/* open feedback modal */ }}
                  className="text-foreground/60 hover:text-accent transition-colors duration-300 flex items-center group"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span className="group-hover:translate-x-1 transition-transform duration-300">Обратная связь</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="border-t border-border mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6">
            <div className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-r from-[#3B7171] to-[#2A4A4A] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Горячая линия</p>
                <p className="text-foreground font-semibold">+7 (495) 123-45-67</p>
                <p className="text-xs text-foreground/50">24/7 поддержка</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-r from-[#D4A373] to-[#C4935E] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Email поддержка</p>
                <p className="text-foreground font-semibold">support@np-perfumes.ru</p>
                <p className="text-xs text-foreground/50">Ответ в течение часа</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 group">
              <div className="w-12 h-12 bg-gradient-to-r from-[#3B7171] to-[#6B9999] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-foreground/60">Главный офис</p>
                <p className="text-foreground font-semibold">Москва, ул. Парфюмерная, 1</p>
                <p className="text-xs text-foreground/50">м. Красные ворота</p>
              </div>
            </div>
          </div>

          {/* Реквизиты для платежей (ЮKassa требует ИНН на сайте) */}
          <div className="mt-6 bg-card/50 border border-border/60 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3B7171] to-[#6B9999] flex items-center justify-center text-white font-semibold">
                ИП
              </div>
              <div>
                <p className="text-sm text-foreground/60">Реквизиты продавца</p>
                <p className="text-base font-semibold text-foreground">ИП Молодцова Ирина Геннадьевна</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-foreground/70">
              <div>
                <p className="font-semibold text-foreground">ИНН 690602401512</p>
                <p>ОГРНИП 319695200059942</p>
                <p>Тел.: +7 900 019 40 51</p>
              </div>
              <div>
                <p>171980, Тверская обл., г. Бежецк, ул. Чехова, д. 4А, кв. 36</p>
                <p>ПАО «БАНК УРАЛСИБ», г. Москва</p>
                <p>БИК 042809679, р/с 4080281016730000213231</p>
              </div>
            </div>
          </div>
        </div>


        {/* Копирайт и доп. информация */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-foreground/60">
              <span>© 2025 NP Perfumes</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Создано с любовью к ароматам</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-foreground/60">
              <Link href="/privacy" className="hover:text-primary transition-colors">Конфиденциальность</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Условия использования</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

