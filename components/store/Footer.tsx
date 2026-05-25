import Link from "next/link";

const ourStoryLinks = [
  { href: "/contact", label: "Contact us" },
  { href: "/stores", label: "Stores" },
  { href: "/shop", label: "Search" },
  { href: "/exchange-refund", label: "Exchange and Refund Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/our-story", label: "Our Story" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms of Service" },
];

const customerCare = [
  "Mall of Arabia",
  "Mall of Egypt",
  "City Center Almaza",
  "District 5",
  "City Stars",
  "Open Air Mall",
];

const venues = ["The Yard", "City Center Maadi", "City Center Alexandria"];

export default function Footer() {
  return (
    <footer className="site-footer mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand story — left column, wider */}
          <div className="lg:col-span-4">
            <p className="site-footer-brand-story max-w-sm">
              All of our products are locally designed and manufactured. We get our inspiration
              from nomad artisans from all over Egypt, and we always try to mix the local designs
              with international fashion trends.
            </p>
          </div>

          {/* Our Story links */}
          <div className="lg:col-span-2">
            <h4 className="site-footer-heading mb-5">Our Story</h4>
            <ul className="space-y-2.5">
              {ourStoryLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-3">
            <h4 className="site-footer-heading mb-5">Customer Care</h4>
            <ul className="space-y-2.5">
              {customerCare.map((item) => (
                <li key={item} className="site-footer-text">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Venues + Our Stores */}
          <div className="lg:col-span-3">
            <h4 className="site-footer-heading mb-5">Venues</h4>
            <ul className="space-y-2.5 mb-8">
              {venues.map((item) => (
                <li key={item} className="site-footer-text">
                  {item}
                </li>
              ))}
            </ul>
            <h4 className="site-footer-heading mb-5">Our Stores</h4>
            <p className="site-footer-logo text-xl opacity-90">Selora Brand</p>
          </div>
        </div>

        {/* Bottom bar — copyright + locale */}
        <div className="site-footer-bottom mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>2026 Media Heist</p>
          <p className="site-footer-locale flex items-center gap-3">
            <span>Egypt (EGP)</span>
            <span className="opacity-30">|</span>
            <span>English</span>
            <span className="opacity-30">|</span>
            <span>م.ج</span>
          </p>
        </div>
      </div>

      {/* Decorative brand watermark strip — as in PDF */}
      <div className="site-footer-watermark py-8">
        <div className="site-footer-watermark-inner px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="site-footer-logo">
              Selora Brand
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
