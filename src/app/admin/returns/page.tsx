"use client";

import { useEffect, useMemo, useState } from "react";
import ReturnService from "@/services/return.service";
import { ReturnRequest, ReturnStatus } from "@/types";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { getTrackingUrl } from "@/utils/cargoTracking";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await ReturnService.getAll();
      setReturns(response.data);
    } catch {
      toast.error("İade talepleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatusUpdate = async (
    item: ReturnRequest,
    status: ReturnStatus,
  ) => {
    if (!item.id) return;
    
    setProcessingId(item.id);
    try {
      const response = await ReturnService.updateStatus(item.id, status);
      toast.success("İade durumu güncellendi.");
      setReturns((prev) =>
        prev.map((entry) => (entry.id === item.id ? response.data : entry)),
      );
    } catch {
      toast.error("İade durumu güncellenemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const sortedReturns = useMemo(
    () =>
      [...returns].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
    [returns],
  );

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          İade Talepleri
        </h1>
        <div className="space-y-4">
          {sortedReturns.map((item) => {
            const trackingUrl = getTrackingUrl(
              item.cargoFirm,
              item.trackingCode,
            );
            return (
              <div
                key={item.id ?? `${item.orderId}-${item.userId}`}
                className="border rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  {/* SOL TARAFTAKİ BİLGİLER */}
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{item.orderId}
                    </div>
                    <div className="text-sm text-gray-500">
                      Kullanıcı #{item.userId}
                    </div>
                    {item.createdAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>

                  {/* SAĞ TARAFTAKİ BUTONLAR VE STATÜ */}
                  <div className="flex items-center gap-2">
                    {/* STATÜ BADGE'İ */}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-700">
                      {item.status === 'PENDING' ? 'Bekliyor' : 
                       item.status === 'RECEIVED' ? 'İnceleniyor' : 
                       item.status === 'REFUNDED' ? 'Kabul Edildi' : 
                       item.status === 'REJECTED' ? 'Reddedildi' : 'Bekliyor'}
                    </span>

                    {/* --- BUTON MANTIĞI BURADA DEĞİŞTİ --- */}

                    {/* 1. ADIM: Sadece PENDING ise 'Teslim Al' göster */}
                    {(item.status === "PENDING" || !item.status) && (
                      <Button
                        className="text-sm"
                        onClick={() => handleStatusUpdate(item, "RECEIVED")}
                        isLoading={processingId === item.id}
                      >
                        Teslim Al
                      </Button>
                    )}

                    {/* 2. ADIM: Sadece RECEIVED ise 'Onayla' göster */}
                    {item.status === "RECEIVED" && (
                      <Button
                        className="text-sm"
                        onClick={() => handleStatusUpdate(item, "REFUNDED")}
                        isLoading={processingId === item.id}
                      >
                        Onayla
                      </Button>
                    )}

                    {/* 3. ADIM: İşlem bitmediyse 'Reddet' hep görünsün */}
                    {item.status !== "REFUNDED" && item.status !== "REJECTED" && (
                      <Button
                        variant="secondary"
                        className="text-sm ml-2"
                        onClick={() => handleStatusUpdate(item, "REJECTED")}
                        isLoading={processingId === item.id}
                      >
                        Reddet
                      </Button>
                    )}

                    {/* 4. ADIM: İşlem bittiyse yazı göster */}
                    {(item.status === "REFUNDED" || item.status === "REJECTED") && (
                       <span className="text-xs text-gray-400 italic ml-2">İşlem Tamamlandı</span>
                    )}

                  </div>
                </div>

                {/* ALT KISIMDAKİ DETAYLAR (AYNI KALDI) */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium text-gray-700">
                      Kargo Firması:
                    </span>{" "}
                    {item.cargoFirm || "—"}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Takip Kodu:
                    </span>{" "}
                    {trackingUrl ? (
                      <a
                        href={trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-700 hover:underline"
                      >
                        🔍 Kargoyu Sorgula
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sebep:</span>{" "}
                    {item.reason || "—"}
                  </div>
                </div>
              </div>
            );
          })}
          {sortedReturns.length === 0 && (
            <div className="text-sm text-gray-500">Henüz iade talebi yok.</div>
          )}
        </div>
      </div>
    </div>
  );
}
