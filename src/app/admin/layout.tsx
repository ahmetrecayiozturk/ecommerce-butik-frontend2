"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/admin/products', label: 'Ürünler' },
  { href: '/admin/orders', label: 'Siparişler' },
  { href: '/admin/categories', label: 'Kategoriler' },
  { href: '/admin/returns', label: 'İadeler' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

  if (isLoading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h1>
        <p className="text-gray-500 mb-6">Bu sayfayı görüntülemek için admin olmanız gerekiyor.</p>
        <Link href="/" className="text-blue-600 hover:underline">Anasayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="bg-white rounded-2xl border shadow-sm p-6 lg:w-64">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="flex-1">{children}</section>
    </div>
  );
}
