import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatPrice } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const revenueWhere: Prisma.OrderWhereInput = {
  status: { not: "CANCELLED" },
};

export default async function AdminDashboardPage() {
  const admin = await getAdminFromCookie();
  if (!admin) redirect("/admin/login");

  const startOfMonth = getStartOfMonth();

  const [
    totalProducts,
    totalOrders,
    pendingOrders,
    totalUsers,
    recentOrders,
    lowStock,
    totalRevenueAgg,
    paidRevenueAgg,
    monthRevenueAgg,
    monthOrderCount,
  ] = await Promise.all([
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
      prisma.order.aggregate({
        where: revenueWhere,
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { ...revenueWhere, paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { ...revenueWhere, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { ...revenueWhere, createdAt: { gte: startOfMonth } },
      }),
    ]);

  const totalRevenue = decimalToNumber(totalRevenueAgg._sum.total ?? 0);
  const paidRevenue = decimalToNumber(paidRevenueAgg._sum.total ?? 0);
  const monthRevenue = decimalToNumber(monthRevenueAgg._sum.total ?? 0);
  const revenueOrderCount = totalRevenueAgg._count;
  const avgOrderValue = revenueOrderCount > 0 ? totalRevenue / revenueOrderCount : 0;

  const stats = [
    { label: "Total Products", value: String(totalProducts) },
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Pending Orders", value: String(pendingOrders) },
    { label: "Total Users", value: String(totalUsers) },
  ];

  const revenueStats = [
    { label: "Total Revenue", value: `${formatPrice(totalRevenue)} EGP`, hint: "Excludes cancelled orders" },
    { label: "Paid Revenue", value: `${formatPrice(paidRevenue)} EGP`, hint: "Orders marked as paid" },
    {
      label: "This Month",
      value: `${formatPrice(monthRevenue)} EGP`,
      hint: `${monthOrderCount} order${monthOrderCount === 1 ? "" : "s"} this month`,
    },
    {
      label: "Avg Order Value",
      value: `${formatPrice(Math.round(avgOrderValue))} EGP`,
      hint: revenueOrderCount > 0 ? `From ${revenueOrderCount} orders` : "No orders yet",
    },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-medium text-text-dark mb-6 sm:mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card">
            <p className="text-xs sm:text-sm text-text-muted">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-light text-text-dark mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm tracking-widest uppercase text-text-dark mb-4">Revenue</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {revenueStats.map((stat) => (
          <div key={stat.label} className="admin-card">
            <p className="text-xs sm:text-sm text-text-muted">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-light text-text-dark mt-1">{stat.value}</p>
            <p className="text-[11px] text-text-muted mt-2">{stat.hint}</p>
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
