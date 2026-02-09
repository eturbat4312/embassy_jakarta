// filename: frontend/app/[locale]/services/page.tsx
import Link from "next/link";
import { getConsularServices } from "@/lib/api";

type Service = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  order?: number | null;
  category?: {
    name?: string | null;
    slug?: string | null;
    order?: number | null;
  } | null;
  resources?: Array<{ type: "pdf" | "link" }>;
};

function stripHtml(input?: string | null) {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const UI = {
  mn: {
    title: "Үйлчилгээ",
    subtitle:
      "Консулын үйлчилгээ, улсын бүртгэл, визийн мэдээллийг эндээс сонгоно уу.",
    readMore: "Дэлгэрэнгүй",
    empty: "Одоогоор үйлчилгээ бүртгэгдээгүй байна.",
    countLabel: "үйлчилгээ",
    pdf: "PDF",
    link: "Холбоос",
  },
  en: {
    title: "Services",
    subtitle:
      "Choose consular services, civil registration, or visa information.",
    readMore: "Details",
    empty: "No services available yet.",
    countLabel: "items",
    pdf: "PDF",
    link: "Links",
  },
  id: {
    title: "Layanan",
    subtitle: "Pilih layanan konsuler, pencatatan sipil, atau informasi visa.",
    readMore: "Detail",
    empty: "Belum ada layanan yang tersedia.",
    countLabel: "layanan",
    pdf: "PDF",
    link: "Tautan",
  },
} as const;

function accentFor(categoryName: string) {
  const n = categoryName.toLowerCase();
  if (n.includes("консул")) {
    return {
      bar: "bg-blue-600",
      tint: "bg-blue-50/60",
      border: "border-blue-200",
      left: "border-l-blue-500",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  if (n.includes("улсын") || n.includes("бүртгэл") || n.includes("civil")) {
    return {
      bar: "bg-emerald-600",
      tint: "bg-emerald-50/60",
      border: "border-emerald-200",
      left: "border-l-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (n.includes("виз") || n.includes("visa")) {
    return {
      bar: "bg-amber-600",
      tint: "bg-amber-50/60",
      border: "border-amber-200",
      left: "border-l-amber-500",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    bar: "bg-slate-600",
    tint: "bg-slate-50/60",
    border: "border-slate-200",
    left: "border-l-slate-500",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  };
}

function sortByMaybeOrderThenTitle<
  T extends { order?: number | null; title?: string | null }
>(a: T, b: T) {
  const ao = a.order ?? 9999;
  const bo = b.order ?? 9999;
  if (ao !== bo) return ao - bo;
  const at = (a.title ?? "").toLowerCase();
  const bt = (b.title ?? "").toLowerCase();
  return at.localeCompare(bt);
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>; // Next.js 15 Async
}) {
  const resolvedParams = await params;
  const lang = (resolvedParams.locale || "mn").toLowerCase() as
    | "mn"
    | "en"
    | "id";
  const t = UI[lang] ?? UI.mn;

  const servicesRaw = await getConsularServices(lang);
  const services: Service[] = Array.isArray(servicesRaw) ? servicesRaw : [];

  const grouped = new Map<
    string,
    { key: string; name: string; order: number | null; items: Service[] }
  >();

  for (const s of services) {
    const name =
      s.category?.name ||
      (lang === "en" ? "Other" : lang === "id" ? "Lainnya" : "Бусад");
    const slug = s.category?.slug || name;
    const key = `${slug}`.toLowerCase();
    const order = (s.category?.order ?? null) as number | null;

    if (!grouped.has(key)) grouped.set(key, { key, name, order, items: [] });
    grouped.get(key)!.items.push(s);
  }

  const groups = Array.from(grouped.values())
    .sort((a, b) => {
      const ao = a.order ?? 9999;
      const bo = b.order ?? 9999;
      if (ao !== bo) return ao - bo;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    })
    .map((g) => ({
      ...g,
      items: [...g.items].sort(sortByMaybeOrderThenTitle),
    }));

  return (
    <div className="bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-2xl border bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t.title}
          </h1>
          <p className="mt-2 text-slate-600">{t.subtitle}</p>
        </div>

        <div className="mt-8 space-y-9">
          {groups.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
              {t.empty}
            </div>
          )}

          {groups.map(({ key, name, items }) => {
            const a = accentFor(name);
            return (
              <section key={key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-5 w-1.5 rounded-full ${a.bar}`}
                      aria-hidden="true"
                    />
                    <h2 className="text-xl font-semibold text-slate-900">
                      {name}
                    </h2>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-500">
                    {items.length} {t.countLabel}
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-2xl border ${a.border} ${a.tint} p-4 sm:p-5`}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((service) => {
                      const summaryText = stripHtml(service.summary);
                      return (
                        <Link
                          key={service.id}
                          href={`/${lang}/services/${service.slug}`}
                          className={`group rounded-xl border bg-white p-4 transition
                                     hover:-translate-y-[1px] hover:shadow-md
                                     focus:outline-none focus:ring-2 focus:ring-slate-400/50
                                     border-l-4 ${a.left}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 leading-snug">
                                {service.title}
                              </div>
                              <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                                {summaryText || t.readMore}
                              </div>
                            </div>
                            <div className="shrink-0 mt-0.5 rounded-lg border bg-white/70 px-2 py-1 text-xs text-slate-600 transition group-hover:text-slate-900">
                              →
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
