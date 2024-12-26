"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// List of images in the gallery.
const images = [
  "/concert0.jpg",
  "/concert1.jpg",
  "/concert2.jpg",
  "/concert3.jpg",
  "/concert4.jpg",
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
          <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
            This is a list of links to my most recent releases, available wherever you stream music!
          </p>
          <h3 className="text-2xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)] hover:underline ">
            <Link href="https://distrokid.com/hyperfollow/hans14/be-honest-2">
              be honest (2024)
            </Link>
          </h3>
          <h3 className="text-2xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)] hover:underline ">
            <Link href="https://distrokid.com/hyperfollow/hans14/wrongright-feat-jani">
              wrong?right! (2024)
            </Link>
          </h3>
          <h3 className="text-2xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)] hover:underline ">
            <Link href="https://distrokid.com/hyperfollow/hans14/againagain-feat-plxsko">
              again&again (2023)
            </Link>
          </h3>
          <h3 className="text-2xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)] hover:underline ">
            <Link href="https://distrokid.com/hyperfollow/hans14/in-medias-res">
              in medias res (2022)
            </Link>
          </h3>
        </div>
      </div>
    </div>
  );
}