import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { GREETING, GREETING_ROMAN, START_CHIPS } from "@/data/chatbot";
import { buildReply, findEntry, getEntry, isRoman, whatsappUrl, type Reply } from "@/lib/chatbot";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Message = { id: number; from: "bot" | "user"; text: string; reply?: Reply };

const TYPING_MS = 550;

export default function Chatbot() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: GREETING }]);
  const [chips, setChips] = useState<string[]>(START_CHIPS);
  const [typing, setTyping] = useState(false);
  const [roman, setRoman] = useState(false);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Phones only: the chat becomes a full-screen sheet that follows the
  // *visible* viewport, so the on-screen keyboard never covers it.
  const [mobile, setMobile] = useState(false);
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !mobile || !vv) return;
    const update = () => setViewport({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    // Stop the page behind from scrolling while the chat is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.body.style.overflow = previous;
      setViewport(null);
    };
  }, [open, mobile]);

  // Keep the newest message in view (also when the keyboard resizes the sheet).
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [messages, typing, reduce, viewport?.height]);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  function send(text: string, entryId?: string) {
    const clean = text.trim();
    if (!clean || typing) return;

    const useRoman = roman || isRoman(clean);
    setRoman(useRoman);
    setMessages((m) => [...m, { id: nextId.current++, from: "user", text: clean }]);
    setDraft("");
    setChips([]);
    setTyping(true);

    const entry = entryId ? (getEntry(entryId) ?? null) : findEntry(clean);
    const reply = buildReply(entry, clean, useRoman);

    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId.current++, from: "bot", text: reply.text, reply }]);
      setChips(reply.followUps?.length ? reply.followUps : START_CHIPS);
    }, reduce ? 0 : TYPING_MS);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Scaltive"
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            initial={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : 20, scale: reduce ? 1 : 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={mobile ? { top: viewport?.top ?? 0, height: viewport?.height ?? "100dvh" } : undefined}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl shadow-primary/20",
              mobile
                ? "inset-x-0"
                : "bottom-28 right-4 h-[min(34rem,calc(100dvh-8rem))] w-[min(23rem,calc(100vw-2rem))] origin-bottom-right rounded-3xl border sm:right-6",
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/20">
                <Bot className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">Scaltive</p>
                <p className="text-xs text-white/80">Ask about our services</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid size-9 place-items-center rounded-full transition hover:bg-white/15"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.from === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-accent text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-line">{m.id === 0 && roman ? GREETING_ROMAN : m.text}</p>

                    {m.reply?.links && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.reply.links.map((l) => (
                          <Link
                            key={l.to + l.label}
                            to={l.to}
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-primary/40 bg-background px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {m.reply?.whatsapp && (
                      <a
                        href={whatsappUrl(m.reply.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                      >
                        <MessageCircle className="size-4" /> Chat on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start" aria-label="Scaltive is typing">
                  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-accent px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1.5 rounded-full bg-primary"
                        animate={reduce ? undefined : { y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottom} />
            </div>

            {/* Quick replies */}
            {chips.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
                {chips.map((id) => {
                  const label = getEntry(id)?.label;
                  return label ? (
                    <button
                      key={id}
                      type="button"
                      onClick={() => send(label, id)}
                      className="shrink-0 rounded-full border border-primary/40 bg-background px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      {label}
                    </button>
                  ) : null;
                })}
              </div>
            )}

            {/* Input */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3">
              <label htmlFor="chat-input" className="sr-only">
                Type your question
              </label>
              <input
                id="chat-input"
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={300}
                autoComplete="off"
                placeholder="Type your question..."
                className="min-w-0 flex-1 rounded-full border bg-background px-4 py-2.5 text-base outline-none sm:text-sm transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label="Send message"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
            <p className="px-4 pb-3 text-center text-[11px] text-muted-foreground">
              Automated assistant. For anything else, WhatsApp {SITE.whatsappDisplay}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soft orange pulse that draws the eye while the chat is closed. */}
      {!open && (
        <span
          aria-hidden
          className="pointer-events-none fixed bottom-5 right-4 z-40 size-16 rounded-full bg-primary/50 motion-safe:animate-ping sm:right-6"
        />
      )}
      {/* On phones the open chat is a full-screen sheet with its own close button. */}
      {!(open && mobile) && (
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat with Scaltive"}
        aria-expanded={open}
        whileHover={reduce ? undefined : { scale: 1.08 }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        className="fixed bottom-5 right-4 z-50 grid size-16 place-items-center rounded-full border-2 border-primary bg-foreground text-primary shadow-xl shadow-black/30 sm:right-6"
      >
        {open ? <X className="size-7" /> : <Bot className="size-9" />}
        {!open && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-primary ring-2 ring-background" />
        )}
      </motion.button>
      )}
    </>
  );
}
