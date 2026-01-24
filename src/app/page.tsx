"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all ile iki isteği aynı anda atıyoruz (Performans için)
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?size=8&sort=id,desc'), // Son eklenen 8 ürün
          api.get('/categories')
        ]);

        setProducts(productsRes.data.products);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white rounded-2xl p-8 md:p-16 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Teknolojiyi Keşfet</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          En yeni elektronik ürünler, kitaplar ve daha fazlası en uygun fiyatlarla burada.
        </p>
        <Link 
          href="/products" 
          className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition inline-block"
        >
          Alışverişe Başla
        </Link>
      </section>

      {/* Kategoriler */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Kategoriler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link 
              href={`/products?categoryId=${cat.id}`} 
              key={cat.id}
              className="bg-white border hover:border-blue-500 hover:shadow-md p-6 rounded-xl text-center transition group"
            >
              <h3 className="font-semibold text-gray-700 group-hover:text-blue-600">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrin Ürünleri */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Son Eklenenler</h2>
          <Link href="/products" className="text-blue-600 hover:underline text-sm font-medium">
            Tümünü Gör →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}