import axios from "axios";
import { supabase } from "@/lib/supabase";

// Calls an admin function in /api with the signed-in user's token, so the
// server can check they are an admin. Throws an Error with a readable message.
export async function adminApi<T = unknown>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  try {
    const res = await axios.post(`/api/${name}`, body, {
      headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    });
    return res.data as T;
  } catch (err) {
    const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
    throw new Error(message ?? "Something went wrong. Please try again.");
  }
}
