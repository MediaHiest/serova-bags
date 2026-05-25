import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export default function ProductCard({ name, slug, price, image }: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-bg-off-white">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-bg-pattern flex items-center justify-center text-text-muted text-sm">
            No image
          </div>
        )}
        <div className="product-card-overlay absolute bottom-0 left-0 right-0 px-4 py-2.5 flex items-center justify-between gap-3">
          <span className="product-card-name truncate">{name}</span>
          <span className="product-card-price whitespace-nowrap">
            {formatPrice(price)} EGP
          </span>
        </div>
      </div>
    </Link>
  );
}
