const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  UNPAID: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-gray-100 text-gray-600",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "bg-gray-100 text-gray-600";
  const label = status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full tracking-wide ${style}`}>
      {label}
    </span>
  );
}
