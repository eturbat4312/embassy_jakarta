// filename: frontend/src/app/[locale]/news/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getNewsDetail } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import NewsCarousel from "@/components/NewsCarousel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CarouselImage = {
  id: string | number;
  src: string;
  alt: string;
};

type Params = { locale: string; slug: string };

export default async function NewsDetailPage({
  params,
}: {
  params: Params | Promise<Params>;
}) {
  // Next.js 15: params Promise байж магадгүй. Next 14: object байж болно.
  const { locale, slug } = await Promise.resolve(params);

  const lang = (locale || "mn").toLowerCase();

  const item = await getNewsDetail(slug.toLowerCase(), lang);

  if (!item) notFound();

  const coverSrc = resolveMediaUrl(item.cover);
  const album = Array.isArray(item.images) ? item.images : [];

  const albumImages: CarouselImage[] = album
    .slice(0, 10)
    .map((img: any) => {
      const src = resolveMediaUrl(img?.image);
      if (!src) return null;
      return {
        id: img?.id ?? src,
        src,
        alt: img?.caption || item.title,
      } as CarouselImage;
    })
    .filter((x: CarouselImage | null): x is CarouselImage => !!x);

  const images: CarouselImage[] = [
    ...(coverSrc ? [{ id: "cover", src: coverSrc, alt: item.title }] : []),
    ...albumImages,
  ];

  const uniqueImages: CarouselImage[] = [];
  const seen = new Set<string>();
  for (const img of images) {
    if (seen.has(img.src)) continue;
    seen.add(img.src);
    uniqueImages.push(img);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">{item.title}</h1>

      {uniqueImages.length ? <NewsCarousel images={uniqueImages} /> : null}

      <div
        className="
          mt-8 text-base leading-7
          [&_p]:my-3
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
          [&_li]:my-1
          [&_a]:text-blue-600 [&_a]:underline
          [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2
          [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
        "
        dangerouslySetInnerHTML={{ __html: item.body || "" }}
      />
    </main>
  );
}
