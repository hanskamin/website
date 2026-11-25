import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import clsx from "clsx";
import Experience from "./experience/Experience";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

// TX-02 (Berkeley Graphics) -- self-hosted. No oblique cuts loaded.
const tx02 = localFont({
  variable: "--font-tx02",
  display: "swap",
  src: [
    { path: "./fonts/TX-02-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/TX-02-Bold.otf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: { default: "Hans Kamin", template: "%s · Hans Kamin" },
  description:
    "Hans Kamin -- musician, tennis player, software engineer. Live from Centre Court.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c2a1f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx(display.variable, tx02.variable)}>
      <body>
        <Experience />
        {children}
      </body>
    </html>
  );
}
