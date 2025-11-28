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
  return (
    <nav className="flex items-center space-x-2 text-sm font-black text-gray-600 dark:text-black">
      <Link
        href="/"
        className="flex items-center text-gray-700 dark:text-black hover:text-gray-900 dark:hover:text-black transition-colors font-black"
      >
        <Home className="w-4 h-4 mr-1 text-gray-600 dark:text-black" />
        <span className="sr-only">Главная</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-black" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 dark:text-black font-black truncate max-w-48">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="text-gray-700 dark:text-black hover:text-gray-900 dark:hover:text-black transition-colors truncate max-w-48 font-black"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
