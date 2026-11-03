import { useEffect, useRef } from "react";

// Just the parts of the YouTube IFrame Player API we use.
type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      host: string;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: { onStateChange: (e: { data: number }) => void };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYING = 1;
const SAVE_EVERY_MS = 10_000;
const COMPLETE_AT = 0.9;

let apiReady: Promise<YTNamespace> | null = null;

function loadYouTubeApi() {
  apiReady ??= new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiReady;
}

type Props = {
  videoId: string;
  /** Second to resume from. */
  start: number;
  completed: boolean;
  /** Called with the current second; `completed` is true once ~90% has been watched. */
  onSave: (seconds: number, completed?: boolean) => void;
};

// Render with key={lesson.id} so each lesson gets a fresh player.
// Saves every ~10s while playing, and on pause, end, lesson change and tab close.
export default function YouTubePlayer({ videoId, start, completed, onSave }: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const completedRef = useRef(completed);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    completedRef.current = completed;
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer: number | undefined;
    let destroyed = false;
    let lastSaved = start;

    // The API replaces this element with its iframe, so React never touches it.
    const target = document.createElement("div");
    wrapper.current?.appendChild(target);

    const save = (minChange: number) => {
      if (!player?.getCurrentTime) return;
      const seconds = player.getCurrentTime();
      const duration = player.getDuration();
      if (!completedRef.current && duration > 0 && seconds / duration >= COMPLETE_AT) {
        completedRef.current = true;
        lastSaved = seconds;
        onSaveRef.current(seconds, true);
      } else if (Math.abs(seconds - lastSaved) >= minChange) {
        lastSaved = seconds;
        onSaveRef.current(seconds);
      }
    };

    loadYouTubeApi().then((YT) => {
      if (destroyed) return;
      player = new YT.Player(target, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, enablejsapi: 1, start: Math.floor(start), origin: window.location.origin },
        events: {
          onStateChange: ({ data }) => {
            window.clearInterval(timer);
            if (data === PLAYING) timer = window.setInterval(() => save(5), SAVE_EVERY_MS);
            else save(1); // paused, ended or buffering
          },
        },
      });
    });

    const onHide = () => {
      if (document.visibilityState === "hidden") save(1);
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      destroyed = true;
      save(1);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      player?.destroy();
      target.remove();
    };
    // Fresh player per lesson via key; start is only read on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return <div ref={wrapper} className="aspect-video overflow-hidden bg-black shadow-xl shadow-primary/5 [&_iframe]:size-full" />;
}
