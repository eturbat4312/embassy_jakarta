// filename: frontend/src/components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CONTACT = {
  mn: {
    name: "Монгол Улсаас Бүгд Найрамдах Индонез Улсад суугаа Элчин сайдын яам",
    section_contact: "Холбоо барих",
    section_links: "Шуурхай холбоос",
    section_about: "Сайтын тухай",
    phone_label: "Утас:",
    email_label: "Имэйл:",
    rights: "Бүх эрх хуулиар хамгаалагдсан.",
    links: {
      services: "Консулын үйлчилгээ",
      contact: "Холбоо барих",
      about: "Элчин сайдын яам",
      news: "Мэдээ мэдээлэл",
    },
    source:
      "(Эх сурвалж: Монголын ГХЯ – Хилийн чанадад суугаа дипломат төлөөлөгчийн газрууд)",
  },
  en: {
    name: "Embassy of Mongolia in the Republic of Indonesia",
    section_contact: "Contact",
    section_links: "Quick links",
    section_about: "About",
    phone_label: "Phone:",
    email_label: "Email:",
    rights: "All rights reserved.",
    links: {
      services: "Consular services",
      contact: "Contact",
      about: "About the Embassy",
      news: "News",
    },
    source: "(Source: MFA of Mongolia – Diplomatic Missions Abroad)",
  },
  id: {
    name: "Kedutaan Besar Mongolia di Republik Indonesia",
    section_contact: "Kontak",
    section_links: "Tautan cepat",
    section_about: "Tentang",
    phone_label: "Telepon:",
    email_label: "Email:",
    rights: "Hak cipta dilindungi.",
    links: {
      services: "Layanan konsuler",
      contact: "Kontak",
      about: "Tentang Kedutaan",
      news: "Berita",
    },
    source: "(Sumber: Kemenlu Mongolia – Perwakilan Diplomatik di Luar Negeri)",
  },
} as const;

const ADDRESS_LINES = [
  "Sampoerna Strategic Square, South Tower, Level 21",
  "Jl. Jenderal Sudirman Kav. 45-46, Jakarta 12930, Indonesia",
] as const;

const PHONE = "+62 21 21684133";
const EMAIL = "jakarta@mfa.gov.mn";

function yearNow() {
  return new Date().getFullYear();
}

function normalizeLocale(raw: string | null | undefined) {
  const v = (raw || "").toLowerCase();
  if (v === "mn" || v === "en" || v === "id") return v;
  return "mn";
}

function useLocaleFromPathname() {
  const pathname = usePathname() || "/";
  const seg = pathname.split("/").filter(Boolean)[0]; // first path segment
  return normalizeLocale(seg);
}

export default function Footer() {
  const locale = useLocaleFromPathname();
  const t = CONTACT[locale];

  const base = `/${locale}`;

  return (
    <footer className="mt-14 border-t bg-white">
      <div className="gov-topbar h-1 w-full" />

      <div className="gov-container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact */}
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {t.section_contact}
            </div>

            <div className="mt-3 text-sm text-slate-700 leading-6">
              <div className="font-medium text-slate-900">{t.name}</div>

              <div className="mt-2">
                {ADDRESS_LINES.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>

              <div className="mt-3">
                <div>
                  <span className="text-slate-500">{t.phone_label}</span>{" "}
                  <a className="hover:underline" href={`tel:${PHONE}`}>
                    {PHONE}
                  </a>
                </div>
                <div>
                  <span className="text-slate-500">{t.email_label}</span>{" "}
                  <a className="hover:underline" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500">{t.source}</div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {t.section_links}
            </div>

            <div className="mt-3 grid gap-2 text-sm">
              <Link
                className="text-slate-700 hover:underline"
                href={`${base}/services`}
              >
                {t.links.services}
              </Link>
              <Link
                className="text-slate-700 hover:underline"
                href={`${base}/contact`}
              >
                {t.links.contact}
              </Link>
              <Link
                className="text-slate-700 hover:underline"
                href={`${base}/about`}
              >
                {t.links.about}
              </Link>
              <Link
                className="text-slate-700 hover:underline"
                href={`${base}/news`}
              >
                {t.links.news}
              </Link>
            </div>
          </div>

          {/* About */}
          <div className="md:text-right">
            <div className="text-sm font-semibold text-slate-900">
              {t.section_about}
            </div>

            <div className="mt-3 text-sm text-slate-700 leading-6">
              <div className="text-slate-500">{CONTACT.en.name}</div>
              <div className="mt-3 text-xs text-slate-500">
                © {yearNow()} — {t.rights}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-slate-500 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            {ADDRESS_LINES.join(" · ")} · {PHONE}
          </div>
          <div className="text-slate-400">
            Powered by Next.js · Django REST · PostgreSQL
          </div>
        </div>
      </div>
    </footer>
  );
}
