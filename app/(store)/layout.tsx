import AnnouncementBar from "@/components/store/AnnouncementBar";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pattern-bg min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
