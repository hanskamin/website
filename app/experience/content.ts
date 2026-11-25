export type Release = {
  id: string;
  title: string;
  duration: number;
  year: number;
};

export const RELEASES: Release[] = [
  { id: "rUI_9sBqF0A", title: "be honest", duration: 175, year: 2025 },
  { id: "piqTQ05Y2D4", title: "ecstasy", duration: 157, year: 2025 },
  { id: "tAFd44lLvlw", title: "which one?", duration: 214, year: 2025 },
  { id: "uKDIPkeDfdw", title: "ten hot riyas (interlude)", duration: 102, year: 2025 },
  { id: "wkXxbZN7h0w", title: "your love (feat. chudi)", duration: 204, year: 2025 },
  { id: "XzgzMsvlPgQ", title: "fall, pt. 1", duration: 153, year: 2025 },
  { id: "s9Mludt5h1E", title: "fall, pt. 2", duration: 174, year: 2025 },
  { id: "P5J33jUvH50", title: "four in the morning", duration: 165, year: 2025 },
  { id: "mhJjE6NAqOI", title: "be honest", duration: 175, year: 2024 },
  { id: "2qLDs9z-ZZ8", title: "wrong?right! (feat. jani!)", duration: 252, year: 2024 },
  { id: "8HtK9Vs00Bk", title: "again & again (feat. Plxsko)", duration: 251, year: 2023 },
  { id: "HlEBc6z5vWY", title: "catharsis", duration: 237, year: 2022 },
  { id: "ktWTkrJkTv0", title: "delirium", duration: 195, year: 2022 },
  { id: "4vFp1wUGEd8", title: "lucidity", duration: 226, year: 2022 },
  { id: "tofxYahutzo", title: "alive", duration: 190, year: 2022 },
  { id: "8luFsd2kpPA", title: "catharsis remix (feat. Chudi)", duration: 237, year: 2022 },
  { id: "AXl2DcJ9C18", title: "on X (feat. Plxsko)", duration: 162, year: 2021 },
  { id: "YXAX2tRAXqs", title: "Catharsis", duration: 225, year: 2021 },
];

export type Role = {
  year: string;
  role: string;
  co: string;
  link: string;
  body: string;
};

export const TIMELINE: Role[] = [
  {
    year: "2025",
    role: "Fullstack Engineer",
    co: "Reflex",
    link: "https://reflex.careers",
    body: "Building the future of retail work -- unlocking flexibility for both workers and employers.",
  },
  {
    year: "2024",
    role: "Software Engineer",
    co: "Hitch",
    link: "https://hitch.com/book",
    body: "Built and shipped the latest redesign of the web app's booking system.",
  },
  {
    year: "2023",
    role: "Founding Engineer",
    co: "DPP Tech",
    link: "https://dpptech.com",
    body: "First hire on a pre-seed AI startup. Led product & engineering from scratch -- shipped MVP to a rapidly growing set of beta users in Miami, FL.",
  },
  {
    year: "2019–23",
    role: "Software Engineer",
    co: "Walmart",
    link: "https://www.linkedin.com/posts/hanskamin_teamwalmart-activity-6450815886025584640-rrat?utm_source=share&utm_medium=member_desktop&rcm=ACoAAB2ZIl0B5TfpjC2rjj96rQ7y2-u5h33Psqs",
    body: "Four years building in React + React Native on the frontend, plus heavy Node.js on the backend. Austin, TX.",
  },
  {
    year: "2015–19",
    role: "Computer Science",
    co: "Cal Poly SLO",
    link: "https://www.calpoly.edu/",
    body: "Learn-by-doing. San Luis Obispo, CA.",
  },
];

export const STACK: { tag: string; label: string }[] = [
  { tag: "FRONT", label: "React" },
  { tag: "FRONT", label: "React Native" },
  { tag: "FRONT", label: "Next.js" },
  { tag: "FRONT", label: "TypeScript" },
  { tag: "BACK", label: "Node.js" },
  { tag: "BACK", label: "Python" },
  { tag: "BACK", label: "Postgres" },
  { tag: "BACK", label: "Redis" },
  { tag: "INFRA", label: "AWS" },
  { tag: "INFRA", label: "Vercel" },
];

export const SOFTWARE_LINKS = [
  { href: "https://songtransposer.com", label: "songtransposer.com", tag: "SNG" },
  { href: "https://gotchagame.xyz", label: "gotchagame.xyz", tag: "GTC" },
  { href: "https://gutcheckgroceries.com", label: "gutcheckgroceries.com", tag: "GUT" },
  { href: "https://github.com/hanskamin", label: "github.com/hanskamin", tag: "GIT" },
  { href: "https://linkedin.com/in/hanskamin", label: "linkedin.com/in/hanskamin", tag: "LNK" },
  { href: "https://reflex.careers", label: "reflex.careers", tag: "WRK" },
];

export const CONTACT_LINKS = [
  { href: "https://linkedin.com/in/hanskamin", label: "LinkedIn" },
  { href: "https://github.com/hanskamin", label: "GitHub" },
  { href: "https://linktr.ee/hanzykamin", label: "Streaming" },
  { href: "mailto:hansjkamin@gmail.com", label: "E-mail" },
];

export const VOL_PHOTOS = [
  { src: "/static/images/mun1.jpeg", w: 2048, h: 1536 },
  { src: "/static/images/cona.jpeg", w: 3024, h: 1701 },
  { src: "/static/images/mun0.jpeg", w: 4898, h: 3265 },
  { src: "/static/images/cona-sunset.jpeg", w: 3024, h: 1701 },
];

export function fmtTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
