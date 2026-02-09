// filename: frontend/src/components/NewsCarousel.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type CarouselImage = {
  id: string | number;
  src: string;
  alt: string;
};

export default function NewsCarousel({ images }: { images: CarouselImage[] }) {
  const safe = useMemo(() => images.filter((x) => !!x?.src), [images]);
  const [idx, setIdx] = useState(0);

  const hasMany = safe.length > 1;
  const current = safe[idx];

  if (!current) return null;

  function prev() {
    setIdx((i) => (i - 1 + safe.length) % safe.length);
  }

  function next() {
    setIdx((i) => (i + 1) % safe.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-100">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          unoptimized
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 900px"
        />
      </div>

      {/* ✅ олон зурагтай үед л сум гарна */}
      {hasMany ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white w-10 h-10 flex items-center justify-center hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white w-10 h-10 flex items-center justify-center hover:bg-black/60"
          >
            ›
          </button>

          {/* хүсвэл жижигхэн тоолуур */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 text-white text-xs px-2 py-1">
            {idx + 1}/{safe.length}
          </div>
        </>
      ) : null}
    </div>
  );
}
