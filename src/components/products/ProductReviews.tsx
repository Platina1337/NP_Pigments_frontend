'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FilterSelect } from '@/components/ui/FilterSelect'

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: number;
}

// Mock reviews data - in a real app this would come from API
const mockReviews: Review[] = [
  {
    id: 1,
    user_name: 'Анна М.',
    rating: 5,
    comment: 'Потрясающий аромат! Очень стойкий и элегантный. Идеально подходит для особых случаев. Рекомендую!',
    created_at: '2024-01-15',
    helpful_count: 12,
    verified_purchase: true,
  },
  {
    id: 2,
    user_name: 'Дмитрий К.',
    rating: 4,
    comment: 'Хороший парфюм, но ожидал более яркий шлейф. В целом доволен покупкой.',
    created_at: '2024-01-10',
    helpful_count: 8,
    verified_purchase: true,
  },
  {
    id: 3,
    user_name: 'Елена С.',
    rating: 5,
    comment: 'Любимый аромат уже несколько лет. Качество всегда на высоте, доставка быстрая.',
    created_at: '2024-01-08',
    helpful_count: 15,
    verified_purchase: false,
  },
  {
    id: 4,
    user_name: 'Максим В.',
    rating: 3,
    comment: 'Средний аромат. Не впечатлил, но и не разочаровал. Для повседневного использования сойдет.',
    created_at: '2024-01-05',
    helpful_count: 3,
    verified_purchase: true,
  },
];

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);

  const handleHelpful = () => {
    if (!isHelpful) {
      setIsHelpful(true);
      setHelpfulCount(prev => prev + 1);
    }
  };

  return (
    <div className="group rounded-2xl border-0 bg-white/85 p-4 shadow-sm transition-all duration-300 sm:border sm:border-slate-200 sm:bg-white/50 sm:p-6 sm:hover:border-slate-300 sm:hover:bg-white sm:hover:shadow-lg sm:dark:border-white/5 dark:bg-white/5 dark:shadow-none sm:dark:hover:border-white/10 dark:hover:bg-white/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white text-lg">{review.user_name}</span>
              {review.verified_purchase && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  ✓ Покупатель
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(review.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">{review.comment}</p>

      <div className="flex items-center justify-between sm:border-t sm:border-slate-100 sm:dark:border-white/5 sm:pt-4 sm:mt-4">
        <button
          onClick={handleHelpful}
          disabled={isHelpful}
          className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
            isHelpful
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
          <span>Полезно ({helpfulCount})</span>
        </button>

        <button className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-red-500 transition-colors dark:text-slate-500 dark:hover:text-red-400">
          <Flag className="w-4 h-4" />
          <span>Пожаловаться</span>
        </button>
      </div>
    </div>
  );
};

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  // Calculate rating distribution
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
    const count = mockReviews.filter(review => review.rating === rating).length;
    const percentage = (count / mockReviews.length) * 100;
    return { rating, count, percentage };
  });

  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;

  // Sort reviews
  const sortedReviews = [...mockReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  return (
    <section className="bg-transparent p-0 sm:rounded-[32px] sm:border sm:border-slate-200 sm:bg-white/85 sm:p-8 sm:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 sm:dark:bg-slate-900/70">
      <div className="space-y-8 sm:space-y-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Отзывы покупателей</h2>
          <button className="group flex items-center gap-2 w-full justify-center sm:w-auto px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 transition-all duration-300 hover:shadow-md dark:from-white/5 dark:to-white/10 dark:border-white/10 dark:text-white">
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium">Написать отзыв</span>
          </button>
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-12 p-0 sm:p-6 sm:rounded-2xl sm:bg-slate-50/50 sm:dark:bg-white/5 sm:border sm:border-slate-100 sm:dark:border-white/5">
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-bold text-slate-900 dark:text-white">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <div className="flex mb-1">
                    <StarRating rating={Math.round(averageRating)} size="md" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  На основе {mockReviews.length} отзывов
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {ratingDistribution.reverse().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3 group">
                <span className="text-sm font-medium w-3 text-slate-700 dark:text-slate-300">{rating}</span>
                <Star className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500 group-hover:bg-yellow-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Все отзывы</h3>
          <div className="w-full sm:w-56">
            <FilterSelect
              label="Сортировка"
              value={sortBy}
              onChange={(value) => setSortBy(value as typeof sortBy)}
              options={[
                { value: 'newest', label: 'Сначала новые' },
                { value: 'oldest', label: 'Сначала старые' },
                { value: 'rating', label: 'По рейтингу' },
              ]}
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {/* Show More Button */}
        {mockReviews.length > 3 && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl text-slate-700 dark:text-slate-200 transition-all duration-300 hover:shadow-lg font-medium"
            >
              <span>{showAllReviews ? 'Показать меньше' : `Показать все отзывы (${mockReviews.length})`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllReviews ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
