"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isPublished: boolean;
  isFeatured: boolean;
  category: { name: string };
  colors: { name: string; imageUrl: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      });
  }, []);

  async function togglePublish(id: string, isPublished: boolean) {
    await fetch(`/api/admin/products/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublished: !isPublished } : p))
    );
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="text-xl sm:text-2xl font-medium text-text-dark">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-xs py-2 px-4 shrink-0">
          Add Product
        </Link>
      </div>

      <div className="admin-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-lg">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b text-left text-text-muted">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4">Price</th>
              <th className="pb-3 pr-4">Stock</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">{p.name}</td>
                <td className="py-3 pr-4 text-text-muted">{p.category?.name}</td>
                <td className="py-3 pr-4">{formatPrice(p.price)} EGP</td>
                <td className="py-3 pr-4">{p.stock}</td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => togglePublish(p.id, p.isPublished)}
                    className={`text-xs px-2 py-1 rounded ${
                      p.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="py-3 flex gap-2">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-xs underline">
                    Edit
                  </Link>
                  <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-600 underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
