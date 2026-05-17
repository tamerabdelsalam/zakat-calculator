import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PriceBar } from "@/components/shared/price-bar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <PriceBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
