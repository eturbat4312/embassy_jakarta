// filename: frontend/lib/api.ts
type Json = any;

const isServer = typeof window === "undefined";

const DEBUG_API = process.env.DEBUG_API === "1";

// SSR үед docker network доторх URL хэрэгтэй
const API_INTERNAL_BASE_URL =
  process.env.API_INTERNAL_BASE_URL || "http://backend:8000";

// Browser үед nginx proxy ашиглана (/api)
const API_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

function trimSlashEnds(s: string) {
  return s.replace(/\/+$/, "");
}
function trimSlashStart(s: string) {
  return s.replace(/^\/+/, "");
}
function join(base: string, path: string) {
  const b = trimSlashEnds(base);
  const p = trimSlashStart(path);
  return `${b}/${p}`;
}

function getApiBase() {
  // SSR: http://backend:8000/api
  if (isServer) return join(API_INTERNAL_BASE_URL, "api");
  // Browser: /api
  return trimSlashEnds(API_PUBLIC_BASE_URL);
}

async function safeText(res: Response) {
  return await res.text().catch(() => "");
}

async function apiFetch<T = Json>(
  path: string, // "news/?lang=mn" гэх мэт. /api гэж эхлэх ЁСГҮЙ.
  init?: RequestInit & { next?: any }
): Promise<T> {
  const url = join(getApiBase(), path);

  if (DEBUG_API) {
    // Server component log -> docker logs frontend дээр гарна
    console.log(`[apiFetch] ${isServer ? "SSR" : "BROWSER"} -> ${url}`);
  }

  const res = await fetch(url, {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      ...(init?.headers || {}),
    },
  });

  if (DEBUG_API) {
    console.log(
      `[apiFetch] ${isServer ? "SSR" : "BROWSER"} <- ${res.status} ${res.statusText} ${url}`
    );
  }

  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(
      `API ${res.status} ${res.statusText} -> ${url}\n${body.slice(0, 2000)}`
    );
  }

  // JSON parse error гарвал эндээс throw болно
  return (await res.json()) as T;
}

// -------------------- NEWS --------------------
export async function getNewsList(locale: string) {
  return apiFetch(`news/?lang=${encodeURIComponent(locale)}`, {
    next: { revalidate: 60 },
  });
}

export async function getNewsDetail(slug: string, locale: string) {
  if (!slug?.trim()) return null as any;
  return apiFetch(
    `news/${encodeURIComponent(slug)}/?lang=${encodeURIComponent(locale)}`,
    { cache: "no-store" }
  );
}

// -------------------- PAGES --------------------
export async function getPagesList(locale: string) {
  return apiFetch(`pages/?lang=${encodeURIComponent(locale)}`, {
    next: { revalidate: 60 },
  });
}

export async function getPageItem(slug: string, locale: string) {
  const s = String(slug || "").trim();
  if (!s) return null;

  try {
    return await apiFetch(
      `pages/${encodeURIComponent(s)}/?lang=${encodeURIComponent(locale)}`,
      { cache: "no-store" }
    );
  } catch (e) {
    console.error(
      `[getPageItem] FAILED slug="${s}" locale="${locale}" base="${getApiBase()}"`,
      e
    );
    return null;
  }
}

// -------------------- CONTACT --------------------
export async function sendContactMessage(data: any) {
  return apiFetch(`contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// -------------------- CONSULAR SERVICES --------------------
export async function getConsularServices(locale: string) {
  const data: any = await apiFetch(
    `consular-services/?lang=${encodeURIComponent(locale)}`,
    { cache: "no-store" }
  );

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  console.error("Unexpected consular services response:", data);
  return [];
}

export async function getConsularServiceDetail(slug: string, locale: string) {
  const s = String(slug || "").trim();
  if (!s) return null;

  try {
    return await apiFetch(
      `consular-services/${encodeURIComponent(s)}/?lang=${encodeURIComponent(
        locale
      )}`,
      { cache: "no-store" }
    );
  } catch (e) {
    console.error(
      `[getConsularServiceDetail] FAILED slug="${s}" locale="${locale}" base="${getApiBase()}"`,
      e
    );
    return null;
  }
}
