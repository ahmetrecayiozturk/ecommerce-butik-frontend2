"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // AuthContext'in yolunu kontrol et
import api from "@/services/api"; // Eğer api servisin utils içindeyse yolu düzelt (örn: '@/utils/api')

// Tipler (Backend Response'una göre)
interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

interface CartContextType {
  cart: CartItem[];
  totalPrice: number;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sepeti Backend'den Çek
  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      // Backend'deki endpointin GET /api/cart olduğunu varsayıyoruz
      const response = await api.get("/cart"); 
      // Swagger'a göre response yapısı: { items: [], totalPrice: 0 }
      setCart(response.data.items || []);
      setTotalPrice(response.data.totalPrice || 0);
    } catch (error) {
      console.error("Sepet yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı giriş yaptığında sepeti çek
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Ürün Ekle
  const addToCart = async (productId: number, quantity: number) => {
    try {
      await api.post("/cart/items", { productId, quantity });
      await fetchCart(); // Ekleme bitince sepeti güncelle
    } catch (error) {
      console.error("Sepete eklenemedi:", error);
      throw error;
    }
  };

  // Ürün Çıkar (Tamamen sil)
  const removeFromCart = async (productId: number) => {
    try {
      await api.delete(`/cart/items/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Silinemedi:", error);
    }
  };

  // Adet Güncelle (Opsiyonel backend desteği varsa)
  const updateQuantity = async (productId: number, quantity: number) => {
    try {
      await api.put(`/cart/items/${productId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error("Güncellenemedi:", error);
    }
  };

  // Sepeti Boşalt
  const clearCart = async () => {
    try {
      await api.delete("/cart");
      setCart([]);
      setTotalPrice(0);
    } catch (error) {
      console.error("Sepet temizlenemedi:", error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalPrice,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};