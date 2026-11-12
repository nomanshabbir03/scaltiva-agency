import { Download, X } from "lucide-react";
import { downloadFile, type StoredFile } from "@/lib/files";
import { useToast } from "@/components/portal/Toast";

export default function FileDownload({ path, name, label }: { path: string; name: string; label?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => downloadFile(path, name).catch((e: Error) => toast(e.message, "error"))}
      className="inline-flex max-w-full items-center gap-2 border px-4 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary"
    >
      <Download className="size-4 shrink-0" />
      <span className="truncate">{label ?? name}</span>
    </button>
  );
}

export function FileList({ files, prefix, onRemove }: { files: StoredFile[]; prefix?: string; onRemove?: (f: StoredFile) => void }) {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f) => (
        <span key={f.path} className="inline-flex max-w-full items-center gap-1">
          <FileDownload path={f.path} name={f.name} label={prefix ? `${prefix}${f.name}` : undefined} />
          {onRemove && (
            <button type="button" onClick={() => onRemove(f)} aria-label={`Remove ${f.name}`} className="grid size-9 shrink-0 place-items-center border transition hover:border-red-300 hover:text-red-600">
              <X className="size-4" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
