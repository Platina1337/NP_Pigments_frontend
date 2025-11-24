import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ProductsPerPageProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
}

export const ProductsPerPage: React.FC<ProductsPerPageProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <span>Показывать:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="appearance-none bg-background border border-border rounded px-2 py-1 pr-6 focus:ring-1 focus:ring-primary focus:border-transparent cursor-pointer text-sm"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
};
