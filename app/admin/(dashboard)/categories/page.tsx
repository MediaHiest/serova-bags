"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", slug: "", description: "", isActive: true });
    load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else load();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: "", isActive: cat.isActive });
    setShowForm(true);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="text-xl sm:text-2xl font-medium text-text-dark">Categories</h1>
        <button className="btn-primary text-xs py-2 px-4 shrink-0" onClick={() => { setEditingId(null); setShowForm(true); }}>
          Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card max-w-md space-y-3 mb-8">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} required />
          <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input className="input-field" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-xs py-2 px-4">Save</button>
            <button type="button" className="text-sm text-text-muted" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="admin-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-lg px-4 sm:px-0">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b text-left text-text-muted">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Slug</th>
              <th className="pb-3 pr-4">Products</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">{cat.name}</td>
                <td className="py-3 pr-4 text-text-muted">{cat.slug}</td>
                <td className="py-3 pr-4">{cat._count.products}</td>
                <td className="py-3 pr-4">{cat.isActive ? "Active" : "Inactive"}</td>
                <td className="py-3 flex gap-2">
                  <button className="text-xs underline" onClick={() => startEdit(cat)}>Edit</button>
                  <button className="text-xs text-red-600 underline" onClick={() => deleteCategory(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
