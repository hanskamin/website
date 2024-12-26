"use client";

import { Release } from "@/app/data/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const images = [
  "/static/images/concert0.jpg",
  "/static/images/concert1.jpg",
  "/static/images/concert2.jpg",
  "/static/images/concert3.jpg",
  "/static/images/concert4.jpg",
];

const releases: Release[] = [
  {
    title: "be honest",
    year: 2024,
    link: "https://distrokid.com/hyperfollow/hans14/be-honest-2",
  },
  {
    title: "wrong?right!",
    year: 2024,
    link: "https://distrokid.com/hyperfollow/hans14/wrongright-feat-jani",
  },
  {
    title: "again&again",
    year: 2023,
    link: "https://distrokid.com/hyperfollow/hans14/againagain-feat-plxsko",
  },
  {
    title: "in medias res",
    year: 2022,
    link: "https://distrokid.com/hyperfollow/hans14/in-medias-res",
  },
];

export default function Page() {
  // State to track the current image index.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically cycle through images every 4 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // 4 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount.
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-mono)] overflow-x-hidden">
      {/* Gallery */}
      <div className="relative w-full h-[500px]">
        {images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`Slide ${index + 1}`}
            layout="fill"
            objectFit="cover"
            priority
            className={`absolute transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      {/* Main Content */}
      <div className="flex flex-col text-left px-8 py-4">
        <div>
          <h2 className="text-3xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)]">
            Music
          </h2>
          <p className="text-lg mt-8 pb-8 font-[family-name:var(--font-geist-mono)]">
            This is a list of links to my most recent releases, available wherever you stream music!
          </p>
          {
            releases.map((release: Release, idx: number) => (
              <h3 
                key={`release-${idx}`}
                className="text-2xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)] hover:underline"
              >
                <Link href={release.link}>
                  {`${release.title} (${release.year})`}
                </Link>
              </h3>
            ))
          }
        </div>
      </div>
    </div>
  );
}