import { useEffect, useState } from "react";
import { Award, Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { fileName } from "@/lib/csv";
import { primaryButton, secondaryButton } from "@/components/portal/form";

type Certificate = { id: string; file_path: string; issued_at: string; courses: { title: string } | null };
type Links = { view: string; download: string };

const isPdf = (path: string) => path.toLowerCase().endsWith(".pdf");

export default function Certificates() {
  const { profile } = useAuth();
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [links, setLinks] = useState<Record<string, Links>>({});

  useEffect(() => {
    if (!profile) return;
    // RLS and the private bucket only ever return this student's own certificates.
    supabase
      .from("certificates")
      .select("id, file_path, issued_at, courses(title)")
      .eq("user_id", profile.id)
      .order("issued_at", { ascending: false })
      .then(async ({ data }) => {
        const list = (data ?? []) as unknown as Certificate[];
        const bucket = supabase.storage.from("certificates");
        const entries = await Promise.all(
          list.map(async (c) => {
            const ext = c.file_path.split(".").pop();
            const name = `${fileName(c.courses?.title ?? "course")}-certificate.${ext}`;
            const [view, download] = await Promise.all([
              bucket.createSignedUrl(c.file_path, 3600),
              bucket.createSignedUrl(c.file_path, 3600, { download: name }),
            ]);
            return [c.id, { view: view.data?.signedUrl ?? "", download: download.data?.signedUrl ?? "" }] as const;
          }),
        );
        setLinks(Object.fromEntries(entries));
        setCerts(list);
      });
  }, [profile]);

  return (
    <div className="max-w-5xl">
      <title>My Certificates | Scaltiva Student Portal</title>
      <h1 className="text-2xl font-semibold">My Certificates</h1>

      {!certs ? (
        <div className="grid place-items-center py-24" role="status" aria-label="Loading">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : certs.length === 0 ? (
        <div className="mt-5 bg-background py-16 text-center shadow-sm">
          <Award className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">No certificates yet</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">Finish your course and Scaltiva will add your completion certificate here for you to download.</p>
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {certs.map((c) => {
            const link = links[c.id];
            return (
              <li key={c.id} className="overflow-hidden bg-background shadow-sm">
                <a href={link?.view} target="_blank" rel="noopener noreferrer" className="block bg-muted" aria-label={`Open the ${c.courses?.title} certificate`}>
                  {isPdf(c.file_path) || !link?.view ? (
                    <div className="grid aspect-[4/3] place-items-center text-primary">
                      <FileText className="size-14" />
                    </div>
                  ) : (
                    <img src={link.view} alt={`${c.courses?.title} certificate`} className="aspect-[4/3] w-full object-contain" />
                  )}
                </a>
                <div className="p-5">
                  <h2 className="font-semibold">{c.courses?.title}</h2>
                  <p className="text-sm text-muted-foreground">Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <a href={link?.download} className={`${primaryButton} px-5 py-2.5`}>
                      <Download className="size-4" />
                      Download
                    </a>
                    <a href={link?.view} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                      <ExternalLink className="size-4" />
                      View
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
