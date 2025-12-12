import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  // Фильтруем "Главная", так как для нее есть иконка домика
  const filteredItems = items.filter(
    (item) => !(item.label === 'Главная' && item.href === '/'),
  );

  return (
    <nav className="breadcrumb-nav flex  items-center gap-y-1 gap-x-1 sm:gap-x-2 text-xs sm:text-sm font-black">
      <Link
        href="/"
        className="breadcrumb-link flex items-center transition-colors font-black shrink-0"
      >
        <Home className="breadcrumb-icon w-4 h-4 mr-1" />
        <span className="sr-only">Главная</span>
      </Link>

      {filteredItems.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="breadcrumb-separator w-4 h-4 shrink-0" />
          {index === filteredItems.length - 1 ? (
            <span className="breadcrumb-current font-black truncate min-w-0">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="breadcrumb-link transition-colors truncate min-w-0"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
