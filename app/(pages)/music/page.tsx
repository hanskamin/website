import type { Release } from "@/app/data/types";
import Image from "next/image";
import Container from "@/app/ui/Container";
import Section from "@/app/ui/Section";
import Hero from "@/app/ui/Hero";
import Reveal from "@/app/ui/Reveal";
import concertHero from "@/public/static/images/concert0.jpeg";

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
  return (
    <>
      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden">
        <Image
          src={concertHero}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/40 via-transparent to-midnight" />
      </div>

      <Hero
        eyebrow="Music"
        title="Releases"
        subtitle="A handful of songs I've put into the world. Streaming wherever you listen."
      />

      <Section className="!pt-0">
        <Container>
          <ul className="flex flex-col">
            {releases.map((release, idx) => (
              <li key={release.title}>
                <Reveal delay={idx * 0.05}>
                  <a
                    href={release.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline justify-between gap-elem py-6 border-b border-white/10 hover:border-frost transition-colors duration-300"
                  >
                    <span className="font-display text-h-sm md:text-h text-frost group-hover:text-gradient-ocean transition-colors break-words">
                      {release.title}
                    </span>
                    <span className="text-caption uppercase tracking-[0.2em] text-whisper shrink-0">
                      {release.year}
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
