import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col text-left px-8 py-4">
      <div>
        <h2 className="text-3xl mt-16 font-semibold pb-2 font-[family-name:var(--font-geist-mono)]">
          Software
        </h2>
        <p className="text-lg mt-8 pb-8 font-[family-name:var(--font-geist-mono)]">
          {
            `I'm a fullstack software engineer strongly versed in a wide variety of languages & frameworks.
            Presently, I'm a contract software engineer at Hitch, building out a redesign of their web app's booking system.`
          }
        </p>
        <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
          {
            `I studied computer science at Cal Poly SLO from 2015 to 2019. From there, I began my career as an entry-level software
            engineer at Walmart. In my four years at Walmart, I spent most of my time building in React and React Native, but wrote
            a ton of Node on the backend as well.`
          }
        </p>
        <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
          {
            `After my time with Walmart came to a close, I joined DPP Tech to work as the first engineering hire at a pre-seed
            AI startup they were incubating. I led all product and engineering development from scratch, sculpting & shipping the MVP
            to a rapidly growing set of beta users in Miami, FL.`
          }
        </p>
        <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
          {`If you'd like to connect, you can reach me through my `}
          <Link href={"https://linkedin.com/in/hanskamin"} className="underline text-blue-500">{`LinkedIn`}</Link>
          {` and check out some past projects on my `}
          <Link href={"https://github.com/hanskamin"} className="underline text-blue-500">{`GitHub`}</Link>{`.`}
        </p>
        {/* Projects list */}
      </div>
    </div>
  );
}