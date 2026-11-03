const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

// Returns the 11-character video ID from a YouTube link, or null if the link
// isn't a YouTube video. Handles watch?v=, youtu.be/, embed/, shorts/ and live/
// links (with or without www./m. and extra query params), or a bare ID.
export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, "");
  const [, first = "", second = ""] = url.pathname.split("/");
  let id: string | null = null;

  if (host === "youtu.be") id = first;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (first === "watch") id = url.searchParams.get("v");
    else if (["embed", "shorts", "live", "v"].includes(first)) id = second;
  }

  return id && VIDEO_ID.test(id) ? id : null;
}

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
