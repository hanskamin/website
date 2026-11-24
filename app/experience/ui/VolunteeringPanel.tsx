"use client";

import Image from "next/image";
import { VOL_PHOTOS } from "../content";

export default function VolunteeringPanel({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <>
      <p className="lede">
        Mentoring high schoolers through the YMCA Model United Nations program.
      </p>

      <section aria-label="Photographs">
        <div className="photo">
          {VOL_PHOTOS.map((p, i) => (
            <Image
              key={p.src}
              src={p.src}
              alt=""
              width={p.w}
              height={p.h}
              sizes="(min-width: 860px) 520px, 100vw"
              className={i === index ? "is-on" : undefined}
              priority={i === 0}
            />
          ))}
          <span className="photo-count">
            Frame {String(index + 1).padStart(2, "0")} / {String(VOL_PHOTOS.length).padStart(2, "0")}
          </span>
        </div>
        <div className="photo-dots">
          {VOL_PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Photograph ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      </section>

      <section aria-label="The program">
        <h2 className="section-title">The program</h2>
        <p className="prose">
          When I was in high school, competing in the YMCA Model United Nations debate
          program in Hershey, PA was the most formative growth opportunity I had the
          privilege of experiencing. Since 2018, I&rsquo;ve been fortunate enough to
          volunteer alongside other program alumni as a leadership staff member, mentoring
          high schoolers as they navigate the myriad challenges associated with organizing,
          executing, and competing in a debate competition with peers from all over the
          tri-state area.
        </p>
      </section>

      <section aria-label="Trip director">
        <h2 className="section-title">Trip director</h2>
        <p className="prose">
          I have the distinct honor of serving as a national trip director for the
          program&rsquo;s most impressive participants. Each summer, I chaperone our 25
          best & brightest students to the{" "}
          <a href="https://ymcacona.org" target="_blank" rel="noopener noreferrer">
            Conference on National Affairs
          </a>{" "}
          in Blue Ridge, NC.
        </p>
        <p className="prose prose-dim">
          Our students spend an entire week meeting, befriending, and debating high
          schoolers from a wide variety of upbringings, backgrounds, and ways of life that
          are completely different from their own. American politics are as vitriolic as
          ever -- I believe it&rsquo;s never been more important for young people to learn
          how to empathize & engage with belief systems that challenge their own, and I
          find immense joy in facilitating that opportunity for them every year.
        </p>
      </section>
    </>
  );
}
