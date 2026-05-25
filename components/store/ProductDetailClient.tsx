"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/store/ProductCard";
import { formatPrice } from "@/lib/utils";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    salePrice?: number | null;
    effectivePrice: number;
    maxQuantity: number;
    brand?: string | null;
    material?: string | null;
    color?: string | null;
    size?: string | null;
    category: { name: string; slug: string };
    images: { id: string; url: string; altText?: string | null }[];
    inStock: boolean;
  };
  related: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    effectivePrice: number;
    image: string | null;
  }[];
}

export default function ProductDetailClient({ product, related }: ProductDetailProps) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const images = product.images.length > 0 ? product.images : [{ id: "0", url: "", altText: product.name }];
  const hasSale = product.salePrice && product.salePrice < product.price;

  async function addToCart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/account/login?redirect=/products/" + product.slug);
          return;
        }
        setError(data.error ?? "Failed to add to cart");
        return;
      }
      router.push("/cart");
    } catch {
      setError("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg-off-white mb-4">
            {images[selectedImage]?.url ? (
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].altText ?? product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 ${
                    i === selectedImage ? "border-green-charcoal" : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm tracking-widest uppercase text-text-muted mb-2 font-medium">{product.category.name}</p>
          <h1 className="page-title text-3xl md:text-4xl lg:text-5xl text-text-dark mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            {hasSale ? (
              <>
                <span className="text-2xl font-semibold text-text-dark">
                  {formatPrice(product.salePrice!)} EGP
                </span>
                <span className="text-xl text-text-muted line-through">
                  {formatPrice(product.price)} EGP
                </span>
              </>
            ) : (
              <span className="text-2xl font-semibold text-text-dark">
                {formatPrice(product.price)} EGP
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-base text-text-muted font-normal mb-6 leading-relaxed">{product.shortDescription}</p>
          )}

          <div className="space-y-2.5 text-base mb-8">
            {product.material && (
              <p><span className="text-text-muted">Material:</span> {product.material}</p>
            )}
            {product.color && (
              <p><span className="text-text-muted">Color:</span> {product.color}</p>
            )}
            {product.size && (
              <p><span className="text-text-muted">Size:</span> {product.size}</p>
            )}
            {product.brand && (
              <p><span className="text-text-muted">Brand:</span> {product.brand}</p>
            )}
            {!product.inStock && (
              <p className="text-red-600">Out of stock</p>
            )}
          </div>

          {product.inStock && (
            <div className="flex items-center gap-4 mb-6">
              <label className="text-base text-text-muted font-medium">Quantity</label>
              <div className="flex items-center border border-text-dark/20">
                <button
                  type="button"
                  className="px-4 py-2.5 text-lg hover:bg-bg-off-white"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="px-5 py-2.5 text-base font-medium">{quantity}</span>
                <button
                  type="button"
                  className="px-4 py-2.5 text-lg hover:bg-bg-off-white disabled:opacity-40"
                  onClick={() => setQuantity(Math.min(product.maxQuantity, quantity + 1))}
                  disabled={quantity >= product.maxQuantity}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            onClick={addToCart}
            disabled={!product.inStock || loading}
            className="btn-primary w-full md:w-auto disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>

          <div className="mt-10 prose prose-sm max-w-none">
            <h3 className="text-sm tracking-widest uppercase text-text-dark mb-3 font-medium">Description</h3>
            <p className="text-base text-text-muted font-normal leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="page-title text-3xl text-center text-text-dark mb-2">Related Products</h2>
          <div className="title-underline mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                salePrice={p.salePrice}
                image={p.image}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
