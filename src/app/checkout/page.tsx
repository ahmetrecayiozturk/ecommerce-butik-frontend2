"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ShieldCheck, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState<string | null>(null);
  const router = useRouter();

  // Bu useEffect, paymentHtml değiştiğinde içindeki scripti bulup çalıştırır
  useEffect(() => {
    if (paymentHtml) {
      // 1. Önce HTML içindeki script içeriğini regex ile bulalım
      // Iyzico response'u genelde: <div...></div> <script>...kod...</script> şeklindedir
      const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/;
      const match = paymentHtml.match(scriptRegex);

      if (match && match[1]) {
        try {
          // 2. Script içeriğini alıp manuel çalıştırıyoruz
          // "window.eval" veya "new Function" yerine DOM'a script tag eklemek daha güvenlidir
          const scriptContent = match[1];
          const scriptElement = document.createElement("script");
          scriptElement.type = "text/javascript";
          scriptElement.innerHTML = scriptContent;
          
          // Scripti sayfaya ekle (Bu işlem Iyzico formunu tetikler)
          document.body.appendChild(scriptElement);

          // Temizlik: İş bitince script tagini kaldırabiliriz (opsiyonel)
          // return () => document.body.removeChild(scriptElement);
        } catch (err) {
          console.error("Iyzico script çalıştırılamadı:", err);
          toast.error("Ödeme formu yüklenirken hata oluştu.");
        }
      }
    }
  }, [paymentHtml]);

  const handlePaymentProcess = async () => {
    setLoading(true);
    try {
      // 1. ADIM: Sepeti Siparişe Dönüştür
      const orderRes = await api.post('/orders');
      const orderId = orderRes.data.id;
      
      console.log("Sipariş oluşturuldu, ID:", orderId);

      // 2. ADIM: Ödemeyi Başlat (Iyzico Formunu İste)
      const paymentRes = await api.post('/payment/initiate', { orderId });
      
      // Backend'den gelen HTML form verisi
      const htmlContent = paymentRes.data.checkoutFormContent;
      
      setPaymentHtml(htmlContent);
      toast.info("Ödeme formu yükleniyor...");

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
        
        {!paymentHtml ? (
          <div className="text-center space-y-6 py-10">
            <div className="flex justify-center mb-4">
               <div className="bg-green-100 p-4 rounded-full">
                  <ShieldCheck className="w-16 h-16 text-green-600" />
               </div>
            </div>
            
            <h2 className="text-2xl font-semibold">Siparişinizi Onaylayın</h2>
            <p className="text-gray-500 max-w-md mx-auto">
                Ödeme işlemi 256-bit SSL sertifikası ile korunan Iyzico altyapısı üzerinden güvenle gerçekleştirilecektir.
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-8">
                <Lock className="w-4 h-4" />
                <span>Secure Payment via Iyzico</span>
            </div>

            <Button 
                onClick={handlePaymentProcess} 
                className="w-full md:w-1/2 py-4 text-lg mx-auto"
                isLoading={loading}
            >
                {loading ? 'İşleniyor...' : 'Ödeme Formunu Aç'}
            </Button>
          </div>
        ) : (
          <div>
            {/* Iyzico bu div'in içine formu basar */}
            <div id="iyzipay-checkout-form" className="responsive"></div>
          </div>
        )}
      </div>
    </div>
  );
}
