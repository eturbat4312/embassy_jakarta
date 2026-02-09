import Link from "next/link";
import Image from "next/image";
import { getNewsList } from "@/lib/api";
import { decodeEntities, stripHtml } from "@/lib/text";
import { resolveMediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function t(locale: string, key: string) {
  const lang = (locale || "mn").toLowerCase();
  const dict: Record<string, Record<string, string>> = {
    mn: {
      news: "Мэдээ",
      subtitle:
        "Монгол Улсаас Бүгд Найрамдах Индонез Улсад суугаа Элчин сайдын яам",
      seeAll: "Бүгдийг үзэх →",
      latest: "Сүүлийн мэдээнүүд",
      readMore: "Дэлгэрэнгүй →",
      empty: "Одоогоор мэдээ байхгүй байна.",
      quickLinks: "Шуурхай холбоос",
      consular: "Консулын үйлчилгээ",
      contact: "Холбоо барих",
      visa: "Визийн мэдээлэл",
    },
    en: {
      news: "News",
      subtitle: "Embassy of Mongolia in the Republic of Indonesia",
      seeAll: "See all →",
      latest: "Latest",
      readMore: "Read more →",
      empty: "No news yet.",
      quickLinks: "Quick links",
      consular: "Consular services",
      contact: "Contact",
      visa: "Visa information",
    },
    id: {
      news: "Berita",
      subtitle: "Kedutaan Besar Mongolia untuk Republik Indonesia",
      seeAll: "Lihat semua →",
      latest: "Terbaru",
      readMore: "Selengkapnya →",
      empty: "Belum ada berita.",
      quickLinks: "Tautan cepat",
      consular: "Layanan konsuler",
      contact: "Kontak",
      visa: "Info visa",
    },
  };
  return dict[lang]?.[key] || dict.mn[key] || key;
}

function formatDate(locale: string, iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const lang = (locale || "mn").toLowerCase();

  if (lang === "mn") {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy} оны ${mm} дүгээр сарын ${dd}`;
  }

  return d.toISOString().slice(0, 10);
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>; // Next.js 15+ Async Params
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const lang = (locale || "mn").toLowerCase();

  const newsData = await getNewsList(lang);
  const list = newsData?.results || [];

  const featured = list[0] || null;
  const side = list.slice(1, 3);

  const featuredImg = resolveMediaUrl(featured?.cover);

  const featuredSummaryRaw = stripHtml(featured?.summary ?? featured?.body);
  const featuredSummary = decodeEntities(featuredSummaryRaw);

  return (
    <main className="gov-container py-8">
      {/* Section header */}
      <section className="gov-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {t(lang, "news")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{t(lang, "subtitle")}</p>
          </div>

          <Link
            href={`/${lang}/news`}
            className="inline-flex items-center justify-center rounded-full border bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {t(lang, "seeAll")}
          </Link>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Featured */}
        <div className="lg:col-span-2">
          {featured ? (
            <Link
              href={`/${lang}/news/${featured.slug}`}
              className="gov-card block overflow-hidden hover:shadow-sm transition"
            >
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                {featuredImg ? (
                  <Image
                    src={featuredImg}
                    alt={featured.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">
                    (Зураг байхгүй)
                  </div>
                )}

                {/* Date pill */}
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                  {formatDate(lang, featured.published_at)}
                </div>
              </div>

              {/* Caption */}
              <div className="p-5 sm:p-6">
                <div className="text-xl sm:text-2xl font-extrabold leading-snug text-slate-900">
                  {featured.title}
                </div>

                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {featuredSummary}
                </p>

                <div className="mt-4 text-sm font-semibold text-blue-700">
                  {t(lang, "readMore")}
                </div>
              </div>
            </Link>
          ) : (
            <div className="gov-card p-6 text-sm text-slate-600">
              {t(lang, "empty")}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="gov-card p-4">
            <div className="text-sm font-extrabold text-slate-900">
              {t(lang, "latest")}
            </div>

            <div className="mt-3 space-y-3">
              {side.map((n: any) => {
                const img = resolveMediaUrl(n.cover);
                return (
                  <Link
                    key={n.id}
                    href={`/${lang}/news/${n.slug}`}
                    className="flex gap-3 rounded-xl p-2 hover:bg-slate-50 transition"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 border">
                      {img ? (
                        <Image
                          src={img}
                          alt={n.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold leading-snug line-clamp-2 text-slate-900">
                        {n.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(lang, n.published_at)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <Link
                href={`/${lang}/news`}
                className="inline-flex text-sm font-semibold text-blue-700 hover:underline"
              >
                {t(lang, "seeAll")}
              </Link>
            </div>
          </div>

          {/* Quick links - Таны анхны кодыг яг хэвээр нь сэргээсэн */}
          <div className="gov-card p-4">
            <div className="text-sm font-extrabold text-slate-900">
              {t(lang, "quickLinks")}
            </div>

            <div className="mt-3 space-y-2">
              {[
                {
                  href: `/${lang}/services`,
                  label: t(lang, "consular"),
                },
                {
                  href: `/${lang}/contact`,
                  label: t(lang, "contact"),
                },
                {
                  href: `/${lang}/services`,
                  label: t(lang, "visa"),
                },
              ].map((x) => (
                <Link
                  key={x.label}
                  href={x.href}
                  className="block rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {x.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
