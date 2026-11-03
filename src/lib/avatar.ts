import { supabase } from "@/lib/supabase";

const SIZE = 256;

// Center-crop to a square and shrink to 256px JPEG, so any phone photo uploads fast and stays small.
function toSquareJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = SIZE;
      canvas.getContext("2d")!.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("resize failed"))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not an image"));
    };
    img.src = url;
  });
}

/** Uploads a new profile picture and saves it on the profile. Returns the new URL. */
export async function uploadAvatar(userId: string, file: File) {
  const blob = await toSquareJpeg(file);
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
  // The ?v= makes browsers show the new photo instead of a cached old one.
  const url = `${supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  const { error: saveError } = await supabase.from("student_details").upsert({ user_id: userId, avatar_url: url }, { onConflict: "user_id" });
  if (saveError) throw saveError;
  return url;
}

export async function removeAvatar(userId: string) {
  await supabase.storage.from("avatars").remove([`${userId}/avatar.jpg`]);
  const { error } = await supabase.from("student_details").update({ avatar_url: null }).eq("user_id", userId);
  if (error) throw error;
}
