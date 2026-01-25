"use client";

import { useEffect, useMemo, useState } from "react";
import ReturnService from "@/services/return.service";
import { ReturnRequest } from "@/types";
import { toast } from "react-toastify";
import { getTrackingUrl } from "@/utils/cargoTracking";

const statusLabels: Record<string, string> = {
  PENDING: "İade Talebiniz Alındı",
  RECEIVED: "İadeniz İnceleniyor",
  REFUNDED: "İadeniz Kabul Edilmiştir",
  REJECTED: "İade Reddedildi",
};

const statusClasses: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function MyReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await ReturnService.getMyReturns();
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
          İade Taleplerim
        </h1>
        <div className="space-y-4">
          {sortedReturns.map((item) => {
            const status = item.status ?? "PENDING";
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
                  <div>
                    <div className="text-sm text-gray-500">
                      Sipariş #{item.orderId}
                    </div>
                    {item.createdAt && (
                      <div className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString("tr-TR")}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {statusLabels[status] ?? status}
                  </span>
                </div>
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
                        className="text-blue-600 hover:underline"
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
