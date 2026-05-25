export default function AnnouncementBar() {
  return (
    <div className="announcement-bar py-2 sm:py-2.5 text-center uppercase">
      <span className="sm:hidden">Free Shipping on Orders 10K+</span>
      <span className="hidden sm:inline">Free Shipping on Orders Above 10K</span>
    </div>
  );
}
