"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Package,
  UserCircle,
  LayoutDashboard,
  MessageCircle,
  Mail,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cart, totalPrice, loading } = useCart();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role?.includes("ADMIN") ?? false;

  const cartCount = cart?.length ?? 0;
  const hasCartItems = cartCount > 0;

  const cartTotal = useMemo(
    () => totalPrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
    [totalPrice]
  );

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-semibold text-foreground">
              ShopApp
            </Link>
            {!isAdmin && (
              <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                <Link href="/products" className="hover:text-foreground transition">
                  Ürünler
                </Link>
                <Link href="/contact" className="hover:text-foreground transition">
                  Destek
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-1 justify-center px-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex w-full max-w-lg items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2 text-sm text-muted-foreground shadow-sm transition hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Ürün, kategori veya marka ara...</span>
              <kbd className="rounded-full border border-border bg-white px-2 py-0.5 text-xs text-muted-foreground">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!isAdmin && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {hasCartItems && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sepetim</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Sepet yükleniyor...</p>
                    ) : hasCartItems ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} x {item.price.toFixed(2)} ₺
                                </p>
                              </div>
                              <p className="text-sm font-semibold">{item.subtotal.toFixed(2)} ₺</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                          <span className="text-muted-foreground">Toplam</span>
                          <span className="text-base font-semibold">{cartTotal} ₺</span>
                        </div>
                        <Button className="w-full" onClick={() => router.push("/checkout")}>
                          Ödemeye Geç
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        Sepetiniz boş.
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate text-sm">{user?.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    Merhaba, {user?.firstName}
                    {isAdmin && (
                      <span className="mt-1 block text-xs font-semibold text-destructive">(Yönetici)</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" /> Profilim
                  </DropdownMenuItem>
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem onSelect={() => router.push("/orders")}>
                        <Package className="mr-2 h-4 w-4" /> Siparişlerim
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push("/my-returns")}>
                        <Package className="mr-2 h-4 w-4" /> İade Taleplerim
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push("/contact/my-messages")}>
                        <MessageCircle className="mr-2 h-4 w-4" /> Mesajlarım
                      </DropdownMenuItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onSelect={() => router.push("/admin/orders")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Yönetim Paneli
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push("/admin/messages")}>
                        <Mail className="mr-2 h-4 w-4" /> Destek Talepleri
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  Giriş
                </Button>
                <Button onClick={() => router.push("/register")}>Kayıt Ol</Button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-3">
            {!isAdmin && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {hasCartItems && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sepetim</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {loading ? (
                      <p className="text-sm text-muted-foreground">Sepet yükleniyor...</p>
                    ) : hasCartItems ? (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-lg border border-border bg-white p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">{item.productName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} x {item.price.toFixed(2)} ₺
                                </p>
                              </div>
                              <p className="text-sm font-semibold">{item.subtotal.toFixed(2)} ₺</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                          <span className="text-muted-foreground">Toplam</span>
                          <span className="text-base font-semibold">{cartTotal} ₺</span>
                        </div>
                        <Button className="w-full" onClick={() => router.push("/checkout")}>
                          Ödemeye Geç
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        Sepetiniz boş.
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-md border border-border bg-white/70 p-2 text-muted-foreground"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border bg-white/90 px-4 py-4 md:hidden">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" /> Arama Yap
              </Button>
              {!isAdmin && (
                <>
                  <Link
                    href="/products"
                    className="block text-sm font-medium text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ürünler
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-sm font-medium text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Destek
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <div className="space-y-2 pt-2 text-sm">
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="block">
                    Profilim
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="block">
                        Siparişlerim
                      </Link>
                      <Link href="/my-returns" onClick={() => setIsMenuOpen(false)} className="block">
                        İade Taleplerim
                      </Link>
                      <Link
                        href="/contact/my-messages"
                        onClick={() => setIsMenuOpen(false)}
                        className="block"
                      >
                        Mesajlarım
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link href="/admin/orders" onClick={() => setIsMenuOpen(false)} className="block">
                        Yönetim Paneli
                      </Link>
                      <Link
                        href="/admin/messages"
                        onClick={() => setIsMenuOpen(false)}
                        className="block"
                      >
                        Destek Talepleri
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-destructive"
                  >
                    Çıkış Yap
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Giriş
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.push("/register");
                      setIsMenuOpen(false);
                    }}
                  >
                    Kayıt Ol
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Ürün, kategori veya marka ara..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          <CommandGroup heading="Hızlı arama">
            <CommandItem onSelect={() => handleSearch(searchQuery)}>
              <Search className="mr-2 h-4 w-4" /> "{searchQuery || "Tüm ürünler"}" için ara
            </CommandItem>
            {!isAdmin && (
              <>
                <CommandItem onSelect={() => router.push("/products")}>Tüm ürünler</CommandItem>
                <CommandItem onSelect={() => router.push("/contact")}>Destek</CommandItem>
              </>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Navbar;
