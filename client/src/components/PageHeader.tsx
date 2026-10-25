import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Props = {
  /** Breadcrumb trail after "Home"; the last entry is the current page. */
  crumbs: { label: string; to?: string }[];
  title: ReactNode;
  intro: string;
};

export default function PageHeader({ crumbs, title, intro }: Props) {
  return (
    <header className="bg-accent/50 px-5 pb-16 pt-36 lg:pb-20">
      <div className="mx-auto max-w-4xl text-center">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex items-center justify-center gap-2">
            <li>
              <Link to="/" className="hover:text-primary">Home</Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {c.to && i < crumbs.length - 1 ? (
                  <Link to={c.to} className="hover:text-primary">{c.label}</Link>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">{intro}</p>
      </div>
    </header>
  );
}
