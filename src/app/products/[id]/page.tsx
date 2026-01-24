"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/services/api';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        toast.error("Ürün bulunamadı!");
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Sepete eklemek için lütfen giriş yapın.");
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await api.post('/cart/items', {
        productId: product?.id,
        quantity: quantity
      });
      toast.success("Ürün sepete eklendi!");
      // İleride burada sepet context'ini güncelleyeceğiz
    } catch (error: unknown) {
        // Backend'den gelen stok hatası vb.
        const msg = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Sepete eklenirken hata oluştu."
          : "Sepete eklenirken hata oluştu.";
        toast.error(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || !product) return <div className="text-center py-20">Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-10">
      <button 
        onClick={() => router.back()} 
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Sol Taraf: Resim */}
        <div className="relative h-96 w-full bg-gray-50 rounded-xl overflow-hidden border">
          <Image
            src={product.imageUrl || 'https://via.placeholder.com/500'}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Sağ Taraf: Bilgiler */}
        <div className="flex flex-col">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                {product.categoryName}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center mb-6 space-x-4">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-bold text-gray-700 ml-1">{product.averageRating?.toFixed(1) || "New"}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">{product.reviewCount} Değerlendirme</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
            </p>

            <div className="mt-auto border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                    </div>
                    <div className={`px-4 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock > 0 ? `Stokta: ${product.stock}` : 'Tükendi'}
                    </div>
                </div>

                <div className="flex space-x-4">
                    <div className="w-32">
                        <input 
                            type="number" 
                            min="1" 
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            className="w-full px-4 py-3 border rounded-lg text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={product.stock === 0}
                        />
                    </div>
                    <Button 
                        onClick={handleAddToCart}
                        className="flex-1 text-lg"
                        disabled={product.stock === 0 || addingToCart}
                        isLoading={addingToCart}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}