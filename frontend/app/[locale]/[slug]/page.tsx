import Image from "next/image";
import { notFound } from "next/navigation";
import { getPageItem } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Type definition for Next.js 15+ Async Params
type Params = Promise<{
  locale: string;
  slug: string;
}>;

const MEDIA_FALLBACK_DEV = "http://localhost:8000";

type PageLayout = "portrait" | "banner" | "none";

const PAGE_LAYOUTS: Record<string, PageLayout> = {
  ambassador: "portrait",
};

function resolveMediaUrl(raw: unknown, mediaBase: string) {
  if (!raw) return null;

  let url = String(raw);

  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      if (u.pathname.startsWith("/media/")) {
        return `${mediaBase}${u.pathname}`;
      }
      return url;
    } catch {}
  }

  if (!url.startsWith("/")) url = `/${url}`;
  return `${mediaBase}${url}`;
}

function getLayoutBySlug(slug: string): PageLayout {
  return PAGE_LAYOUTS[slug] ?? "none";
}

function pickMediaBase() {
  const envBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (envBase) return envBase;

  if (process.env.NODE_ENV === "production") return "";
  return MEDIA_FALLBACK_DEV;
}

export default async function StaticPage({ params }: { params: Params }) {
  // Await params at the beginning
  const resolvedParams = await params;
  const normLocale = String(resolvedParams.locale || "mn").toLowerCase();
  const normSlug = String(resolvedParams.slug || "")
    .replace(/\/+$/, "")
    .toLowerCase();

  if (!normSlug) notFound();

  const page = await getPageItem(normSlug, normLocale);

  if (!page) notFound();

  const mediaBase = pickMediaBase();
  const heroSrc = resolveMediaUrl(page.hero_image, mediaBase);
  const layout = getLayoutBySlug(normSlug);

  if (layout === "portrait") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
          {heroSrc ? (
            <div className="flex justify-center md:justify-start">
              <div className="w-[220px] sm:w-[260px] md:w-full">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <Image
                    src={heroSrc}
                    alt={page.title}
                    fill
                    priority
                    unoptimized
                    className="object-contain object-top"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

            <div
              className="
                max-w-none text-base leading-7
                [&_p]:my-3
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
                [&_li]:my-1
                [&_a]:text-blue-600 [&_a]:underline
                [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                [&_hr]:my-6
                [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
              "
              dangerouslySetInnerHTML={{ __html: page.body || "" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "banner") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        {heroSrc ? (
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <div className="relative h-[220px] sm:h-[280px] md:h-[360px] w-full">
              <Image
                src={heroSrc}
                alt={page.title}
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />
            </div>
          </div>
        ) : null}

        <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

        <div
          className="
            max-w-none text-base leading-7
            [&_p]:my-3
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
            [&_li]:my-1
            [&_a]:text-blue-600 [&_a]:underline
            [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
            [&_hr]:my-6
            [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
          "
          dangerouslySetInnerHTML={{ __html: page.body || "" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* CODEX: Hero зурагтай page-үүдэд (layout=none ч гэсэн) banner-ийг харуулна. */}
      {heroSrc ? (
        <div className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
          <div className="relative h-[220px] sm:h-[280px] md:h-[340px] w-full">
            <Image
              src={heroSrc}
              alt={page.title}
              fill
              priority
              unoptimized
              className="object-cover object-center"
            />
          </div>
        </div>
      ) : null}

      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

      <div
        className="
          max-w-none text-base leading-7
          [&_p]:my-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
          [&_li]:my-1
          [&_a]:text-blue-600 [&_a]:underline
          [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
          [&_hr]:my-6
          [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700
        "
        dangerouslySetInnerHTML={{ __html: page.body || "" }}
      />
    </div>
  );
}
