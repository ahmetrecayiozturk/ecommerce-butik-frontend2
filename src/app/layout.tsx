import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext"; // <-- EKLENDİ
import { ToastContainer } from 'react-toastify';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simple E-Commerce",
  description: "Spring Boot + Next.js Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* CartProvider, AuthProvider'ın İÇİNDE olmalı */}
          <CartProvider> 
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
            </div>
            <ToastContainer position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}