import { absoluteUrl, SITE } from "@/lib/site";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Structured data objects; each is emitted as its own JSON-LD block. */
  jsonLd?: Record<string, unknown>[];
};

// React 19 hoists <title>, <meta> and <link> rendered anywhere into <head>.
export default function Seo({ title, description, path, image = SITE.ogImage, jsonLd = [] }: SeoProps) {
  const url = absoluteUrl(path);
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          // "<" is escaped so content can never close the script tag early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
