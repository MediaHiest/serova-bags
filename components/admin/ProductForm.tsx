"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ColorRow {
  name: string;
  imageUrl: string;
}

const emptyColor = (): ColorRow => ({ name: "", imageUrl: "" });

export default function ProductFormPage({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [colors, setColors] = useState<ColorRow[]>([emptyColor()]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    sku: "",
    stock: "0",
    categoryId: "",
    brandId: "",
    material: "",
    size: "",
    isFeatured: false,
    isPublished: false,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));

    fetch("/api/admin/brands")
      .then((res) => res.json())
      .then((data) => setBrands(data.brands ?? []));

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
              sku: p.sku ?? "",
              stock: String(p.stock),
              categoryId: p.categoryId,
              brandId: p.brandId ?? "",
              material: p.material ?? "",
              size: p.size ?? "",
              isFeatured: p.isFeatured,
              isPublished: p.isPublished,
            });
            setColors(
              p.colors?.length
                ? p.colors.map((c: { name: string; imageUrl: string }) => ({
                    name: c.name,
                    imageUrl: c.imageUrl,
                  }))
                : [emptyColor()]
            );
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

  function updateColor(index: number, field: keyof ColorRow, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function addColor() {
    setColors((prev) => [...prev, emptyColor()]);
  }

  function removeColor(index: number) {
    setColors((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validColors = colors.filter((c) => c.name.trim() && c.imageUrl.trim());
    if (validColors.length === 0) {
      setError("Add at least one color with name and image URL");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      price: parseFloat(form.price),
      sku: form.sku || undefined,
      stock: parseInt(form.stock, 10),
      categoryId: form.categoryId,
      brandId: form.brandId,
      material: form.material || undefined,
      size: form.size || undefined,
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
      colors: validColors.map((c, i) => ({
        name: c.name.trim(),
        imageUrl: c.imageUrl.trim(),
        sortOrder: i,
      })),
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
          <input className="input-field" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
        </div>
        <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select className="input-field" value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} required>
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input-field" placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <input className="input-field" placeholder="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="input-label mb-0">Colors & images</label>
            <button type="button" onClick={addColor} className="text-xs text-text-muted hover:text-text-dark underline">
              + Add color
            </button>
          </div>
          <p className="text-xs text-text-muted">Each color needs a name and image URL shown when customers select it.</p>
          {colors.map((color, index) => (
            <div key={index} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 items-start p-3 rounded-lg border border-text-dark/10">
              <input
                className="input-field"
                placeholder="Color name (e.g. Beige)"
                value={color.name}
                onChange={(e) => updateColor(index, "name", e.target.value)}
                required
              />
              <input
                className="input-field"
                placeholder="Image URL"
                value={color.imageUrl}
                onChange={(e) => updateColor(index, "imageUrl", e.target.value)}
                required
              />
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-xs text-red-600 underline px-2 py-3"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

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
