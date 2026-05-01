import type { Metadata } from "next";
import { Inter, Raleway } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import GradientBackground from "./ui/GradientBackground";
import Nav from "./ui/Nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hans Kamin",
  description: "Musician, tennis player, developer based in New York.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          inter.variable,
          raleway.variable,
          "font-sans bg-midnight text-frost min-h-screen antialiased",
        )}
      >
        <GradientBackground />
        <Nav />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
