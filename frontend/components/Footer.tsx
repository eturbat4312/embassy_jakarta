// filename: frontend/src/components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  },
} as const;

const ADDRESS_LINES = [
  "Sampoerna Strategic Square, South Tower, Level 21",
  "Jl. Jenderal Sudirman Kav. 45-46, Jakarta 12930, Indonesia",
] as const;

const PHONE = "+62 21 21684133";
const EMAIL = "jakarta@mfa.gov.mn";
// CODEX: Client хүсэлтийн дагуу social холбоосууд нэмэв.
const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61567859175860",
    icon: "facebook",
    colorClass: "bg-[#1877F2] text-white border-[#1877F2] hover:brightness-95",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/monembjkt/?hl=en",
    icon: "instagram",
    colorClass:
      "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white border-transparent hover:brightness-95",
  },
  // CODEX: X албан ёсны хаяг баталгаажаагүй тул түр нуусан.
] as const;
// CODEX: Client хүсэлтийн 6 албан ёсны холбоос.
type OfficialLink = {
  label: string;
  href: string;
  domain: string;
  logoBase: string;
  logoPath?: string;
};

const OFFICIAL_LINKS: OfficialLink[] = [
  {
    label: "President of Mongolia",
    href: "https://president.mn",
    domain: "president.mn",
    logoBase: "president",
  },
  {
    label: "Government of Mongolia",
    href: "https://gov.mn",
    domain: "gov.mn",
    logoBase: "government",
  },
  {
    label: "Ministry of Foreign Affairs",
    href: "https://mfa.gov.mn",
    domain: "mfa.gov.mn",
    logoBase: "mfa",
    // CODEX: Client хүсэлтээр MFA logo-г сайтын үндсэн brand logo-той ижил болгосон.
    logoPath: "/brand-mark.svg",
  },
  {
    label: "Go Mongolia",
    href: "https://gomongolia.gov.mn",
    domain: "gomongolia.gov.mn",
    logoBase: "go-mongolia",
  },
  {
    label: "Immigration",
    href: "https://immigration.gov.mn",
    domain: "immigration.gov.mn",
    logoBase: "immigration",
  },
  {
    label: "Invest Mongolia",
    href: "https://investmongolia.gov.mn",
    domain: "investmongolia.gov.mn",
    logoBase: "invest-mongolia",
  },
] as const;

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

// CODEX: official logo-д png/svg аль аль форматыг fallback-оор дэмжинэ.
function OfficialLogo({
  logoPath,
  logoBase,
  label,
}: {
  logoPath?: string;
  logoBase: string;
  label: string;
}) {
  const [idx, setIdx] = useState(0);
  const candidates = [
    ...(logoPath ? [logoPath] : []),
    `/official/${logoBase}.png`,
    `/official/${logoBase}.svg`,
  ];
  const src = candidates[idx];

  if (!src) {
    return (
      <div className="flex h-12 w-16 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
        {label.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${label} logo`}
      className="h-14 w-full max-w-[170px] object-contain"
      onError={() => setIdx((x) => x + 1)}
    />
  );
}

// CODEX: Social-д үсгийн оронд SVG icon ашиглав.
function SocialIcon({ type }: { type: "facebook" | "instagram" | "x" }) {
  if (type === "facebook") {
    return (
      <svg
        viewBox="0 0 16 16"
        className="h-5 w-5 fill-current"
        aria-hidden="true"
      >
        {/* CODEX: Facebook "f" (bootstrap-icons path) */}
        <path d="M16 8.049C16 3.604 12.418 0 8 0S0 3.604 0 8.049C0 12.07 2.926 15.401 6.75 16v-5.625H4.719V8.049H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.792.157 1.792.157v1.98h-1.01c-.994 0-1.304.621-1.304 1.258V8.05h2.219l-.354 2.326H9.25V16C13.074 15.401 16 12.07 16 8.049z" />
      </svg>
    );
  }
  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        {/* CODEX: Official-style Instagram camera glyph */}
        <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8zm9.2 1.8a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M18.9 3H22l-6.8 7.8L23 21h-6.2l-4.8-6.3L6.5 21H3.4l7.3-8.4L1 3h6.3l4.3 5.7L18.9 3zm-1.1 16h1.7L6.3 4.9H4.5L17.8 19z" />
    </svg>
  );
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

              {/* CODEX: Social icon дээр дарж шууд холбоос руу орох блок. */}
              <div className="mt-4 flex items-center gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${s.colorClass}`}
                  >
                    <SocialIcon type={s.icon} />
                  </a>
                ))}
              </div>
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
              {/* CODEX: Client хүсэлтээр footer about текстийг тогтмол болгосон. */}
              <div className="text-slate-500">Embassy of Mongolia in Jakarta</div>
              <div className="mt-3 text-xs text-slate-500">
                © {yearNow()} — {t.rights}
              </div>
            </div>
          </div>
        </div>

        {/* CODEX: Reference зурагтай адил логонуудыг нэг мөр strip + mobile horizontal scroll хэлбэрээр харуулав. */}
        <div className="mt-8 border-t border-blue-200 pt-5">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
              {OFFICIAL_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[150px] min-w-[220px] flex-col items-center justify-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm lg:min-w-0"
                >
                  <div className="flex h-[78px] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-2">
                  <OfficialLogo
                    logoPath={l.logoPath}
                    logoBase={l.logoBase}
                    label={l.label}
                  />
                  </div>
                  {/* CODEX: Нэр/домэйн текст үргэлж харагдах ёстой гэсэн шаардлагад нийцүүлэв. */}
                  <div className="w-full text-center">
                    <div className="text-sm font-semibold leading-tight text-slate-800">
                      {l.label}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">{l.domain}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 text-xs text-slate-500">
          <div>
            {ADDRESS_LINES.join(" · ")} · {PHONE}
          </div>
        </div>
      </div>
    </footer>
  );
}
