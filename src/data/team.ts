export type TeamMember = {
  name: string;
  role: string;
  /**
   * Path to the photo, e.g. "/team/ali-khan.jpg". Put the image file in
   * client/public/team/. Leave it out to show a placeholder icon instead.
   */
  photo?: string;
};

// Placeholder team: replace names and roles, and add a photo for each person.
export const TEAM: TeamMember[] = [
  { name: "Team Member 01", role: "Founder & CEO" },
  { name: "Team Member 02", role: "Head of Development" },
  { name: "Team Member 03", role: "SEO Lead" },
  { name: "Team Member 04", role: "Marketing Lead" },
];
