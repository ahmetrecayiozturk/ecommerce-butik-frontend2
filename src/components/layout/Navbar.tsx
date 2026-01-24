"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ShopApp
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition">
              Ürünler
            </Link>
            
            {/* Sepet Linki - Şimdilik statik, sonra dinamik sayı eklenecek */}
            <Link href="/cart" className="relative text-gray-600 hover:text-blue-600 transition">
              <ShoppingCart className="w-6 h-6" />
              {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span> */}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <User className="w-5 h-5" />
                  <span>{user?.firstName}</span>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                   <Link href="/admin/products" className="text-red-600 font-bold text-sm">ADMIN PANEL</Link>
                )}
                <button 
                  onClick={logout} 
                  className="text-gray-500 hover:text-red-600 transition"
                  title="Çıkış Yap"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Giriş Yap
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
