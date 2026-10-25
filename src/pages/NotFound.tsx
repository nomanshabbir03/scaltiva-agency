import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-[70vh] place-items-center px-5 pt-32 text-center">
      {/* Tells crawlers this URL should not be indexed. */}
      <meta name="robots" content="noindex" />
      <title>Page not found | Scaltiva</title>
      <div>
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-semibold">This page doesn&apos;t exist (yet)</h1>
        <p className="mt-2 text-muted-foreground">The page you are looking for may have moved or is still being built.</p>
        <Link to="/" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground">
          Back to home
        </Link>
      </div>
    </main>
  );
}
