import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Phone is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  street: z.string().min(1, "Street is required"),
  building: z.string().min(1, "Building is required"),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().min(0),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["COD", "CARD", "WALLET"]),
  notes: z.string().optional(),
});

export const productColorSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  imageUrl: z
    .string()
    .min(1, "Image is required")
    .refine(
      (val) => val.startsWith("/uploads/") || /^https?:\/\//.test(val),
      "Upload an image for this color"
    ),
  sortOrder: z.number().int().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  sku: z.string().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  brandId: z.string().min(1, "Brand is required"),
  material: z.string().optional(),
  size: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  colors: z.array(productColorSchema).min(1, "At least one color is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const paymentStatusSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).default("newest"),
  category: z.string().optional(),
  brand: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
