import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "All Bags", slug: "all-bags" },
  { name: "Tote Bags", slug: "tote-bags" },
  { name: "Crossbody Bags", slug: "crossbody-bags" },
  { name: "Clutches", slug: "clutches" },
  { name: "Wallets", slug: "wallets" },
  { name: "Backpacks", slug: "backpacks" },
  { name: "Duffle Bags", slug: "duffle-bags" },
  { name: "Laptop Bags & Sleeves", slug: "laptop-bags-sleeves" },
  { name: "Footwear", slug: "footwear" },
  { name: "Clothing", slug: "clothing" },
  { name: "Accessories", slug: "accessories" },
  { name: "Sale", slug: "sale" },
];

const bagImages = [
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
  "https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=800&q=80",
  "https://images.unsplash.com/photo-1594633312681-425a7b956cc9?w=800&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
];

const brands = [{ name: "Selora Brand", slug: "selora-brand" }];

const products = [
  {
    name: "The Linea Genuine Bag",
    slug: "the-linea-genuine-bag",
    categorySlug: "tote-bags",
    brandSlug: "selora-brand",
    description:
      "A timeless genuine leather tote crafted for the modern woman. Spacious interior with premium finishing and durable handles for everyday elegance.",
    shortDescription: "Premium genuine leather tote for everyday elegance.",
    price: 3900,
    stock: 25,
    isFeatured: true,
    isPublished: true,
    material: "Genuine Leather",
    color: "Beige",
  },
  {
    name: "Classic Beige Tote Bag",
    slug: "classic-beige-tote-bag",
    categorySlug: "tote-bags",
    description:
      "Soft structured tote in warm beige tones. Perfect for work, weekend outings, and everything in between.",
    price: 3200,
    stock: 30,
    isFeatured: true,
    isPublished: true,
    material: "Vegan Leather",
    color: "Beige",
    brandSlug: "selora-brand",
  },
  {
    name: "Black Everyday Crossbody Bag",
    slug: "black-everyday-crossbody-bag",
    categorySlug: "crossbody-bags",
    description:
      "Hands-free crossbody designed for busy days. Compact yet functional with adjustable strap and secure closure.",
    price: 2800,
    stock: 40,
    isFeatured: true,
    isPublished: true,
    material: "Leather",
    color: "Black",
    brandSlug: "selora-brand",
  },
  {
    name: "Mini Evening Clutch",
    slug: "mini-evening-clutch",
    categorySlug: "clutches",
    description:
      "Elegant mini clutch for evening occasions. Sleek silhouette with enough room for essentials.",
    price: 1800,
    stock: 20,
    isFeatured: false,
    isPublished: true,
    material: "Satin",
    color: "Gold",
    brandSlug: "selora-brand",
  },
  {
    name: "Brown Structured Tote",
    slug: "brown-structured-tote",
    categorySlug: "tote-bags",
    description:
      "Structured brown tote with clean lines and reinforced base. A wardrobe staple built to last.",
    price: 3500,
    stock: 18,
    isFeatured: true,
    isPublished: true,
    material: "Leather",
    color: "Brown",
    brandSlug: "selora-brand",
  },
  {
    name: "Soft Leather Wallet",
    slug: "soft-leather-wallet",
    categorySlug: "wallets",
    description:
      "Minimal wallet with card slots and coin pocket. Soft touch leather that ages beautifully.",
    price: 950,
    stock: 50,
    isFeatured: false,
    isPublished: true,
    material: "Leather",
    color: "Tan",
    brandSlug: "selora-brand",
  },
  {
    name: "Travel Duffle Bag",
    slug: "travel-duffle-bag",
    categorySlug: "duffle-bags",
    description:
      "Spacious duffle for weekend getaways. Durable construction with comfortable shoulder strap.",
    price: 4200,
    stock: 15,
    isFeatured: true,
    isPublished: true,
    material: "Canvas & Leather",
    color: "Olive",
    brandSlug: "selora-brand",
  },
  {
    name: "Casual Backpack",
    slug: "casual-backpack",
    categorySlug: "backpacks",
    description:
      "Lightweight backpack for daily commutes. Multiple compartments and padded straps for comfort.",
    price: 2600,
    stock: 35,
    isFeatured: false,
    isPublished: true,
    material: "Nylon",
    color: "Black",
    brandSlug: "selora-brand",
  },
  {
    name: "Olive Laptop Sleeve",
    slug: "olive-laptop-sleeve",
    categorySlug: "laptop-bags-sleeves",
    description:
      "Slim laptop sleeve with soft interior lining. Fits up to 15-inch laptops.",
    price: 1200,
    stock: 45,
    isFeatured: false,
    isPublished: true,
    material: "Felt & Leather",
    color: "Olive",
    size: "15 inch",
    brandSlug: "selora-brand",
  },
  {
    name: "Elegant Shoulder Bag",
    slug: "elegant-shoulder-bag",
    categorySlug: "crossbody-bags",
    description:
      "Refined shoulder bag with curved silhouette. Transition effortlessly from day to night.",
    price: 3400,
    stock: 22,
    isFeatured: true,
    isPublished: true,
    material: "Leather",
    color: "Cream",
    brandSlug: "selora-brand",
  },
  {
    name: "Premium Daily Handbag",
    slug: "premium-daily-handbag",
    categorySlug: "tote-bags",
    description:
      "Our signature daily handbag with premium hardware and organized interior pockets.",
    price: 4100,
    stock: 20,
    isFeatured: true,
    isPublished: true,
    material: "Genuine Leather",
    color: "Black",
    brandSlug: "selora-brand",
  },
  {
    name: "Modern City Bag",
    slug: "modern-city-bag",
    categorySlug: "crossbody-bags",
    description:
      "Urban-inspired crossbody with modern lines. Designed for the woman on the move.",
    price: 2900,
    stock: 28,
    isFeatured: true,
    isPublished: true,
    material: "Vegan Leather",
    color: "Charcoal",
    brandSlug: "selora-brand",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, isActive: true },
      create: { ...cat, isActive: true },
    });
  }

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, isActive: true },
      create: { ...b, isActive: true },
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  const brandMap = Object.fromEntries(
    (await prisma.brand.findMany()).map((b) => [b.slug, b.id])
  );

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId = categoryMap[p.categorySlug];
    const brandId = brandMap[p.brandSlug];
    if (!categoryId || !brandId) continue;

    const { categorySlug, brandSlug, color, ...productData } = p;
    const data = { ...productData, categoryId, brandId };

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });

    const existingColors = await prisma.productColor.count({
      where: { productId: product.id },
    });

    if (existingColors === 0) {
      const colorVariants =
        i === 0
          ? [
              { name: "Beige", imageUrl: bagImages[0], sortOrder: 0 },
              { name: "Black", imageUrl: bagImages[1], sortOrder: 1 },
            ]
          : [{ name: color, imageUrl: bagImages[i % bagImages.length], sortOrder: 0 }];

      await prisma.productColor.createMany({
        data: colorVariants.map((c) => ({ ...c, productId: product.id })),
      });
    }
  }

  const demoEmail = "demo@selora.com";
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!existingUser) {
    const hashed = await bcrypt.hash("password123", 12);
    await prisma.user.create({
      data: {
        fullName: "Demo User",
        email: demoEmail,
        password: hashed,
        phone: "+201234567890",
        profile: { create: {} },
        cart: { create: {} },
      },
    });
    console.log("Created demo user: demo@selora.com / password123");
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
