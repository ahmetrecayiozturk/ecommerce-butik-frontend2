"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/services/api';
import { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';

// SearchParams kullanıldığı için Suspense içine almak Next.js kuralıdır
function ProductListContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const query = searchParams.get('q');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/products';
        const params = new URLSearchParams();
        
        if (categoryId) params.append('categoryId', categoryId);
        if (query) {
            url = '/products/search';
            params.append('q', query);
        }

        const response = await api.get(url, { params });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Ürünler yüklenemedi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, query]);

  if (loading) return <div className="text-center py-20">Ürünler Yükleniyor...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {query ? `"${query}" için sonuçlar` : 'Tüm Ürünler'}
      </h1>
      
      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border">
            <p className="text-gray-500">Aradığınız kriterlere uygun ürün bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ProductListContent />
        </Suspense>
    );
}