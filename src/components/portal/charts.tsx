import { useState, type MouseEvent } from "react";

// Small SVG charts for the Progress Timeline. Brand orange is the focus series;
// a darker dashed gray is the reference series. Every chart also has a
// screen-reader table, and hover shows exact values.

export const ORANGE = "var(--primary)";
export const GRAY = "#737373";
const GRID = "#e5e5e5";
const AXIS_TEXT = "#737373";

type Series = { name: string; color: string; dashed?: boolean; values: number[] };

function niceMax(max: number) {
  const step = Math.max(1, Math.ceil(max / 4));
  return step * 4;
}

function Legend({ items }: { items: { name: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      {items.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden>
            <line x1="1" y1="4" x2="17" y2="4" style={{ stroke: s.color }} strokeWidth="2" strokeDasharray={s.dashed ? "4 3" : undefined} strokeLinecap="round" />
          </svg>
          {s.name}
        </span>
      ))}
    </div>
  );
}

export function LineChart({ labels, series, caption }: { labels: string[]; series: Series[]; caption: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 260;
  const pad = { top: 16, right: 16, bottom: 32, left: 36 };
  const yMax = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const n = labels.length;
  const x = (i: number) => pad.left + (n === 1 ? (W - pad.left - pad.right) / 2 : (i * (W - pad.left - pad.right)) / (n - 1));
  const y = (v: number) => pad.top + (1 - v / yMax) * (H - pad.top - pad.bottom);
  const ticks = [0, 1, 2, 3, 4].map((t) => (yMax / 4) * t);
  // Show at most ~8 x labels so they never collide.
  const every = Math.ceil(n / 8);

  function onMove(e: MouseEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * (W - pad.left - pad.right);
    setHover(n === 1 ? 0 : Math.max(0, Math.min(n - 1, Math.round((px / (W - pad.left - pad.right)) * (n - 1)))));
  }

  return (
    <figure>
      <Legend items={series} />
      <div className="relative mt-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={caption}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={pad.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={AXIS_TEXT}>{t}</text>
            </g>
          ))}
          {labels.map((l, i) =>
            i % every === 0 || i === n - 1 ? (
              <text key={l} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{l}</text>
            ) : null,
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={H - pad.bottom} stroke={GRAY} strokeWidth="1" strokeDasharray="3 3" />}
          {series.map((s) => (
            <g key={s.name}>
              <polyline
                points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
                fill="none"
                style={{ stroke: s.color }}
                strokeWidth="2"
                strokeDasharray={s.dashed ? "6 4" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 4} style={{ fill: s.color }} stroke="#fff" strokeWidth="2" />
              ))}
            </g>
          ))}
          <rect
            x={pad.left}
            y={pad.top}
            width={W - pad.left - pad.right}
            height={H - pad.top - pad.bottom}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-xl border bg-background px-3 py-2 text-xs shadow-lg"
            style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > n / 2 ? "-105%" : "5%"})` }}
          >
            <p className="font-semibold">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.name} className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                <span className="inline-block size-2 rounded-full" style={{ background: s.color }} />
                {s.name}: <span className="font-semibold text-foreground">{s.values[hover]}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      <table className="sr-only">
        <thead>
          <tr><th>Week</th>{series.map((s) => <th key={s.name}>{s.name}</th>)}</tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l}><td>{l}</td>{series.map((s) => <td key={s.name}>{s.values[i]}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// Two-part ring: the focus part in orange over a light track, value in the middle.
export function Donut({ value, total, label, remainderLabel }: { value: number; total: number; label: string; remainderLabel: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const share = total ? value / total : 0;
  return (
    <figure className="flex flex-col items-center">
      <Legend items={[{ name: label, color: ORANGE }, { name: remainderLabel, color: GRID }]} />
      <svg viewBox="0 0 200 200" className="mt-3 w-44" role="img" aria-label={`${value} of ${total} ${label.toLowerCase()}`}>
        <circle cx="100" cy="100" r={r} fill="none" stroke={GRID} strokeWidth="24">
          <title>{`${remainderLabel}: ${total - value}`}</title>
        </circle>
        {share > 0 && (
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            style={{ stroke: ORANGE }}
            strokeWidth="24"
            strokeDasharray={`${share * c} ${c}`}
            transform="rotate(-90 100 100)"
          >
            <title>{`${label}: ${value}`}</title>
          </circle>
        )}
        <text x="100" y="96" textAnchor="middle" fontSize="30" fontWeight="600" fill="currentColor">{value}/{total}</text>
        <text x="100" y="120" textAnchor="middle" fontSize="12" fill={AXIS_TEXT}>{label.toLowerCase()}</text>
      </svg>
    </figure>
  );
}

// Single-series percentage bars.
export function PercentBars({ bars, caption }: { bars: { label: string; value: number }[]; caption: string }) {
  const W = 420;
  const H = 230;
  const pad = { top: 22, bottom: 30, left: 36, right: 8 };
  const slot = (W - pad.left - pad.right) / bars.length;
  const barW = Math.min(64, slot * 0.5);
  const y = (v: number) => pad.top + (1 - v / 100) * (H - pad.top - pad.bottom);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={caption}>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={pad.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={AXIS_TEXT}>{t}%</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const cx = pad.left + slot * i + slot / 2;
          const top = y(b.value);
          const h = H - pad.bottom - top;
          return (
            <g key={b.label}>
              {h > 0 && (
                // Rounded top, square base on the axis.
                <path
                  d={`M${cx - barW / 2},${H - pad.bottom} V${top + Math.min(4, h)} q0,-4 4,-4 H${cx + barW / 2 - 4} q4,0 4,4 V${H - pad.bottom} Z`}
                  style={{ fill: ORANGE }}
                >
                  <title>{`${b.label}: ${b.value}%`}</title>
                </path>
              )}
              <text x={cx} y={top - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor">{b.value}%</text>
              <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>{b.label}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
