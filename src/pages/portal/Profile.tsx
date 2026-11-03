import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Camera, GraduationCap, Loader2, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { DETAILS_SELECT, GENDERS, HEARD_FROM, QUALIFICATIONS, type StudentDetails } from "@/lib/studentDetails";
import { input, label, primaryButton, secondaryButton } from "@/components/portal/form";
import Notice, { type Message } from "@/components/portal/Notice";
import { useToast } from "@/components/portal/Toast";
import Avatar from "@/components/portal/Avatar";
import AvatarCropper from "@/components/portal/AvatarCropper";
import { removeAvatar, uploadAvatar } from "@/lib/avatar";

const EMPTY: StudentDetails = {
  gender: null,
  date_of_birth: null,
  cnic: null,
  country: "Pakistan",
  city: null,
  address: null,
  mobile: null,
  qualification: null,
  specialization: null,
  heard_from: [],
  knows_freelancing: null,
};

const required = <span className="text-primary" aria-hidden> *</span>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="overflow-hidden border">
      <legend className="sr-only">{title}</legend>
      <p className="bg-muted px-5 py-2.5 text-sm font-semibold" aria-hidden>{title}</p>
      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function Profile() {
  const { profile, avatarUrl, setAvatarUrl } = useAuth();
  const toast = useToast();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [cropping, setCropping] = useState<File | null>(null);
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("student_details")
      .select(DETAILS_SELECT)
      .eq("user_id", profile.id)
      .maybeSingle()
      .then(({ data }) => setDetails((data as StudentDetails | null) ?? EMPTY));
  }, [profile]);

  // Choosing a file opens the cropper; uploading happens when they save it.
  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) return toast("Please choose a photo under 15 MB.", "error");
    setCropping(file);
  }

  async function savePhoto(image: Blob) {
    if (!profile) return;
    try {
      setAvatarUrl(await uploadAvatar(profile.id, image));
      setCropping(null);
      toast("Profile photo updated.");
    } catch {
      toast("Couldn't upload the photo. Please try again.", "error");
    }
  }

  async function onRemovePhoto() {
    if (!profile || !window.confirm("Remove your profile photo?")) return;
    setPhotoBusy(true);
    try {
      await removeAvatar(profile.id);
      setAvatarUrl(null);
      toast("Profile photo removed.");
    } catch {
      toast("Couldn't remove the photo. Please try again.", "error");
    }
    setPhotoBusy(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const form = new FormData(e.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim() || null;
    const cnic = text("cnic")?.replace(/\D/g, "") || null;
    const mobile = text("mobile")?.replace(/[\s-]/g, "") || null;
    const freelancing = form.get("knows_freelancing");

    if (cnic && cnic.length !== 13) return setMessage({ type: "error", text: "CNIC / B-form must be 13 digits, e.g. 35202-1234567-1." });
    if (!mobile || !/^\+?\d{10,15}$/.test(mobile)) return setMessage({ type: "error", text: "Please enter a valid mobile number, e.g. 03001234567." });

    const values = {
      user_id: profile.id,
      gender: text("gender"),
      date_of_birth: text("date_of_birth"),
      cnic,
      country: text("country"),
      city: text("city"),
      address: text("address"),
      mobile,
      qualification: text("qualification"),
      specialization: text("specialization"),
      heard_from: form.getAll("heard_from").map(String),
      knows_freelancing: freelancing === null ? null : freelancing === "yes",
    };

    setMessage(null);
    setSaving(true);
    const { error } = await supabase.from("student_details").upsert(values, { onConflict: "user_id" });
    setSaving(false);
    if (error) return setMessage({ type: "error", text: "Couldn't save your profile. Please check the fields and try again." });
    setDetails(values as StudentDetails);
    toast("Profile saved.");
  }

  if (!details) {
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const education = [details.qualification, details.specialization].filter(Boolean).join(" · ");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <title>My profile | Scaltiva Student Portal</title>
      {cropping && <AvatarCropper file={cropping} onCancel={() => setCropping(null)} onSave={savePhoto} />}
      <h1 className="text-2xl font-semibold">My Profile</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="h-fit bg-background p-6 shadow-sm">
          <div className="text-center">
            <Avatar url={avatarUrl} name={profile?.full_name ?? ""} className="mx-auto size-28 border-4 border-accent text-3xl" />
            <div className="mt-3 flex justify-center gap-2">
              <label className={`${secondaryButton} cursor-pointer px-4 py-2 text-xs ${photoBusy ? "pointer-events-none opacity-60" : ""}`}>
                {photoBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                {avatarUrl ? "Change photo" : "Add photo"}
                <input type="file" accept="image/*,.heic,.heif" className="sr-only" onChange={onPhoto} disabled={photoBusy} />
              </label>
              {avatarUrl && (
                <button type="button" onClick={onRemovePhoto} disabled={photoBusy} aria-label="Remove photo" className={`${secondaryButton} px-3 py-2 text-xs hover:border-red-300 hover:text-red-600`}>
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            <p className="mt-3 text-lg font-semibold">{profile?.full_name}</p>
          </div>
          <dl className="mt-6 space-y-4 border-t pt-5 text-sm">
            <div>
              <dt className="flex items-center gap-2 font-semibold"><GraduationCap className="size-4 text-primary" />Education</dt>
              <dd className="mt-1 text-muted-foreground">{education || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold"><Mail className="size-4 text-primary" />Email</dt>
              <dd className="mt-1 break-all text-muted-foreground">{profile?.email}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold"><Phone className="size-4 text-primary" />Mobile</dt>
              <dd className="mt-1 text-muted-foreground">{details.mobile || "Not added yet"}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-semibold"><MapPin className="size-4 text-primary" />City</dt>
              <dd className="mt-1 text-muted-foreground">{[details.city, details.country].filter(Boolean).join(", ") || "Not added yet"}</dd>
            </div>
          </dl>
        </aside>

        <form onSubmit={onSubmit} className="space-y-5 bg-background p-4 shadow-sm sm:p-6">
          <p className="text-sm text-muted-foreground">Fields marked with {required} are required.</p>

          <Section title="Personal Information">
            <div className="sm:col-span-2">
              <p className={label}>Full name</p>
              <p className="mt-2 rounded-full bg-muted px-5 py-3.5">{profile?.full_name}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">To change your name, contact Scaltiva.</p>
            </div>

            <div className="sm:col-span-2">
              <p className={label}>Gender{required}</p>
              <div className="mt-2 flex flex-wrap gap-5">
                {GENDERS.map((g) => (
                  <label key={g.value} className="flex items-center gap-2 text-sm">
                    <input type="radio" name="gender" value={g.value} required defaultChecked={details.gender === g.value} className="size-4 accent-[var(--primary)]" />
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="date_of_birth" className={label}>Date of birth{required}</label>
              <input id="date_of_birth" name="date_of_birth" type="date" required max={today} min="1940-01-01" defaultValue={details.date_of_birth ?? ""} className={input} />
            </div>
            <div>
              <label htmlFor="cnic" className={label}>CNIC / B-form</label>
              <input id="cnic" name="cnic" inputMode="numeric" placeholder="35202-1234567-1" maxLength={15} defaultValue={details.cnic ?? ""} className={input} />
            </div>

            <div>
              <label htmlFor="country" className={label}>Country{required}</label>
              <input id="country" name="country" required maxLength={60} autoComplete="country-name" defaultValue={details.country ?? ""} className={input} />
            </div>
            <div>
              <label htmlFor="city" className={label}>City{required}</label>
              <input id="city" name="city" required maxLength={60} autoComplete="address-level2" defaultValue={details.city ?? ""} className={input} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className={label}>Mailing address</label>
              <textarea id="address" name="address" rows={2} maxLength={300} autoComplete="street-address" defaultValue={details.address ?? ""} className={`${input} resize-y `} />
            </div>

            <div>
              <label htmlFor="mobile" className={label}>Mobile{required}</label>
              <input id="mobile" name="mobile" type="tel" required placeholder="03001234567" maxLength={16} autoComplete="tel" defaultValue={details.mobile ?? ""} className={input} />
            </div>
          </Section>

          <Section title="Qualification">
            <div>
              <label htmlFor="qualification" className={label}>Highest qualification{required}</label>
              <select id="qualification" name="qualification" required defaultValue={details.qualification ?? ""} className={input}>
                <option value="" disabled>Select...</option>
                {QUALIFICATIONS.map((q) => <option key={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="specialization" className={label}>Field of study</label>
              <input id="specialization" name="specialization" maxLength={100} placeholder="e.g. Computer Science" defaultValue={details.specialization ?? ""} className={input} />
            </div>
          </Section>

          <Section title="Interests">
            <div className="sm:col-span-2">
              <p className={label}>Where did you hear about us?</p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {HEARD_FROM.map((h) => (
                  <label key={h} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="heard_from" value={h} defaultChecked={details.heard_from.includes(h)} className="size-4 accent-[var(--primary)]" />
                    {h}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className={label}>Are you familiar with freelancing?</p>
              <div className="mt-2 flex gap-5">
                {["yes", "no"].map((v) => (
                  <label key={v} className="flex items-center gap-2 text-sm capitalize">
                    <input
                      type="radio"
                      name="knows_freelancing"
                      value={v}
                      defaultChecked={details.knows_freelancing !== null && details.knows_freelancing === (v === "yes")}
                      className="size-4 accent-[var(--primary)]"
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <Notice message={message} />

          <button type="submit" disabled={saving} className={`${primaryButton} w-full`}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
