import { Download } from "lucide-react";
import { downloadFile } from "@/lib/files";
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
