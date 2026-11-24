import Image from "next/image";
import Link from "next/link";
import profile from "@/public/static/images/profile.jpeg";
import { CONTACT_LINKS, RELEASES } from "../content";

const CHANNELS = [
  { href: "/music", no: "01", name: "Music", sub: `${RELEASES.length} releases` },
  { href: "/software", no: "02", name: "Software", sub: "Current work" },
  { href: "/volunteering", no: "03", name: "Volunteering", sub: "Youth empowerment" },
  { href: "/play", no: "04", name: "Play match", sub: "One game v. Borg" },
];

export default function HomeHud() {
  return (
    <div className="home">
      <section className="lower-third">
        <div className="lt-portrait">
          <Image src={profile} alt="Hans Kamin" placeholder="blur" sizes="120px" priority />
        </div>
        <div className="lt-text">
          <p className="kicker">Musician · Tennis player · Software engineer</p>
          <h1 className="lt-name">Hans Kamin</h1>
          <p className="lt-trail">
            <span className="trail-full">
              New Jersey → San Luis Obispo → Miami → New York City → Austin
            </span>
            <span className="trail-short">NJ → SLO → MIA → NYC → ATX</span>
          </p>
          <nav className="lt-links" aria-label="Contact">
            {CONTACT_LINKS.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <nav className="channels" aria-label="Sections">
        {CHANNELS.map((c) => (
          <Link key={c.href} href={c.href} className="channel">
            <span className="ch-no">{c.no}</span>
            <span className="ch-name">{c.name}</span>
            <span className="ch-sub">{c.sub}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
