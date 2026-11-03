import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "student";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  /** True until we know who (if anyone) is signed in. */
  loading: boolean;
  /** Message for the login page, e.g. after a disabled account is signed out. */
  notice: string;
  signOut: (notice?: string) => Promise<void>;
  /** The signed-in user's profile picture, if they uploaded one. */
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export const homeFor = (role: Role) => (role === "admin" ? "/admin" : "/portal");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const signOut = async (message = "") => {
    setNotice(message);
    await supabase.auth.signOut();
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load the profile whenever the signed-in user changes.
  const userId = session?.user.id;
  useEffect(() => {
    setProfile(null);
    setAvatarUrl(null);
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, full_name, email, role, is_active")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (!data) return void signOut("This account doesn't have portal access. Please contact Scaltiva.");
        if (!data.is_active) return void signOut("Your account has been disabled. Please contact Scaltiva.");
        setProfile(data);
        supabase
          .from("student_details")
          .select("avatar_url")
          .eq("user_id", userId)
          .maybeSingle()
          .then(({ data: details }) => !cancelled && setAvatarUrl(details?.avatar_url ?? null));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const loading = !ready || (!!session && !profile);

  return (
    <AuthContext.Provider value={{ session, profile, loading, notice, signOut, avatarUrl, setAvatarUrl }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
