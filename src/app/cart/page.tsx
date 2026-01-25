"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Cart } from '@/types';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const router = useRouter();

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error("Sepet yüklenemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem('shippingAddress');
      if (storedAddress) {
        setShippingAddress(storedAddress);
      }
    }
  }, []);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      // Optimistic update (UI'ı hemen güncelle)
      setCart(prev => prev ? {
        ...prev,
        items: prev.items.map(item => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      } : null);

      await api.put(`/cart/items/${productId}`, { quantity: newQuantity });
      fetchCart(); // Backend'den güncel fiyatları çek
    } catch {
      toast.error("Miktar güncellenemedi");
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await api.delete(`/cart/items/${productId}`);
      toast.success("Ürün sepetten silindi");
      fetchCart();
    } catch {
      toast.error("Silme işlemi başarısız");
    }
  };

  const isShippingAddressValid = shippingAddress.trim().length > 0;

  const handleProceedToCheckout = () => {
    if (!isShippingAddressValid) {
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('shippingAddress', shippingAddress.trim());
    }
    router.push('/checkout');
  };

  if (loading) return <div className="text-center py-20">Sepet yükleniyor...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sepetiniz Boş</h2>
        <p className="text-gray-500 mb-8">Henüz hiç ürün eklemediniz.</p>
        <Link href="/products">
          <Button>Alışverişe Başla</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Alışveriş Sepeti</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Taraf: Ürün Listesi */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border flex items-center gap-4 shadow-sm">
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                 {/* Not: Backend CartItemResponse'da resim URL'i dönmüyorsa placeholder kullanıyoruz. 
                     İdealde Backend DTO'suna imageUrl eklenmeli. */}
                <Image 
                  src="https://via.placeholder.com/150" 
                  alt={item.productName} 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="flex-grow">
                <Link href={`/products/${item.productId}`} className="font-semibold text-lg text-gray-800 hover:text-blue-600">
                  {item.productName}
                </Link>
                <div className="text-blue-600 font-bold mt-1">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.price)}
                </div>
              </div>

              {/* Miktar Kontrol */}
              <div className="flex items-center bg-gray-50 rounded-lg border">
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-2 hover:bg-gray-200 rounded-l-lg transition"
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                <button 
                   onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                   className="p-2 hover:bg-gray-200 rounded-r-lg transition"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <button 
                onClick={() => removeItem(item.productId)}
                className="p-2 text-gray-400 hover:text-red-600 transition"
                title="Sil"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Sağ Taraf: Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6">Sipariş Özeti</h2>
            
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Ara Toplam</span>
              <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cart.totalPrice)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Kargo</span>
              <span className="text-green-600 font-medium">Bedava</span>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Toplam</span>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cart.totalPrice)}
                </span>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <label htmlFor="shippingAddress" className="text-sm font-medium text-gray-700">
                Teslimat Adresi
              </label>
              <textarea
                id="shippingAddress"
                className="w-full rounded-lg border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={3}
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
              />
            </div>

            <Button
              className="w-full py-4 text-lg"
              onClick={handleProceedToCheckout}
              disabled={!isShippingAddressValid}
            >
              Ödemeye Geç <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
