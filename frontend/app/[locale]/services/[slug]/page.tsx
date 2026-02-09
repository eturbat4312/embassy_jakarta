// filename: frontend/app/[locale]/services/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getConsularServiceDetail } from "@/lib/api";

function getPublicBase() {
  const a = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  if (a) return a;
  const b = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (b) {
    try {
      const u = new URL(b);
      return `${u.protocol}//${u.host}`;
    } catch {}
  }
  return process.env.NODE_ENV === "production" ? "" : "http://localhost:8000";
}

const PUBLIC_BASE = getPublicBase();

function resolveFileUrl(fileUrl: string | null | undefined) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  const normalized = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
  return `${PUBLIC_BASE}${normalized}`;
}

function RichHtml({ html }: { html: string }) {
  return (
    <div
      className="
        text-base leading-7 text-slate-800
        [&_p]:my-3
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
        [&_li]:my-1
        [&_a]:text-blue-700 [&_a]:underline
        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
        [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-700
      "
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const { locale, slug } = resolvedParams;
  const lang = (locale || "mn").toLowerCase();

  const service = await getConsularServiceDetail(slug, lang);
  if (!service) notFound();

  return (
    <main className="bg-slate-50/60">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {service.title}
          </h1>

          {service.body && (
            <div className="mt-6">
              <RichHtml html={service.body} />
            </div>
          )}

          {service.resources?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                {lang === "en"
                  ? "Files & Links"
                  : lang === "id"
                  ? "Berkas & Tautan"
                  : "Файл, холбоос"}
              </h2>
              <ul className="space-y-2">
                {service.resources.map((r: any) => {
                  const href =
                    r.type === "pdf" ? resolveFileUrl(r.file_url) : r.url;
                  if (!href) return null;
                  return (
                    <li key={r.id} className="flex items-start gap-2">
                      <span className="mt-1 text-slate-400">•</span>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {r.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {(service.contact_note ||
            service.contact_email ||
            service.contact_phone ||
            service.office_hours) && (
            <div className="mt-10 rounded-2xl border bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900 mb-2">
                {lang === "en"
                  ? "Contact"
                  : lang === "id"
                  ? "Kontak"
                  : "Холбоо барих"}
              </h3>
              {service.contact_note && <RichHtml html={service.contact_note} />}
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {service.contact_email && (
                  <p>
                    <span className="text-slate-500">
                      {lang === "en" ? "Email" : "Имэйл"}:
                    </span>{" "}
                    <a
                      href={`mailto:${service.contact_email}`}
                      className="text-blue-700 underline"
                    >
                      {service.contact_email}
                    </a>
                  </p>
                )}
                {service.contact_phone && (
                  <p>
                    <span className="text-slate-500">
                      {lang === "en" ? "Phone" : "Утас"}:
                    </span>{" "}
                    {service.contact_phone}
                  </p>
                )}
                {service.office_hours && (
                  <p>
                    <span className="text-slate-500">
                      {lang === "en" ? "Hours" : "Цаг"}:
                    </span>{" "}
                    {service.office_hours}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
