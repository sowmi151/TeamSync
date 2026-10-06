import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";

export const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export function validateMedia(file: File) {
  if (!MEDIA_TYPES.includes(file.type)) throw new Error("Choose a JPG, PNG, WebP, GIF, MP4, WebM or MOV file.");
  if (file.size > MAX_MEDIA_BYTES) throw new Error("Choose a file smaller than 50 MB.");
  if (!file.size) throw new Error("This file is empty.");
}

export const ChatMedia: React.FC<{ path: string; type: "image" | "video"; name?: string }> = ({ path, type, name }) => {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const result = await supabase.storage.from("chat-media").createSignedUrl(path, 3600);
      if (active) { setUrl(result.data?.signedUrl); setError(Boolean(result.error)); }
    };
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 50 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, [path]);
  if (!url) return <span>{error ? "Attachment unavailable" : "Loading attachment..."}</span>;
  return type === "image"
    ? <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={name || "Shared photo"} loading="lazy" className="max-h-64 max-w-full rounded-lg mb-2" /></a>
    : <video src={url} controls preload="metadata" className="max-h-64 max-w-full rounded-lg mb-2" />;
};
