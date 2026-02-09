// filename: frontend/src/app/[locale]/news/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getNewsList } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function stripHtml(input?: string | null) {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const UI = {
  mn: {
    title: "Мэдээ",
    empty: "Одоогоор мэдээ байхгүй байна.",
    readMore: "Дэлгэрэнгүй →",
  },
  en: {
    title: "News",
    empty: "No news yet.",
    readMore: "Read more →",
  },
  id: {
    title: "Berita",
    empty: "Belum ada berita.",
    readMore: "Selengkapnya →",
  },
} as const;

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>; // 1. Promise төрөлтэй болгов
}) {
  // 2. ЗАЙЛШГҮЙ: params-ыг await хийх
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const lang = (locale || "mn").toLowerCase() as "mn" | "en" | "id";
  const t = UI[lang] ?? UI.mn;

  // 3. Одоо lang нь "mn" гэсэн зөв утгатай очих тул мэдээ ирнэ
  const data = await getNewsList(lang);
  const list = data?.results || [];

  return (
    <main className="bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-2xl border bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {t.title}
          </h1>
        </div>

        {!list.length ? (
          <div className="mt-6 rounded-2xl border bg-white p-8 text-center text-slate-600">
            {t.empty}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {list.map((item: any) => {
            const img = resolveMediaUrl(item.cover);
            const preview = stripHtml(item.summary ?? item.body).slice(0, 240);

            return (
              <Link
                key={item.id}
                href={`/${lang}/news/${item.slug}`}
                className="group rounded-2xl border bg-white p-5 shadow-sm transition
                           hover:-translate-y-[1px] hover:shadow-md
                           focus:outline-none focus:ring-2 focus:ring-slate-400/50"
              >
                <div className="flex gap-4">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-slate-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {preview || t.readMore}
                    </div>
                    <div className="mt-3 text-sm font-semibold text-blue-700">
                      {t.readMore}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
