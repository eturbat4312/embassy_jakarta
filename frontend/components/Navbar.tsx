// filename: frontend/src/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { MenuNode } from "@/lib/api";

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
type LegacyNavItem = { slug: string; label: string };

// CODEX: Dynamic menu item-с Navbar дээр ашиглах link өгөгдлийг бэлдэнэ.
type NavLinkItem = {
  key: string;
  label: string;
  href: string;
  external: boolean;
  openInNewTab: boolean;
  children: NavLinkItem[];
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function toLocalePath(locale: Locale, raw: string) {
  const target = String(raw || "").trim();
  if (!target) return `/${locale}`;

  if (/^https?:\/\//i.test(target)) return target;

  if (target.startsWith("/")) {
    if (/^\/(mn|en|id)(\/|$)/.test(target)) return target;
    return `/${locale}${target}`;
  }
  return `/${locale}/${target}`;
}

// CODEX: Backend-ээс ирсэн menu item-г Navbar-д хэрэгтэй хэлбэрт оруулна.
function mapMenuNodeToNav(item: MenuNode, locale: Locale): NavLinkItem {
  let href = `/${locale}`;
  let external = false;

  if (item.item_type === "external_url") {
    href = item.target || "#";
    external = true;
  } else if (item.item_type === "internal_page") {
    href = toLocalePath(locale, item.target);
  } else {
    href = toLocalePath(locale, item.target);
  }

  return {
    key: `menu-${item.id}`,
    label: item.title,
    href,
    external,
    openInNewTab: !!item.open_in_new_tab,
    children: (item.children || []).map((child) => mapMenuNodeToNav(child, locale)),
  };
}

function titleBlock(locale: Locale) {
  if (locale === "mn") {
    return {
      top: "Монгол Улсаас Бүгд Найрамдах Индонез Улсад суугаа Элчин сайдын яам",
      // CODEX: Client хүсэлтээр MN гарчигт хотын нэрийг Монгол хэлээр харуулна.
      sub: "Жакарта хот",
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

export default function Navbar({
  locale,
  menuItems,
}: {
  locale?: string;
  menuItems?: MenuNode[];
}) {
  const pathname = usePathname() || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const segments = pathname.split("/").filter(Boolean);

  // priority: prop -> URL -> default
  const currentLocale = (locale || segments[0] || "mn") as Locale;

  const title = titleBlock(currentLocale);

  const fallbackItems = useMemo<NavLinkItem[]>(
    () =>
      (NAV_ITEMS[currentLocale] ?? NAV_ITEMS.mn).map((item: LegacyNavItem) => ({
        key: `legacy-${item.slug}`,
        label: item.label,
        href: `/${currentLocale}/${item.slug}`,
        external: false,
        openInNewTab: false,
        children: [],
      })),
    [currentLocale]
  );

  const dynamicItems = useMemo<NavLinkItem[]>(
    () => (menuItems || []).map((item) => mapMenuNodeToNav(item, currentLocale)),
    [menuItems, currentLocale]
  );

  // CODEX: Backend menu ирээгүй үед хуучин hardcoded nav-г эвдэхгүй fallback хийнэ.
  const navItems = dynamicItems.length ? dynamicItems : fallbackItems;

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
            {/* CODEX: Desktop search form */}
            <form
              action={`/${currentLocale}/search`}
              method="get"
              className="hidden lg:flex items-center gap-2"
            >
              <input
                type="search"
                name="q"
                placeholder="Search"
                className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                aria-label="Search"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <SearchIcon />
              </button>
            </form>

            {/* CODEX: Mobile дээр menu нээх/хаах товч. */}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <span className="text-lg leading-none">{mobileOpen ? "✕" : "☰"}</span>
            </button>

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
            <div className="hidden md:flex items-center justify-start gap-2 py-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <div key={item.key} className="relative group">
                    <Link
                      href={item.href}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                      }`}
                    >
                      {item.label}
                      {item.children.length > 0 ? (
                        <span className="text-[10px] leading-none text-slate-500 group-hover:text-blue-700">
                          ▾
                        </span>
                      ) : null}
                    </Link>

                    {item.children.length > 0 ? (
                      // CODEX: Hover үед parent -> dropdown руу cursor шилжих gap алдагдахаас сэргийлэв.
                      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition absolute left-0 top-full z-50 min-w-52 pt-1.5">
                        <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-md">
                          {item.children.map((child) => {
                            const childActive = pathname.startsWith(child.href);
                            return (
                              <Link
                                key={child.key}
                                href={child.href}
                                target={child.openInNewTab ? "_blank" : undefined}
                                rel={
                                  child.openInNewTab
                                    ? "noopener noreferrer"
                                    : undefined
                                }
                                className={`block rounded-md px-3 py-1.5 text-sm transition ${
                                  childActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* CODEX: Mobile menu + submenu (accordion) */}
            <div
              className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${
                mobileOpen ? "max-h-[75vh] py-2 opacity-100" : "max-h-0 py-0 opacity-0"
              }`}
            >
              <div className="space-y-1">
                {/* CODEX: Mobile search form */}
                <form
                  action={`/${currentLocale}/search`}
                  method="get"
                  className="mb-2 flex items-center gap-2"
                >
                  <input
                    type="search"
                    name="q"
                    placeholder="Search"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <SearchIcon />
                  </button>
                </form>

                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const hasChildren = item.children.length > 0;

                  if (!hasChildren) {
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        target={item.openInNewTab ? "_blank" : undefined}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <details
                      key={item.key}
                      className="rounded-lg border border-slate-200 bg-white"
                    >
                      <summary
                        className={`cursor-pointer list-none px-3 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-xs text-slate-500">▾</span>
                        </div>
                      </summary>

                      <div className="px-2 pb-2 pt-1 space-y-1">
                        {item.children.map((child) => {
                          const childActive = pathname.startsWith(child.href);
                          return (
                            <Link
                              key={child.key}
                              href={child.href}
                              target={child.openInNewTab ? "_blank" : undefined}
                              rel={
                                child.openInNewTab
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className={`block rounded-md px-3 py-2 text-sm transition ${
                                childActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                              }`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
