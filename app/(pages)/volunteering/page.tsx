import Image from "next/image";
import Container from "@/app/ui/Container";
import Section from "@/app/ui/Section";
import Hero from "@/app/ui/Hero";
import Reveal from "@/app/ui/Reveal";
import mun1 from "@/public/static/images/mun1.jpeg";
import cona from "@/public/static/images/cona.jpeg";
import mun0 from "@/public/static/images/mun0.jpeg";
import conaSunset from "@/public/static/images/cona-sunset.jpeg";

export default function Page() {
  return (
    <>
      <Section className="!pt-10 md:!pt-16">
        <Container>
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-elem">
              <div className="md:col-span-2 relative aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-card">
                <Image
                  src={mun1}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[300px] overflow-hidden rounded-card">
                <Image
                  src={conaSunset}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Hero
        eyebrow="Volunteering"
        title="YMCA Model UN"
        subtitle="Mentor & national trip director, Conference on National Affairs."
        className="!min-h-0 !py-0"
      />

      <Section>
        <Container>
          <Reveal>
            <div className="flex flex-col gap-elem max-w-[68ch] text-sub text-whisper">
              <p>
                When I was in high school, my time competing in the YMCA Model
                United Nations debate program in Hershey, PA was the most
                formative growth opportunity I had the privilege of
                experiencing. Since 2018 I&rsquo;ve volunteered alongside other
                program alumni as a leadership staff member, mentoring high
                schoolers as they navigate the myriad challenges that come with
                organizing, executing, and competing in a debate competition
                with peers from all over the tri-state area.
              </p>
              <p>
                I also serve as a national trip director for the program&rsquo;s
                most impressive participants. Each summer I chaperone our 25
                best and brightest students to the Conference on National
                Affairs in Blue Ridge, NC. Our students spend a full week
                meeting, befriending, and debating high schoolers from a wide
                variety of upbringings, backgrounds, and ways of life
                completely different from their own. American politics are as
                vitriolic as ever &mdash; I believe it&rsquo;s never been more
                important for young people to learn how to empathize and engage
                with belief systems that challenge their own, and I find
                immense joy in facilitating that opportunity for them every
                year.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-elem">
            {[cona, mun0, conaSunset].map((img, idx) => (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-card group">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
