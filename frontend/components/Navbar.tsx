// filename: frontend/src/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const NAV_ITEMS = {
  mn: [
    { slug: "about", label: "Элчин сайдын яам" },
    { slug: "ambassador", label: "Элчийн сайдын мэндчилгээ" },
    { slug: "services", label: "Үйлчилгээ" },
    { slug: "contact", label: "Холбоо барих" },
  ],
  en: [
    { slug: "about", label: "About the Embassy" },
    { slug: "ambassador", label: "Ambassador's Message" },
    { slug: "services", label: "Services" },
    { slug: "contact", label: "Contact" },
  ],
  id: [
    { slug: "about", label: "Tentang Kedutaan" },
    { slug: "ambassador", label: "Sambutan Duta Besar" },
    { slug: "services", label: "Layanan" },
    { slug: "contact", label: "Kontak" },
  ],
} as const;

type Locale = keyof typeof NAV_ITEMS;

function titleBlock(locale: Locale) {
  if (locale === "mn") {
    return {
      top: "Монгол Улсаас Бүгд Найрамдах Индонез Улсад суугаа Элчин сайдын яам",
      sub: "Jakarta",
    };
  }
  if (locale === "id") {
    return {
      top: "Kedutaan Besar Mongolia untuk Republik Indonesia",
      sub: "Jakarta",
    };
  }
  return {
    top: "Embassy of Mongolia in the Republic of Indonesia",
    sub: "Jakarta",
  };
}

export default function Navbar({ locale }: { locale?: string }) {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  // priority: prop -> URL -> default
  const currentLocale = (locale || segments[0] || "mn") as Locale;

  const items = useMemo(
    () => NAV_ITEMS[currentLocale] ?? NAV_ITEMS.mn,
    [currentLocale]
  );

  const title = titleBlock(currentLocale);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="gov-topbar h-2" />

      <nav className="border-b">
        <div className="gov-container flex items-center justify-between gap-6 py-3">
          <Link
            href={`/${currentLocale}`}
            className="flex items-center gap-3 min-w-0"
          >
            <Image
              src="/brand-mark.svg"
              alt="Embassy mark"
              width={68}
              height={68}
              priority
              className="shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[13px] sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                {title.top}
              </div>
              <div className="text-xs text-slate-500">{title.sub}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="rounded-full border bg-white p-1 flex items-center gap-1">
              {(["mn", "en", "id"] as Locale[]).map((loc) => {
                const isCurrent = loc === currentLocale;
                return (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                      isCurrent
                        ? "bg-blue-700 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {loc.toUpperCase()}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t bg-white/70 backdrop-blur">
          <div className="gov-container">
            <div className="hidden md:flex items-center justify-center gap-7 py-3">
              {items.map((item) => {
                const href = `/${currentLocale}/${item.slug}`;
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    className={`text-sm font-semibold transition ${
                      isActive
                        ? "text-blue-700"
                        : "text-slate-700 hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
