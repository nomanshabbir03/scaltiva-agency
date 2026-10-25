import { FALLBACK, FALLBACK_ROMAN, KB, type Entry } from "@/data/chatbot";
import { SITE } from "@/lib/site";

// Words that signal the visitor is writing Roman Urdu, so we reply in kind.
const ROMAN_WORDS = new Set([
  "kya", "kia", "kitna", "kitni", "kitne", "hai", "hain", "hoga", "hogi", "mein", "aap", "ap", "apka", "apki", "aapka",
  "aapki", "humara", "hum", "mujhe", "mera", "meri", "chahiye", "chahta", "chahte", "chahti", "karna", "karo", "karen",
  "karein", "kaise", "kese", "kab", "kahan", "kidhar", "nahi", "nahin", "bohat", "bahut", "shukriya", "salam", "assalam",
  "walaikum", "madad", "batao", "bataye", "bataiye", "banana", "banani", "banwani", "banwana", "lagta", "lagega",
  "lagay", "paisay", "paise", "rupay", "qeemat", "kharcha", "tareeqa", "rabta", "raabta", "baat", "zaroorat", "acha",
  "theek", "jee", "sirf", "aur", "wala", "wali", "ka", "ki", "ke", "ko", "kaun", "konsi", "kaunsi", "chahie",
]);

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9#\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function distance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

/** Minimum score needed to answer; anything lower falls back to WhatsApp. */
const THRESHOLD = 1.5;

function score(entry: Entry, text: string, tokens: string[]) {
  let total = 0;
  for (const raw of entry.keywords) {
    const kw = raw.toLowerCase();
    if (kw.includes(" ")) {
      if (` ${text} `.includes(` ${kw} `)) total += 3;
    } else if (tokens.includes(kw)) {
      total += 2;
    } else if (kw.length >= 5) {
      const allowed = kw.length >= 8 ? 2 : 1;
      if (tokens.some((t) => t.length >= 4 && Math.abs(t.length - kw.length) <= allowed && distance(t, kw) <= allowed)) {
        total += 1.5;
      }
    }
  }
  return total;
}

export function isRoman(input: string) {
  return norm(input).some((t) => ROMAN_WORDS.has(t));
}

/** Best matching entry for a message, or null when nothing matches well enough. */
export function findEntry(input: string): Entry | null {
  const base = norm(input);
  if (!base.length) return null;
  // Also try each word without a trailing "s", so plurals match.
  const tokens = [...new Set([...base, ...base.map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t))])];
  const text = base.join(" ");

  let best: Entry | null = null;
  let bestScore = 0;
  for (const entry of KB) {
    const s = score(entry, text, tokens);
    if (s > bestScore) {
      best = entry;
      bestScore = s;
    }
  }
  return bestScore >= THRESHOLD ? best : null;
}

export const getEntry = (id: string) => KB.find((e) => e.id === id);

export const whatsappUrl = (text: string) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export type Reply = {
  text: string;
  links?: { label: string; to: string }[];
  /** Pre-filled WhatsApp message; when set the reply shows a WhatsApp button. */
  whatsapp?: string;
  followUps?: string[];
};

export function buildReply(entry: Entry | null, userText: string, roman: boolean): Reply {
  if (!entry) {
    return {
      text: `${roman ? FALLBACK_ROMAN : FALLBACK} ${SITE.whatsappDisplay}`,
      whatsapp: `Hi Scaltiva, I have a question: ${userText}`.slice(0, 500),
    };
  }
  return {
    text: roman && entry.roman ? entry.roman : entry.answer,
    links: entry.links,
    whatsapp:
      entry.whatsapp === true
        ? `Hi Scaltiva, I'd like to ask about: ${entry.label}`
        : typeof entry.whatsapp === "string"
          ? entry.whatsapp
          : undefined,
    followUps: entry.followUps,
  };
}
