'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    <div className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{review.user_name}</span>
              {review.verified_purchase && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Покупатель
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-gray-600">
                {new Date(review.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={handleHelpful}
          disabled={isHelpful}
          className={`flex items-center space-x-1 text-sm transition-colors ${
            isHelpful
              ? 'text-green-600'
              : 'text-gray-600 hover:text-green-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Полезно ({helpfulCount})</span>
        </button>

        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Отзывы покупателей</h2>
          <Button variant="secondary" size="sm">
            <MessageCircle className="w-4 h-4 mr-2" />
            Написать отзыв
          </Button>
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <span className="text-5xl font-bold text-gray-900 mr-4">
                {averageRating.toFixed(1)}
              </span>
              <div>
                <StarRating rating={Math.round(averageRating)} size="lg" />
                <p className="text-sm text-gray-600 mt-1">
                  {mockReviews.length} отзывов
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {ratingDistribution.reverse().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-8">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Все отзывы</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {displayedReviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>

        {/* Show More Button */}
        {mockReviews.length > 3 && (
          <div className="text-center mt-8">
            <Button
              variant="secondary"
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews ? 'Показать меньше' : `Показать все отзывы (${mockReviews.length})`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
