import { prisma } from "./prisma";
import {
  calculateCartShippingFee,
  decimalToNumber,
  generateOrderNumber,
  getEffectivePrice,
} from "./utils";

export async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
          },
        },
      },
    });
  }

  return cart;
}

export async function recalculateCartItemPrices(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true },
  });

  for (const item of items) {
    const unitPrice = getEffectivePrice(item.product.price, item.product.salePrice);
    if (decimalToNumber(item.unitPrice) !== unitPrice) {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { unitPrice },
      });
    }
  }
}

export function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const items = cart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product.price, item.product.salePrice);
    const lineTotal = unitPrice * item.quantity;
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: decimalToNumber(item.product.price),
        salePrice: item.product.salePrice
          ? decimalToNumber(item.product.salePrice)
          : null,
        image: item.product.images[0]?.url ?? null,
      },
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingItems = cart.items.map((item) => ({
    quantity: item.quantity,
    shippingPrice: decimalToNumber(item.product.shippingPrice),
  }));
  const shippingFee = calculateCartShippingFee(shippingItems, subtotal);
  const total = subtotal + shippingFee;

  return { id: cart.id, items, subtotal, shippingFee, total, itemCount: items.length };
}

export async function createOrderFromCart(params: {
  userId: string;
  addressId: string;
  paymentMethod: "COD" | "CARD" | "WALLET";
  notes?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { addresses: true },
  });
  if (!user) throw new Error("User not found");

  const address = user.addresses.find((a) => a.id === params.addressId);
  if (!address) throw new Error("Address not found");

  const cart = await prisma.cart.findUnique({
    where: { userId: params.userId },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  for (const item of cart.items) {
    if (!item.product.isPublished) {
      throw new Error(`Product "${item.product.name}" is no longer available`);
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Insufficient stock for "${item.product.name}"`);
    }
  }

  const orderItems = cart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product.price, item.product.salePrice);
    return {
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.url ?? "",
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingItems = cart.items.map((item) => ({
    quantity: item.quantity,
    shippingPrice: decimalToNumber(item.product.shippingPrice),
  }));
  const shippingFee = calculateCartShippingFee(shippingItems, subtotal);
  const total = subtotal + shippingFee;

  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    for (const item of orderItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`Insufficient stock for "${item.productName}"`);
      }
    }

    const created = await tx.order.create({
      data: {
        userId: params.userId,
        orderNumber,
        status: "PENDING",
        paymentStatus: params.paymentMethod === "COD" ? "UNPAID" : "UNPAID",
        paymentMethod: params.paymentMethod,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        addressSnapshot: address,
        customerName: user.fullName,
        customerEmail: user.email,
        customerPhone: address.phone,
        notes: params.notes,
        items: {
          create: orderItems.map(({ productId, productName, productImage, quantity, unitPrice, totalPrice }) => ({
            productId,
            productName,
            productImage,
            quantity,
            unitPrice,
            totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  return order;
}
