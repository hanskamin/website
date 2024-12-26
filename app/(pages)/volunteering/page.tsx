"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const images = [
  "/static/images/mun1.jpg",
  "/static/images/cona.jpeg",
  "/static/images/mun0.jpg",
  "/static/images/cona-sunset.jpeg",
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
      <div className="relative w-full h-[650px]">
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
            Volunteering
          </h2>
          <p className="text-lg mt-8 pb-8 font-[family-name:var(--font-geist-mono)]">
            {
              `When I was in high school, my experiences competing in the YMCA Model United Nations debate program
              in Hershey, PA were the most formative growth opportunities I had the privilege of participating in.
              Since 2018, I've been fortunate enough to serve alongside other program alumni as a volunteer leadership
              staff member, mentoring high schoolers as they navigate the myriad challenges that come with organizing,
              executing, and competing in a debate competition with peers from all over the tri-state area.`
            }
          </p>
          <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
            {
              `Furthermore, I have the distinct honor of serving as a national trip director for the program's most impressive
              participants. Each summer, I chaperone our 25 best & brightest students on a trip to the national
              competition in Blue Ridge, NC. Our students spend an entire week meeting,
              befriending, and debating others from a wide variety of upbringings, backgrounds, and ways of life that are
              completely different from their own. At a time when the American political system feels more vitriolic than ever,
              I believe it's never been more important for young people to learn how to empathize & engage with belief systems
              that challenge their own, and I find immense joy in facilitating that opportunity every year.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
