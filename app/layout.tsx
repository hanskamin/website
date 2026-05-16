import type { Metadata } from "next";
import { Audiowide } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import clsx from "clsx";
import BgStack from "./ui/BgStack";
import Nav from "./ui/Nav";
import Footer from "./ui/Footer";

const audiowide = Audiowide({
  variable: "--font-audiowide",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// TX-02 (Berkeley Graphics) — self-hosted. No oblique cuts loaded:
// zero italics across the site is enforced by the global font-style rule
// in globals.css as well.
const tx02 = localFont({
  variable: "--font-tx02",
  display: "swap",
  src: [
    { path: "./fonts/TX-02-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/TX-02-Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "HANS.SYS — hanskamin.com",
  description:
    "Hans Kamin — musician, tennis player, software engineer. Broadcasting from New York.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="night"
      className={clsx(audiowide.variable, tx02.variable)}
    >
      <body className="antialiased">
        <BgStack />
        <div className="app-shell">
          <Nav />
          <main className="relative z-10 flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
