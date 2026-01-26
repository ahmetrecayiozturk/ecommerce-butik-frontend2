"use client";

import { useCallback, useEffect, useState } from 'react';
import api from '@/services/api';
import { Category, Product, ProductRequest, ProductListResponse } from '@/types';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

const initialForm: ProductRequest = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  categoryId: 0
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductRequest>(initialForm);
  const [editingStocks, setEditingStocks] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get<ProductListResponse>('/products', { params: { page: 0, size: 50 } }),
        api.get<Category[]>('/categories')
      ]);
      setProducts(productsResponse.data.products);
      setEditingStocks(
        Object.fromEntries(
          productsResponse.data.products.map((product) => [
            product.id,
            product.stock,
          ]),
        ),
      );
      setCategories(categoriesResponse.data);
      if (categoriesResponse.data.length > 0) {
        setForm((prev) =>
          prev.categoryId === 0 ? { ...prev, categoryId: categoriesResponse.data[0].id } : prev
        );
      }
    } catch {
      toast.error("Ürünler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success("Ürün silindi.");
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch {
      toast.error("Ürün silinemedi.");
    }
  };

  const handleStockUpdate = async (
    productId: number,
    stock: number,
    previousStock: number,
  ) => {
    try {
      const response = await api.put<Product>(
        `/products/admin/products/${productId}/stock`,
        null,
        { params: { stock } },
      );
      toast.success("Stok güncellendi.");
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? response.data : item)),
      );
      setEditingStocks((prev) => ({
        ...prev,
        [productId]: response.data.stock,
      }));
    } catch {
      toast.error("Stok güncellenemedi.");
      setEditingStocks((prev) => ({ ...prev, [productId]: previousStock }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/products', form);
      toast.success("Ürün eklendi.");
      setForm(initialForm);
      fetchData();
    } catch {
      toast.error("Ürün eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Ürün Yönetimi</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Ürün</th>
                <th className="py-2">Kategori</th>
                <th className="py-2">Fiyat</th>
                <th className="py-2">Stok</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="py-3 text-gray-500">{product.categoryName}</td>
                  <td className="py-3 text-gray-500">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
                  </td>
                  <td className="py-3 text-gray-500">
                    <input
                      type="number"
                      className="w-24 border rounded-lg px-2 py-1 text-sm text-gray-700"
                      value={editingStocks[product.id] ?? product.stock}
                      min={0}
                      onChange={(event) => {
                        const nextStock = Number(event.target.value);
                        setEditingStocks((prev) => ({
                          ...prev,
                          [product.id]: Number.isNaN(nextStock) ? 0 : nextStock,
                        }));
                      }}
                      onBlur={(event) => {
                        const nextStock = Number(event.target.value);
                        const previousStock = product.stock;
                        if (!Number.isNaN(nextStock) && nextStock !== previousStock) {
                          handleStockUpdate(product.id, nextStock, previousStock);
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="secondary" onClick={() => handleDelete(product.id)}>
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Yeni Ürün</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Ürün Adı</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: Number(event.target.value) }))}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fiyat</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Stok</label>
            <input
              type="number"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.stock}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              required
              min="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Görsel URL</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.imageUrl || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Açıklama</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={form.description || ''}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" isLoading={saving}>
          Ürün Ekle
        </Button>
      </form>
    </div>
  );
}
