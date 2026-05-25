import Link from "next/link";
import { getUserFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decimalToNumber, formatPrice } from "@/lib/utils";
import AccountPageHeader from "@/components/store/account/AccountPageHeader";
import OrderStatusBadge from "@/components/store/account/OrderStatusBadge";

export default async function AccountDashboardPage() {
  const session = await getUserFromCookie();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      _count: { select: { orders: true, addresses: true } },
      orders: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { items: true } },
          items: { take: 1 },
        },
      },
    },
  });

  if (!user) return null;

  const memberSince = new Intl.DateTimeFormat("en-EG", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  const quickActions = [
    {
      href: "/account/orders",
      label: "Track Orders",
      description: "View order history and status",
      count: user._count.orders,
    },
    {
      href: "/account/addresses",
      label: "Manage Addresses",
      description: "Update delivery locations",
      count: user._count.addresses,
    },
    {
      href: "/account/profile",
      label: "Edit Profile",
      description: "Update your personal details",
    },
    {
      href: "/shop",
      label: "Shop New Arrivals",
      description: "Explore the latest collection",
    },
  ];

  return (
    <div>
      <AccountPageHeader
        title={`Welcome, ${user.fullName.split(" ")[0]}`}
        description={`Member since ${memberSince}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="account-stat-card">
          <p className="text-xs tracking-widest uppercase text-text-muted">Orders</p>
          <p className="page-title text-2xl sm:text-3xl text-text-dark mt-1">{user._count.orders}</p>
        </div>
        <div className="account-stat-card">
          <p className="text-xs tracking-widest uppercase text-text-muted">Addresses</p>
          <p className="page-title text-2xl sm:text-3xl text-text-dark mt-1">{user._count.addresses}</p>
        </div>
        <div className="account-stat-card md:col-span-1">
          <p className="text-xs tracking-widest uppercase text-text-muted">Email</p>
          <p className="text-sm text-text-dark mt-2 truncate">{user.email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="account-card p-5 hover:opacity-85 transition-opacity group"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-dark group-hover:text-green-charcoal transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-text-muted mt-1 font-normal">{action.description}</p>
              </div>
              {action.count !== undefined && (
                <span className="text-xs bg-green-charcoal/10 text-green-charcoal px-2 py-1 rounded-full">
                  {action.count}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs tracking-widest uppercase text-text-dark">Recent Orders</h3>
          {user.orders.length > 0 && (
            <Link href="/account/orders" className="text-xs text-text-muted hover:text-text-dark underline">
              View all
            </Link>
          )}
        </div>

        {user.orders.length === 0 ? (
          <div className="account-card p-8 text-center">
            <p className="text-sm text-text-muted mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="btn-primary inline-block text-xs py-2 px-6">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {user.orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="account-card flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 hover:opacity-85 transition-opacity"
              >
                {order.items[0]?.productImage && (
                  <div
                    className="w-full sm:w-14 h-32 sm:h-16 rounded-lg bg-bg-beige bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${order.items[0].productImage})` }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">{order.orderNumber}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Intl.DateTimeFormat("en-EG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(order.createdAt)}
                    {" · "}
                    {order._count.items} item{order._count.items !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 w-full sm:w-auto">
                  <p className="text-sm font-medium">{formatPrice(decimalToNumber(order.total))} EGP</p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
