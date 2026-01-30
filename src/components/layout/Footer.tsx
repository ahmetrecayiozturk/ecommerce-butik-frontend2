"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">ShopApp</h3>
            <p className="text-sm text-muted-foreground">
              Premium alışveriş deneyimi için seçkin ürünler, hızlı teslimat ve güvenli ödeme.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Keşfet</h4>
            <div className="space-y-2 text-muted-foreground">
              <Link href="/products" className="block hover:text-foreground">
                Ürünler
              </Link>
              <Link href="/orders" className="block hover:text-foreground">
                Sipariş Takibi
              </Link>
              <Link href="/contact" className="block hover:text-foreground">
                Destek
              </Link>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-foreground">Politikalar</h4>
            <div className="space-y-2 text-muted-foreground">
              <span className="block">Gizlilik Politikası</span>
              <span className="block">İade ve Değişim</span>
              <span className="block">Kargo & Teslimat</span>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <h4 className="font-semibold text-foreground">Bültene Katılın</h4>
            <p className="text-muted-foreground">
              Yeni koleksiyonlar ve kampanyalar için mail listemize katılın.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input placeholder="E-posta adresiniz" type="email" />
              <Button className="shrink-0">Kaydol</Button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>&copy; {new Date().getFullYear()} Simple E-Commerce. Spring Boot & Next.js Project.</span>
          <span>Premium alışveriş deneyimi.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
