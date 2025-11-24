'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Heart, Share2, ZoomIn, Facebook, Twitter, Copy, Check } from 'lucide-react';
import { Perfume, Pigment } from '@/types/api';
import { getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type Product = Perfume | Pigment;

interface ProductImageGalleryProps {
  product: Product;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  // For now, we'll create an array with the main image and some placeholder additional images
  // In a real app, this would come from the API with multiple images
  const images = [
    getImageUrl(product.image || ''),
    '/placeholder-perfume.svg', // Additional image placeholder
    '/placeholder-perfume.svg', // Additional image placeholder
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Посмотрите этот продукт: ${product.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.log('Error copying to clipboard:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Посмотрите этот продукт: ${product.name}`);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'vk':
        shareUrl = `https://vk.com/share.php?url=${url}&title=${text}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group">
        <div
          className="aspect-square relative overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={images[selectedImageIndex]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'group-hover:scale-105'
            }`}
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-perfume.svg';
            }}
          />

          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full">
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {product.in_stock ? (
            <span className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-full font-medium shadow-lg">
              В наличии
            </span>
          ) : (
            <span className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-full font-medium shadow-lg">
              Нет в наличии
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-16 flex space-x-2">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={handleShare}
              className="p-2 bg-white/80 text-gray-700 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-10">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  {copiedToClipboard ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedToClipboard ? 'Скопировано!' : 'Копировать ссылку'}</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => shareToSocial('facebook')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>Facebook</span>
                </button>

                <button
                  onClick={() => shareToSocial('twitter')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  <span>Twitter</span>
                </button>

                <button
                  onClick={() => shareToSocial('vk')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded text-xs text-white flex items-center justify-center font-bold">
                    В
                  </div>
                  <span>ВКонтакте</span>
                </button>

                <button
                  onClick={() => shareToSocial('telegram')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                >
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span>Telegram</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Zoom Overlay */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                width={800}
                height={800}
                className="object-contain max-h-full max-w-full"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
                className="absolute top-4 right-4 bg-white/90 text-gray-700 p-2 rounded-full hover:bg-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImageIndex === index
                  ? 'border-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-perfume.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
