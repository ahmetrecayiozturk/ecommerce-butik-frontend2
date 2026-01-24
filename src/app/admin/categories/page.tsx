"use client";

import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Category, CategoryRequest } from '@/types';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

const initialForm: CategoryRequest = {
  name: '',
  description: ''
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryRequest>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch {
      toast.error("Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: number) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success("Kategori silindi.");
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
    } catch {
      toast.error("Kategori silinemedi.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/categories', form);
      toast.success("Kategori eklendi.");
      setForm(initialForm);
      fetchCategories();
    } catch {
      toast.error("Kategori eklenemedi.");
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Kategori Yönetimi</h1>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                <div className="font-medium text-gray-800">{category.name}</div>
                <div className="text-sm text-gray-500">{category.description}</div>
              </div>
              <Button variant="danger" onClick={() => handleDelete(category.id)}>
                Sil
              </Button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Yeni Kategori</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Kategori Adı</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Açıklama</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </div>
        <Button type="submit" isLoading={saving}>
          Kategori Ekle
        </Button>
      </form>
    </div>
  );
}
