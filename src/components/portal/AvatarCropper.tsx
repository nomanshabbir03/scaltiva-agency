import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Loader2, Move, ZoomIn, ZoomOut } from "lucide-react";
import { primaryButton, secondaryButton } from "@/components/portal/form";

const VIEW = 240; // frame size on screen, px (fits the smallest phones)
const OUT = 256; // saved image size, px
const MAX_ZOOM = 3;

const isHeic = (file: File) => /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);

type Props = { file: File; onCancel: () => void; onSave: (image: Blob) => Promise<void> };

// Drag the photo (mouse, finger or arrow keys) and zoom it to fit the round frame.
// Only the part inside the frame is saved, as a 256px square JPEG.
export default function AvatarCropper({ file, onCancel, onSave }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // top-left of the photo inside the frame
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const drag = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  const [converting, setConverting] = useState(false);

  // Open the photo with the browser. iPhone HEIC/HEIF photos, which most browsers
  // can't show, are converted to JPEG first (the converter only downloads when needed).
  useEffect(() => {
    let url = "";
    let cancelled = false;
    const show = (blob: Blob) =>
      new Promise<void>((resolve, reject) => {
        url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          if (!cancelled) setImg(image);
          resolve();
        };
        image.onerror = reject;
        image.src = url;
      });

    show(file).catch(async () => {
      URL.revokeObjectURL(url);
      url = "";
      if (!isHeic(file)) return !cancelled && setFailed(true);
      setConverting(true);
      try {
        const { default: heic2any } = await import("heic2any");
        const jpeg = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        await show(Array.isArray(jpeg) ? jpeg[0] : jpeg);
      } catch {
        if (!cancelled) setFailed(true);
      }
      if (!cancelled) setConverting(false);
    });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // "Cover" scale: the photo's short side fills the frame at zoom 1.
  const scale = img ? (VIEW / Math.min(img.width, img.height)) * zoom : 1;
  const w = img ? img.width * scale : VIEW;
  const h = img ? img.height * scale : VIEW;

  // Keep the frame fully covered by the photo.
  const clamp = (x: number, y: number) => ({
    x: Math.min(0, Math.max(VIEW - w, x)),
    y: Math.min(0, Math.max(VIEW - h, y)),
  });

  // Center the photo when it first loads.
  useEffect(() => {
    if (img) {
      const s = VIEW / Math.min(img.width, img.height);
      setPos({ x: (VIEW - img.width * s) / 2, y: (VIEW - img.height * s) / 2 });
    }
  }, [img]);

  // Zoom around the frame's center so the face stays put.
  function changeZoom(next: number) {
    if (!img) return;
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    const ratio = z / zoom;
    const c = VIEW / 2;
    const nw = img.width * (VIEW / Math.min(img.width, img.height)) * z;
    const nh = img.height * (VIEW / Math.min(img.width, img.height)) * z;
    const x = c - (c - pos.x) * ratio;
    const y = c - (c - pos.y) * ratio;
    setZoom(z);
    setPos({ x: Math.min(0, Math.max(VIEW - nw, x)), y: Math.min(0, Math.max(VIEW - nh, y)) });
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, ...pos };
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const d = drag.current;
    setPos(clamp(d.x + e.clientX - d.startX, d.y + e.clientY - d.startY));
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 30 : 10;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[e.key]) {
      e.preventDefault();
      setPos((p) => clamp(p.x + moves[e.key][0], p.y + moves[e.key][1]));
    } else if (e.key === "+" || e.key === "=") changeZoom(zoom + 0.1);
    else if (e.key === "-") changeZoom(zoom - 0.1);
    else if (e.key === "Escape") onCancel();
  }

  async function save() {
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUT;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, OUT, OUT);
    // The frame shows source pixels from (-pos / scale), VIEW / scale wide.
    ctx.drawImage(img, -pos.x / scale, -pos.y / scale, VIEW / scale, VIEW / scale, 0, 0, OUT, OUT);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob) return setFailed(true);
    setSaving(true);
    await onSave(blob);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="crop-title" className="w-full max-w-sm bg-background p-6 shadow-2xl">
        <h2 id="crop-title" className="text-xl font-semibold">Fit your photo</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Move className="size-4" /> Drag to move, slide to zoom.
        </p>

        {failed ? (
          <p className="mt-6 bg-red-50 px-4 py-3 text-sm text-red-700">This file couldn&apos;t be opened as a photo. Please choose an image such as JPG, PNG, HEIC, WebP or GIF.</p>
        ) : (
          <>
            <div
              tabIndex={0}
              role="img"
              aria-label="Photo position. Use arrow keys to move, plus and minus to zoom."
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={onKeyDown}
              autoFocus
              className="relative mx-auto mt-5 cursor-grab touch-none select-none overflow-hidden bg-muted active:cursor-grabbing"
              style={{ width: VIEW, height: VIEW }}
            >
              {img ? (
                <img
                  src={img.src}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute max-w-none"
                  style={{ left: pos.x, top: pos.y, width: w, height: h }}
                />
              ) : (
                <div className="grid size-full place-content-center justify-items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  {converting && "Converting photo…"}
                </div>
              )}
              {/* Dim everything outside the round frame. */}
              <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.45)] ring-2 ring-white" />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button type="button" onClick={() => changeZoom(zoom - 0.2)} aria-label="Zoom out" className="text-muted-foreground hover:text-primary">
                <ZoomOut className="size-5" />
              </button>
              <input
                type="range"
                min={1}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={(e) => changeZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="flex-1 accent-[var(--primary)]"
              />
              <button type="button" onClick={() => changeZoom(zoom + 0.2)} aria-label="Zoom in" className="text-muted-foreground hover:text-primary">
                <ZoomIn className="size-5" />
              </button>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={saving} className={secondaryButton}>Cancel</button>
          {!failed && (
            <button type="button" onClick={save} disabled={!img || saving} className={`${primaryButton} px-5 py-2.5`}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
