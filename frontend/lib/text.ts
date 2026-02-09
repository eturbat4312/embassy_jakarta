// filename: frontend/src/lib/text.ts
export function stripHtml(input?: string | null) {
    if (!input) return "";
    return input
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  export function decodeEntities(input?: string | null) {
    if (!input) return "";
    // Хөнгөн decode (ихэнх admin-аас ирдэг entity-үүдийг л цэвэрлэнэ)
    return input
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, "’")
      .replace(/&lsquo;/g, "‘")
      .replace(/&rdquo;/g, "”")
      .replace(/&ldquo;/g, "“")
      .replace(/\s+/g, " ")
      .trim();
  }
  