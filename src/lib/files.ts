import { supabase } from "@/lib/supabase";

const BUCKET = "course-files";
export const MAX_FILE_MB = 10;
export const FILE_ACCEPT = ".pdf,.doc,.docx,.csv,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg,.webp";

export type StoredFile = { path: string; name: string };

// Uploads under `folder` and returns the stored path + original name.
export async function uploadFile(folder: string, file: File): Promise<StoredFile> {
  if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`The file must be under ${MAX_FILE_MB} MB.`);
  const safe = file.name.replace(/[^\w.-]+/g, "_");
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error("Couldn't upload the file. Check the file type and try again.");
  return { path, name: file.name };
}

// Uploads several files; stops at the first failure.
export async function uploadFiles(folder: string, files: File[]): Promise<StoredFile[]> {
  const out: StoredFile[] = [];
  for (const f of files) out.push(await uploadFile(folder, f));
  return out;
}

// The non-empty files picked in a <input type="file" multiple name=...>.
export const pickedFiles = (form: FormData, name: string) => (form.getAll(name) as File[]).filter((f) => f && f.size);

export async function removeFiles(files: StoredFile[]) {
  if (files.length) await supabase.storage.from(BUCKET).remove(files.map((f) => f.path));
}

// Opens a short-lived signed link that downloads the file with its original name.
export async function downloadFile(path: string, name: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300, { download: name });
  if (error || !data) throw new Error("Couldn't download the file. Please try again.");
  window.location.href = data.signedUrl;
}
