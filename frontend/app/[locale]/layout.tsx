// filename: frontend/app/[locale]/layout.tsx
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMenuTree } from "@/lib/api";

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
  let menuItems: Awaited<ReturnType<typeof getMenuTree>> = [];

  try {
    // CODEX: Navbar-ыг backend menu өгөгдлөөр SSR үеэр тэжээнэ.
    menuItems = await getMenuTree(locale);
  } catch (error) {
    // CODEX: API алдаатай үед Navbar fallback цэсээ ашиглах тул хоосон массив үлдээнэ.
    console.error("[LocaleLayout] getMenuTree failed:", error);
  }

  return (
    <>
      <Navbar locale={locale} menuItems={menuItems} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
