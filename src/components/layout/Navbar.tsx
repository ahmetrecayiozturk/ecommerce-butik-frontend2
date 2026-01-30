"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingCart, User, LogOut, Menu, X, ChevronDown, 
  Package, UserCircle, Search, LayoutDashboard, MessageCircle, Mail 
} from 'lucide-react'; // <--- MessageCircle ve Mail ikonlarını ekledik
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Admin kontrolü
  const isAdmin = user?.role?.includes('ADMIN') ?? false;

  // Arama Fonksiyonu
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. SOL: LOGO */}
          <Link href="/" className="text-2xl font-bold text-blue-600 flex-shrink-0">
            ShopApp
          </Link>

          {/* 2. ORTA: ARAMA ÇUBUĞU */}
          <div className="hidden md:flex flex-1 mx-8 max-w-lg">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 bottom-0 px-3 text-gray-500 hover:text-blue-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* 3. SAĞ: MENÜLER */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* --- KULLANICI LİNKLERİ (Ürünler & Destek) --- */}
            {!isAdmin && (
              <>
                <Link href="/products" className="text-gray-600 hover:text-blue-600 transition font-medium">
                  Ürünler
                </Link>
                {/* YENİ: Destek Butonu */}
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition font-medium flex items-center">
                  Destek
                </Link>
              </>
            )}
            
            {/* Sepet İkonu: ADMIN GÖRMESİN */}
            {!isAdmin && (
              <Link href="/cart" className="relative text-gray-600 hover:text-blue-600 transition group">
                <ShoppingCart className="w-6 h-6 group-hover:text-blue-600" />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
                >
                  <User className="w-5 h-5" />
                  <span className="max-w-[100px] truncate">{user?.firstName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-lg shadow-xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500">
                      Merhaba, {user?.firstName}
                      {isAdmin && <span className="block text-red-600 font-bold mt-1">(Yönetici)</span>}
                    </div>
                    
                    <Link href="/profile" 
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center" 
                          onClick={() => setIsProfileOpen(false)}>
                      <UserCircle className="w-4 h-4 mr-2 text-gray-400" /> Profilim
                    </Link>
                    
                    {/* SİPARİŞ ve İADE LİNKLERİ: ADMIN GÖRMESİN */}
                    {!isAdmin && (
                      <>
                        <Link href="/orders" 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center" 
                              onClick={() => setIsProfileOpen(false)}>
                          <Package className="w-4 h-4 mr-2 text-gray-400" /> Siparişlerim
                        </Link>
                        <Link href="/my-returns" 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center" 
                              onClick={() => setIsProfileOpen(false)}>
                          <Package className="w-4 h-4 mr-2 text-gray-400" /> İade Taleplerim
                        </Link>
                        {/* Kullanıcı için Mesajlarım Linki */}
                        <Link href="/contact/my-messages" 
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center" 
                              onClick={() => setIsProfileOpen(false)}>
                          <MessageCircle className="w-4 h-4 mr-2 text-gray-400" /> Mesajlarım
                        </Link>
                      </>
                    )}

                    {/* YÖNETİM PANELİ & DESTEK: SADECE ADMIN */}
                    {isAdmin && (
                        <>
                          <Link href="/admin/orders" 
                                className="px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 flex items-center" 
                                onClick={() => setIsProfileOpen(false)}>
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Yönetim Paneli
                          </Link>
                          {/* Admin İçin Destek Paneli Linki */}
                          <Link href="/admin/messages" 
                                className="px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 flex items-center" 
                                onClick={() => setIsProfileOpen(false)}>
                            <Mail className="w-4 h-4 mr-2" /> Destek Talepleri
                          </Link>
                        </>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center text-red-500"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                        </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium text-sm">
                  Giriş
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBİL MENÜ BUTONU --- */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobilde Sepet: ADMIN GÖRMESİN */}
            {!isAdmin && (
              <Link href="/cart" className="relative text-gray-600">
                <ShoppingCart className="w-6 h-6" />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-1">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- MOBİL MENÜ İÇERİĞİ --- */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white absolute top-16 left-0 right-0 shadow-lg px-4 flex flex-col space-y-4 z-40">
            
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Ürün ara..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 text-gray-500">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Mobilde Ürünler ve Destek: ADMIN GÖRMESİN */}
            {!isAdmin && (
              <>
                <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium py-1" onClick={() => setIsMenuOpen(false)}>
                  Tüm Ürünler
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium py-1" onClick={() => setIsMenuOpen(false)}>
                  Destek
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 pt-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3 px-1">
                    <User className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                      <UserCircle className="w-5 h-5 mr-3 text-gray-400" /> Profilim
                  </Link>

                  {/* Mobilde Sipariş/İade: ADMIN GÖRMESİN */}
                  {!isAdmin && (
                    <>
                      <Link href="/orders" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                          <Package className="w-5 h-5 mr-3 text-gray-400" /> Siparişlerim
                      </Link>
                      <Link href="/my-returns" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                          <Package className="w-5 h-5 mr-3 text-gray-400" /> İade Taleplerim
                      </Link>
                      <Link href="/contact/my-messages" className="text-gray-700 hover:text-blue-600 py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                          <MessageCircle className="w-5 h-5 mr-3 text-gray-400" /> Mesajlarım
                      </Link>
                    </>
                  )}

                  {/* Admin Menüsü Mobil */}
                  {isAdmin && (
                      <>
                        <Link href="/admin/orders" className="text-red-600 font-bold py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                          <LayoutDashboard className="w-5 h-5 mr-3" /> Yönetim Paneli
                        </Link>
                        <Link href="/admin/messages" className="text-blue-600 font-bold py-2 flex items-center" onClick={() => setIsMenuOpen(false)}>
                          <Mail className="w-5 h-5 mr-3" /> Destek Talepleri
                        </Link>
                      </>
                  )}

                  <button onClick={() => {logout(); setIsMenuOpen(false);}} className="text-left text-red-500 hover:text-red-700 py-2 flex items-center w-full mt-2">
                    <LogOut className="w-5 h-5 mr-3" /> Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/login" className="text-center border border-gray-300 py-2.5 rounded-lg text-gray-700 font-medium" onClick={() => setIsMenuOpen(false)}>
                  Giriş Yap
                </Link>
                <Link href="/register" className="text-center bg-blue-600 text-white py-2.5 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;