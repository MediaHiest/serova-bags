"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

export default function ProductFormPage({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    salePrice: "",
    shippingPrice: "0",
    sku: "",
    stock: "0",
    categoryId: "",
    brand: "Selora Brand",
    material: "",
    color: "",
    size: "",
    isFeatured: false,
    isPublished: false,
    imageUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));

    if (productId) {
      fetch(`/api/admin/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          const p = data.product;
          if (p) {
            setForm({
              name: p.name,
              slug: p.slug,
              description: p.description,
              shortDescription: p.shortDescription ?? "",
              price: String(p.price),
              salePrice: p.salePrice ? String(p.salePrice) : "",
              shippingPrice: String(p.shippingPrice ?? 0),
              sku: p.sku ?? "",
              stock: String(p.stock),
              categoryId: p.categoryId,
              brand: p.brand ?? "Selora Brand",
              material: p.material ?? "",
              color: p.color ?? "",
              size: p.size ?? "",
              isFeatured: p.isFeatured,
              isPublished: p.isPublished,
              imageUrl: p.images?.[0]?.url ?? "",
            });
          }
          setLoading(false);
        });
    }
  }, [productId]);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || slugify(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      shippingPrice: parseFloat(form.shippingPrice) || 0,
      sku: form.sku || undefined,
      stock: parseInt(form.stock, 10),
      categoryId: form.categoryId,
      brand: form.brand || undefined,
      material: form.material || undefined,
      color: form.color || undefined,
      size: form.size || undefined,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
      images: form.imageUrl ? [{ url: form.imageUrl, altText: form.name }] : [],
    };

    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to save product");
      setSaving(false);
      return;
    }

    router.push("/admin/products");
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-text-muted hover:text-text-dark mb-4 inline-block">
        ← Back to Products
      </Link>
      <h1 className="text-2xl font-medium text-text-dark mb-8">
        {productId ? "Edit Product" : "Add Product"}
      </h1>

      <form onSubmit={handleSubmit} className="admin-card max-w-2xl space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
          <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
        <textarea className="input-field min-h-24" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="input-field" placeholder="Short Description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input-field" type="number" step="0.01" placeholder="Price (EGP)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="input-field" type="number" step="0.01" placeholder="Sale Price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
          <input className="input-field" type="number" step="0.01" placeholder="Shipping Price (EGP)" value={form.shippingPrice} onChange={(e) => setForm({ ...form, shippingPrice: e.target.value })} required />
          <input className="input-field" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        </div>
        <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="grid md:grid-cols-3 gap-4">
          <input className="input-field" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input className="input-field" placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <input className="input-field" placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </div>
        <input className="input-field" placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        <input className="input-field" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        <p className="text-xs text-text-muted">TODO: Add file upload / S3 integration for product images</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Published
          </label>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
