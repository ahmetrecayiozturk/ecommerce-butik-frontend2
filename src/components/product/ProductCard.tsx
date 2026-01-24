import React from 'react';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
        {/* Resim Alanı */}
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={product.imageUrl || 'https://via.placeholder.com/300'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* İçerik */}
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">
            {product.categoryName}
          </p>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Yıldızlar / Rating */}
          <div className="flex items-center mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {product.averageRating ? product.averageRating.toFixed(1) : 'Yeni'} 
              <span className="text-gray-400 text-xs ml-1">({product.reviewCount} değerlendirme)</span>
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
            </span>
            <span className="text-sm text-gray-500">
                {product.stock > 0 ? 'Stokta Var' : 'Tükendi'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;