// filename: frontend/app/[locale]/layout.tsx
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamicParams = true;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>; // Promise төрөлтэй болгов
}) {
  // 1. Params-ыг await хийж бодит утгыг авна
  const resolvedParams = await params;
  const locale = String(resolvedParams.locale || "mn").toLowerCase();

  return (
    <>
      <Navbar locale={locale} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
