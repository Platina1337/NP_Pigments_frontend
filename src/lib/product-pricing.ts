type PriceLike = number | string | null | undefined;

type DiscountAware = {
  price: PriceLike;
  final_price?: PriceLike;
  discount_price?: PriceLike;
  discount_percentage?: number | string | null;
  discount_start_date?: string | null;
  discount_end_date?: string | null;
};

const parsePriceValue = (value: PriceLike): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const numeric = parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const parsePercentage = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const numeric = parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isDiscountActive = (product: DiscountAware): boolean => {
  const hasDiscountValue =
    parsePriceValue(product.final_price ?? product.discount_price ?? null) > 0 ||
    parsePercentage(product.discount_percentage) > 0;

  if (!hasDiscountValue) {
    return false;
  }

  const now = new Date();
  const start = parseDate(product.discount_start_date);
  const end = parseDate(product.discount_end_date);

  if (start && end) {
    return start <= now && now <= end;
  }
  if (start) {
    return start <= now;
  }
  if (end) {
    return now <= end;
  }
  return true;
};

export const getPriceInfo = (product: DiscountAware) => {
  const originalPrice = parsePriceValue(product.price);
  let currentPrice = originalPrice;
  const discountActive = isDiscountActive(product);

  if (discountActive) {
    const serverPrice = parsePriceValue(product.final_price ?? product.discount_price ?? null);
    if (serverPrice > 0) {
      currentPrice = serverPrice;
    } else {
      const percent = parsePercentage(product.discount_percentage);
      if (percent > 0) {
        currentPrice = originalPrice * (1 - percent / 100);
      }
    }
  }

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    currentPrice = originalPrice;
  }

  const hasDiscount = discountActive && currentPrice < originalPrice - 0.01;

  return {
    originalPrice,
    currentPrice,
    hasDiscount,
  };
};
