import React from 'react';
import { ChevronDown } from 'lucide-react';

export type SortOption = {
  value: string;
  label: string;
};

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}

export const ProductSort: React.FC<ProductSortProps> = ({
  value,
  onChange,
  options,
}) => {
  const currentOption = options.find(option => option.value === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-background border border-border rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
};
