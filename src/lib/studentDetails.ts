// Fields and choices for the student profile, shared by the student form and the admin view.

export type StudentDetails = {
  gender: "male" | "female" | "other" | null;
  date_of_birth: string | null;
  cnic: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  mobile: string | null;
  qualification: string | null;
  specialization: string | null;
  heard_from: string[];
  knows_freelancing: boolean | null;
  avatar_url?: string | null;
  updated_at?: string;
};

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

export const QUALIFICATIONS = ["Matric / O Levels", "Intermediate / A Levels", "Bachelor's", "Master's", "MPhil / PhD", "Other"];

export const HEARD_FROM = [
  "Facebook",
  "Instagram",
  "YouTube",
  "LinkedIn",
  "TikTok",
  "Google search",
  "Friend / family",
  "University / college",
  "Scaltiva website",
  "Other",
];

export const DETAILS_SELECT =
  "gender, date_of_birth, cnic, country, city, address, mobile, qualification, specialization, heard_from, knows_freelancing, avatar_url, updated_at";

/** 3520212345671 → 35202-1234567-1 */
export const formatCnic = (cnic: string) => cnic.replace(/^(\d{5})(\d{7})(\d)$/, "$1-$2-$3");
