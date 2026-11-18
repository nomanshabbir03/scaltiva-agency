import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { embedUrl } from "@/lib/video";
import { card, input, secondaryButton } from "@/components/portal/form";
import { useToast } from "@/components/portal/Toast";

const MAX_MB = 50;
const bucket = supabase.storage.from("portal-videos");

// Admin: set the "How to Use the Portal" video on the student home page, by upload or by link.
export default function GuideVideoUpload() {
  const toast = useToast();
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("portal_settings").select("value").eq("key", "guide_video").maybeSingle()
      .then(({ data }) => setUrl(data?.value ?? null));
  }, []);

  // Deletes the previous video file if it was an upload (links have nothing to delete).
  const removeOld = async () => {
    const old = url?.split("/portal-videos/")[1];
    if (old) await bucket.remove([old]);
  };

  async function save(value: string) {
    const { error } = await supabase.from("portal_settings").upsert({ key: "guide_video", value });
    if (error) return false;
    await removeOld();
    setUrl(value);
    return true;
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) return toast(`The video must be under ${MAX_MB} MB.`, "error");
    setBusy(true);
    const path = `guide/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const up = await bucket.upload(path, file, { contentType: file.type || undefined });
    if (up.error) {
      setBusy(false);
      return toast("Couldn't upload the video. Use an MP4 or WebM file.", "error");
    }
    const ok = await save(bucket.getPublicUrl(path).data.publicUrl);
    setBusy(false);
    toast(ok ? "Video updated. Students will see it on their home page." : "Couldn't save the video. Please try again.", ok ? "success" : "error");
  }

  async function onLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const link = String(new FormData(form).get("link")).trim();
    if (!/^https?:\/\/\S+$/i.test(link)) return toast("The link must start with https://", "error");
    setBusy(true);
    const ok = await save(link);
    setBusy(false);
    if (ok) form.reset();
    toast(ok ? "Video link saved." : "Couldn't save the link. Please try again.", ok ? "success" : "error");
  }

  async function onRemove() {
    if (!window.confirm("Remove the video? Students will see the default guide instead.")) return;
    setBusy(true);
    const { error } = await supabase.from("portal_settings").delete().eq("key", "guide_video");
    if (!error) {
      await removeOld();
      setUrl(null);
    }
    setBusy(false);
    toast(error ? "Couldn't remove the video. Please try again." : "Video removed.", error ? "error" : "success");
  }

  const embed = url ? embedUrl(url) : null;

  return (
    <section className={`${card} mt-10`}>
      <h2 className="text-xl font-semibold">How to Use the Portal video</h2>
      <p className="mt-1 text-sm text-muted-foreground">Shown to students on their home page. Upload an MP4/WebM (up to {MAX_MB} MB) or paste a YouTube, Vimeo or video link.</p>
      {url && (embed
        ? <iframe src={embed} title="Guide video" allowFullScreen className="mt-4 aspect-video w-full max-w-xl border-0 bg-muted" />
        : <video src={url} controls className="mt-4 aspect-video w-full max-w-xl bg-muted" />)}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className={`${secondaryButton} cursor-pointer`}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {url ? "Upload new video" : "Upload video"}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={onFile} disabled={busy} className="sr-only" />
        </label>
        {url && (
          <button type="button" onClick={onRemove} disabled={busy} className={secondaryButton}>
            <Trash2 className="size-4" />
            Remove video
          </button>
        )}
      </div>
      <form onSubmit={onLink} className="mt-4 flex max-w-xl flex-wrap gap-3">
        <input name="link" type="url" required placeholder="https://www.youtube.com/watch?v=..." aria-label="Video link" className={`${input} min-w-0 flex-1`} />
        <button type="submit" disabled={busy} className={secondaryButton}>Use link</button>
      </form>
    </section>
  );
}
