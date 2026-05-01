import Container from "@/app/ui/Container";
import Section from "@/app/ui/Section";
import Hero from "@/app/ui/Hero";
import Reveal from "@/app/ui/Reveal";
import Button from "@/app/ui/Button";

const roles = [
  {
    company: "Reflex",
    href: "https://reflex.careers",
    period: "2025 — present",
    role: "Software Engineer",
    summary:
      "Building the future of retail work — flexibility for workers and employers alike.",
  },
  {
    company: "Hitch",
    href: "https://hitch.com",
    period: "2024 — 2025",
    role: "Software Engineer",
    summary:
      "Shipped the latest redesign of the web app's booking system end-to-end.",
  },
  {
    company: "DPP Tech",
    href: "https://dpptech.com",
    period: "2023 — 2024",
    role: "Founding Engineer",
    summary:
      "First hire at a pre-seed AI startup. Led product + engineering, shipped the MVP to beta users in Miami.",
  },
  {
    company: "Walmart",
    href: "https://walmart.com",
    period: "2019 — 2023",
    role: "Software Engineer",
    summary:
      "Four years across React, React Native, and Node. Shipped retail tooling at massive scale.",
  },
];

const linkClass =
  "text-frost underline underline-offset-4 decoration-misty hover:decoration-frost transition-colors";

export default function Page() {
  return (
    <>
      <Hero
        eyebrow="Software"
        title="Engineer"
        subtitle="Fullstack — React, React Native, Node, Python."
      />

      <Section className="!pt-0">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-elem max-w-[68ch] text-sub text-whisper">
              <p>
                I&rsquo;m a fullstack software engineer well-versed in many
                languages and frameworks, most notably React, React Native,
                Node, and Python. Presently I&rsquo;m an engineer at{" "}
                <a
                  href="https://reflex.careers"
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  Reflex
                </a>
                , building the future of retail work to unlock flexibility for
                both workers and employers.
              </p>
              <p>
                I studied computer science at Cal Poly SLO from 2015 to 2019.
                From there I began my career at Walmart in Austin, TX, then
                joined{" "}
                <a
                  href="https://dpptech.com"
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  DPP Tech
                </a>{" "}
                as the first hire at a pre-seed AI startup, sculpting and
                shipping the MVP to a rapidly growing set of beta users. After
                that, I joined{" "}
                <a
                  href="https://hitch.com"
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  Hitch
                </a>{" "}
                to ship the latest redesign of their{" "}
                <a
                  href="https://hitch.com/book"
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  booking system
                </a>
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <h2 className="font-display text-h-sm md:text-h text-frost mb-8">
              Where I&rsquo;ve worked
            </h2>
          </Reveal>
          <ul className="flex flex-col">
            {roles.map((role, idx) => (
              <li key={role.company}>
                <Reveal delay={idx * 0.05}>
                  <a
                    href={role.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-elem py-6 border-b border-white/10 hover:border-frost transition-colors duration-300"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-h-sm text-frost group-hover:text-gradient-ocean transition-colors">
                        {role.company}
                      </span>
                      <span className="text-caption uppercase tracking-[0.2em] text-whisper">
                        {role.role}
                      </span>
                    </div>
                    <div className="flex flex-col md:items-end md:text-right gap-1 md:max-w-[40ch]">
                      <span className="text-caption uppercase tracking-[0.2em] text-whisper">
                        {role.period}
                      </span>
                      <span className="text-body text-whisper">
                        {role.summary}
                      </span>
                    </div>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col gap-elem">
              <span className="text-caption uppercase tracking-[0.2em] text-whisper">
                Connect
              </span>
              <div className="flex flex-col sm:flex-row gap-elem">
                <Button
                  href="https://linkedin.com/in/hanskamin"
                  external
                  variant="ghost"
                  fullWidth
                >
                  LinkedIn
                </Button>
                <Button
                  href="https://github.com/hanskamin"
                  external
                  variant="ghost"
                  fullWidth
                >
                  GitHub
                </Button>
              </div>
              <span className="text-caption uppercase tracking-[0.2em] text-whisper pt-elem">
                Cal Poly SLO &middot; 2015 — 2019
              </span>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
