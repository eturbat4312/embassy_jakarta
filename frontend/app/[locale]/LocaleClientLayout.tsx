// filename: frontend/app/[locale]/LocaleClientLayout.tsx
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LocaleClientLayout({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar locale={locale} />
      {children}
      <Footer />
    </>
  );
}
