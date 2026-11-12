import { useEffect, useState, type ChangeEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { card, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

const MAX_MB = 50;

// Admin: replace the "How to Use the Portal" video on the student home page.
export default function GuideVideoUpload() {
  const toast = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("portal_settings").select("value").eq("key", "guide_video").maybeSingle()
      .then(({ data }) => setUrl(data?.value ?? null));
  }, []);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return toast(`The video must be under ${MAX_MB} MB.`, "error");
    setBusy(true);
    const path = `guide/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const bucket = supabase.storage.from("portal-videos");
    const up = await bucket.upload(path, file, { contentType: file.type || undefined });
    if (up.error) {
      setBusy(false);
      return toast("Couldn't upload the video. Use an MP4 or WebM file.", "error");
    }
    const value = bucket.getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from("portal_settings").upsert({ key: "guide_video", value });
    setBusy(false);
    if (error) return toast("Couldn't save the video. Please try again.", "error");
    // Remove the previous upload.
    const old = url?.split("/portal-videos/")[1];
    if (old) await bucket.remove([old]);
    setUrl(value);
    toast("Video updated. Students will see it on their home page.");
  }

  return (
    <section className={`${card} mt-10`}>
      <h2 className="text-xl font-semibold">How to Use the Portal video</h2>
      <p className="mt-1 text-sm text-muted-foreground">Shown to students on their home page. MP4 or WebM, up to {MAX_MB} MB.</p>
      {url && <video src={url} controls className="mt-4 aspect-video w-full max-w-xl bg-muted" />}
      <label className={`${secondaryButton} mt-4 cursor-pointer`}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {url ? "Upload new video" : "Upload video"}
        <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={onFile} disabled={busy} className="sr-only" />
      </label>
    </section>
  );
}
