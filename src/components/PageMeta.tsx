import { useEffect } from "react";

export function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} · ASR Tool`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    ogTitle?.setAttribute("content", `${title} · ASR Tool`);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    ogDescription?.setAttribute("content", description);
  }, [title, description]);
  return null;
}
