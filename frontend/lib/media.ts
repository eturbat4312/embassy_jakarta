// filename: frontend/src/lib/media.ts

// Production-д заавал relative path ашиглана
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "";

export function resolveMediaUrl(raw: unknown): string | null {
  if (!raw) return null;

  let url = String(raw);

  // Хэрэв URL нь бүтэн (http) байвал
  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      // Хэрэв backend-ийн дотоод хаяг байвал relative болгож цэвэрлэнэ
      if (u.hostname === "backend" || u.hostname === "localhost") {
        return u.pathname; // Жишээ нь: /media/covers/news.jpg
      }
      return url;
    } catch {
      return null;
    }
  }

  // Relative зам үүсгэх
  if (!url.startsWith("/")) url = `/${url}`;
  
  // MEDIA_BASE хоосон үед шууд /media/... гэж буцна
  return `${MEDIA_BASE}${url}`;
}