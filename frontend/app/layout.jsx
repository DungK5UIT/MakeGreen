import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "MakeGreen - Thuê xe điện dễ, đi xanh hơn mỗi ngày",
  description: "Khám phá thành phố với xe điện MakeGreen – tiện lợi, tiết kiệm và an toàn.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-white text-neutral-900 font-inter">
        <Header />
        <main>{children}</main>
        <div className="md:hidden sticky-bottom bg-white border-t border-neutral-200 p-4">
          <Link href="/booking" className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold transition-colors">
            Đặt xe ngay
          </Link>
        </div>
        <Footer />
      </body>
    </html>
  );
}
