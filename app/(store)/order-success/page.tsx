import Link from "next/link";

interface OrderSuccessProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessProps) {
  const params = await searchParams;
  const orderNumber = params.orderNumber ?? "";

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
      <div className="mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-charcoal/10 flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-charcoal">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="page-title text-2xl sm:text-3xl text-text-dark mb-3 sm:mb-4">Order Confirmed!</h1>
        <p className="text-sm sm:text-base text-text-muted font-normal mb-2">
          Thank you for your order. We&apos;ll send you a confirmation shortly.
        </p>
        {orderNumber && (
          <p className="text-xs sm:text-sm text-text-dark mt-4 break-all px-2">
            Order Number: <span className="font-medium tracking-wide">{orderNumber}</span>
          </p>
        )}
      </div>
      <Link href="/shop" className="btn-primary inline-block">
        Continue Shopping
      </Link>
    </div>
  );
}
