"use client";

import Image from "next/image";
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
  }, [images.length]);

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-mono)]">
      {/* Gallery */}
      <div className="relative w-full h-[500px] overflow-hidden">
        {images.map((image, index) => (
          <Image
            key={image}
            src={image}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            layout="fill"
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col text-left ml-4 py-4">
        {/* Text */}
        <div>
          {/* Name */}
          <h2 className="text-3xl font-semibold pb-2 font-[family-name:var(--font-geist-mono)]">
            Music
          </h2>
          {/* Description */}
          <p className="text-lg pb-2 font-[family-name:var(--font-geist-mono)]">
            I'm a musician, blah blah blah.
          </p>
        </div>
      </div>
    </div>
  );
}