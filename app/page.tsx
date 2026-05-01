import Image from "next/image";
import Button from "./ui/Button";
import Container from "./ui/Container";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import profile from "@/public/static/images/profile.jpeg";

export default function Home() {
  return (
    <>
      <section className="min-h-[80vh] flex items-center py-16 md:py-24">
        <Container className="flex flex-col gap-elem">
          <Reveal className="flex items-center gap-elem">
            <Image
              src={profile}
              alt=""
              width={64}
              height={64}
              priority
              className="rounded-full w-12 h-12 md:w-16 md:h-16 object-cover ring-1 ring-white/20"
            />
            <span className="text-caption uppercase tracking-[0.2em] text-whisper">
              New York, NY
            </span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1
              className="font-display text-frost leading-[0.85] break-words text-gradient-ocean"
              style={{ fontSize: "clamp(72px, 18vw, 225px)" }}
            >
              Hans
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sub md:text-h-sm text-whisper max-w-[40ch] leading-[1.3]">
              Musician. Tennis player. Developer.
            </p>
          </Reveal>

          <Reveal delay={0.2} className="pt-elem">
            <div className="flex flex-col sm:flex-row gap-elem">
              <Button href="/music" variant="ghost" fullWidth>
                Music
              </Button>
              <Button href="/software" variant="ghost" fullWidth>
                Software
              </Button>
              <Button href="/volunteering" variant="ghost" fullWidth>
                Volunteering
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col gap-elem border-t border-white/10 pt-10">
              <span className="text-caption uppercase tracking-[0.2em] text-whisper">
                Currently
              </span>
              <p className="text-sub text-frost">
                Software engineer at{" "}
                <a
                  href="https://reflex.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 decoration-misty hover:decoration-frost transition-colors"
                >
                  Reflex
                </a>
                . Writing music between sets. Building things at the edges.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
