"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import ImageUploadField from "@/components/admin/ImageUploadField";

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
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const [colors, setColors] = useState<ColorRow[]>([emptyColor()]);
  const [form, setForm] = useState({
    name: "",
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

  function updateColor(index: number, field: keyof ColorRow, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }

  function addColor() {
    setColors((prev) => [...prev, emptyColor()]);
  }

  function removeColor(index: number) {
    setColors((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function setColorUploading(active: boolean) {
    setUploadingCount((count) => Math.max(0, count + (active ? 1 : -1)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const validColors = colors.filter((c) => c.name.trim() && c.imageUrl.trim());
    if (validColors.length === 0) {
      setError("Add at least one color with a name and uploaded image");
      setSaving(false);
      return;
    }

    if (uploadingCount > 0) {
      setError("Wait for image uploads to finish");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name,
      slug: slugify(form.name),
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
        <div>
          <input
            className="input-field"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          {form.name.trim() && (
            <p className="text-xs text-text-muted mt-1.5">
              URL slug: <span className="text-text-dark">{slugify(form.name)}</span>
            </p>
          )}
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
          <p className="text-xs text-text-muted">
            Each color needs a name and an uploaded image shown when customers select it.
          </p>
          {colors.map((color, index) => (
            <div
              key={index}
              className="grid md:grid-cols-[1fr_1.5fr_auto] gap-4 items-start p-4 rounded-lg border border-text-dark/10"
            >
              <div>
                <label className="input-label">Color name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Beige"
                  value={color.name}
                  onChange={(e) => updateColor(index, "name", e.target.value)}
                  required
                />
              </div>
              <ImageUploadField
                label="Color image"
                value={color.imageUrl}
                onChange={(url) => updateColor(index, "imageUrl", url)}
                onUploadStateChange={setColorUploading}
                onError={(message) => setError(message)}
              />
              {colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-xs text-red-600 underline px-2 py-3 md:mt-7"
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
        <button
          type="submit"
          disabled={saving || uploadingCount > 0}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : uploadingCount > 0 ? "Uploading images…" : "Save Product"}
        </button>
      </form>
    </div>
  );
}
