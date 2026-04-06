import Link from "next/link";
import { searchSite } from "@/lib/api";
import type { ReactNode } from "react";

type SearchParams =
  | { q?: string }
  | Promise<{ q?: string }>
  | undefined;

function t(locale: string) {
  const lang = (locale || "mn").toLowerCase();
  if (lang === "en") {
    return {
      title: "Search",
      placeholder: "Search...",
      empty: "No results found.",
      hint: "Type at least 2 characters.",
      counts: "Results",
      labels: { page: "Page", service: "Service", news: "News" },
    };
  }
  if (lang === "id") {
    return {
      title: "Pencarian",
      placeholder: "Cari...",
      empty: "Tidak ada hasil.",
      hint: "Masukkan minimal 2 karakter.",
      counts: "Hasil",
      labels: { page: "Halaman", service: "Layanan", news: "Berita" },
    };
  }
  return {
    title: "Хайлт",
    placeholder: "Хайх үг...",
    empty: "Илэрц олдсонгүй.",
    hint: "Хамгийн багадаа 2 тэмдэгт оруулна уу.",
    counts: "Илэрц",
    labels: { page: "Хуудас", service: "Үйлчилгээ", news: "Мэдээ" },
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// CODEX: Query token-уудыг result title дээр тодруулж харуулах helper.
function highlightText(text: string, query: string): ReactNode {
  const terms = query
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (!terms.length) return text;

  const pattern = terms.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "ig");
  const parts = text.split(regex);
  const lowerTerms = terms.map((t) => t.toLowerCase());

  return parts.map((part, i) =>
    lowerTerms.some((t) => part.toLowerCase() === t) ? (
      <mark key={`${part}-${i}`} className="rounded bg-amber-100 px-0.5 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${i}`}>{part}</span>
    )
  );
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale || "mn").toLowerCase();
  const dictionary = t(locale);

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const q = String(resolvedSearchParams?.q || "").trim();

  const data = q.length >= 2 ? await searchSite(locale, q) : null;
  const results = data?.results || [];
  const counts = data?.counts || { pages: 0, services: 0, news: 0 };

  return (
    <main className="bg-slate-50/60">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {dictionary.title}
          </h1>

          {/* CODEX: GET form ашиглан URL query-ээр хайлтыг хадгална. */}
          <form action={`/${locale}/search`} method="get" className="mt-4 flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={dictionary.placeholder}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {dictionary.title}
            </button>
          </form>

          {q.length < 2 ? (
            <p className="mt-4 text-sm text-slate-600">{dictionary.hint}</p>
          ) : null}
        </div>

        {q.length >= 2 ? (
          <div className="mt-5 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              {/* CODEX: Search category count-уудыг user-д ойлгомжтой харуулна. */}
              <span className="rounded-full border bg-slate-50 px-2.5 py-1">
                {dictionary.counts}: {results.length}
              </span>
              <span className="rounded-full border bg-slate-50 px-2.5 py-1">
                {dictionary.labels.page}: {counts.pages}
              </span>
              <span className="rounded-full border bg-slate-50 px-2.5 py-1">
                {dictionary.labels.service}: {counts.services}
              </span>
              <span className="rounded-full border bg-slate-50 px-2.5 py-1">
                {dictionary.labels.news}: {counts.news}
              </span>
            </div>

            {results.length === 0 ? (
              <p className="text-sm text-slate-600">{dictionary.empty}</p>
            ) : (
              <ul className="space-y-2">
                {results.map((item) => (
                  <li key={`${item.type}-${item.slug}`}>
                    <Link
                      href={item.url}
                      className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {highlightText(item.title, q)}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                        {dictionary.labels[item.type]}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
