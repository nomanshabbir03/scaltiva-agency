import { supabase } from "@/lib/supabase";

/** Uploads an already-cropped profile picture (see AvatarCropper) and saves it on the profile. Returns the new URL. */
export async function uploadAvatar(userId: string, image: Blob) {
  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, image, { upsert: true, contentType: "image/jpeg" });
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
