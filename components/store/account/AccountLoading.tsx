export default function AccountLoading() {
  return (
    <div className="account-card p-12 flex flex-col items-center justify-center text-text-muted">
      <div className="w-8 h-8 border-2 border-green-charcoal/20 border-t-green-charcoal rounded-full animate-spin mb-4" />
      <p className="text-sm tracking-wide">Loading...</p>
    </div>
  );
}
