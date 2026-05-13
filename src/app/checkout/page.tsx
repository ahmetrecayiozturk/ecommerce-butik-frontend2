"use client";

import { useState } from 'react';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const handlePaymentProcess = async () => {
    setLoading(true);
    try {
      // 1. ADIM: Sepeti Siparişe Dönüştür
      const shippingAddress = typeof window !== 'undefined'
        ? localStorage.getItem('shippingAddress')?.trim()
        : '';
      if (!shippingAddress) {
        toast.error("Lütfen teslimat adresi ekleyin.");
        router.push('/cart');
        return;
      }
      const orderRes = await api.post('/orders', { shippingAddress });
      const orderId = orderRes.data.id;
      
      console.log("Sipariş oluşturuldu, ID:", orderId);

      // 2. ADIM: Ödemeyi Başlat
      const paymentRes = await api.post('/payment/initiate', { orderId });
      const checkoutUrl = paymentRes.data.checkoutUrl;
      if (!checkoutUrl) {
        throw new Error("checkoutUrl bulunamadı");
      }
      setRedirecting(true);
      toast.info("Ödeme sayfasına yönlendiriliyorsunuz...");
      window.location.assign(checkoutUrl);

    } catch (error: unknown) {
      console.error(error);
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      const msg = message || "Ödeme başlatılamadı.";
      toast.error(msg);
      
      if(msg.includes("stock") || msg.includes("empty")) {
        router.push('/cart');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Güvenli Ödeme</h1>

      <div className="bg-white p-8 rounded-2xl shadow-lg border relative min-h-[400px]">
        
        <div className="text-center space-y-6 py-10">
          <div className="flex justify-center mb-4">
             <div className="bg-green-100 p-4 rounded-full">
                <ShieldCheck className="w-16 h-16 text-green-600" />
             </div>
          </div>
          
          <h2 className="text-2xl font-semibold">Siparişinizi Onaylayın</h2>
          <p className="text-gray-500 max-w-md mx-auto">
              Ödeme işlemi güvenli ödeme sağlayıcısı üzerinden gerçekleştirilecektir.
          </p>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-8">
              <Lock className="w-4 h-4" />
              <span>Secure Payment</span>
          </div>

          <Button
              onClick={handlePaymentProcess}
              className="w-full md:w-1/2 py-4 text-lg mx-auto"
              isLoading={loading}
              disabled={redirecting}
          >
              {redirecting ? 'Yönlendiriliyor...' : loading ? 'İşleniyor...' : 'Ödeme Sayfasına Git'}
          </Button>
        </div>
      </div>
    </div>
  );
}
