import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatPrice } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  const [totalProducts, totalOrders, pendingOrders, totalUsers, recentOrders, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isPublished: true },
        take: 5,
        orderBy: { stock: "asc" },
      }),
    ]);

  const stats = [
    { label: "Total Products", value: totalProducts },
    { label: "Total Orders", value: totalOrders },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Total Users", value: totalUsers },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-medium text-text-dark mb-6 sm:mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card">
            <p className="text-xs sm:text-sm text-text-muted">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-light text-text-dark mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase text-text-dark mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-text-muted text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex justify-between items-center py-2 border-b border-gray-100 hover:opacity-70"
                >
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-text-muted">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPrice(decimalToNumber(order.total))} EGP</p>
                    <p className="text-xs text-text-muted">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h2 className="text-sm tracking-widest uppercase text-text-dark mb-4">Low Stock Products</h2>
          {lowStock.length === 0 ? (
            <p className="text-text-muted text-sm">All products well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="flex justify-between items-center py-2 border-b border-gray-100 hover:opacity-70"
                >
                  <p className="text-sm">{product.name}</p>
                  <span className="text-sm text-red-600">{product.stock} left</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
