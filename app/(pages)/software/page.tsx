import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col text-left px-8 py-4">
      <div>
        <h2 className="text-3xl mt-16 font-semibold pb-2 font-[family-name:var(--font-geist-mono)]">
          Software
        </h2>
        <p className="text-lg mt-8 pb-8 font-[family-name:var(--font-geist-mono)]">
          {`I'm a fullstack software engineer well-versed in many languages & frameworks, 
            most notably React, React Native, Node, and Python. Presently, I'm an engineer at `}
            <Link href={"https://reflex.careers"} className="underline text-blue-500">{`Reflex`}</Link>
            {`, building the future of retail work to unlock flexibility for both workers & employers.`}
        </p>
        <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
          {
            `I studied computer science at Cal Poly SLO from 2015 to 2019. From there, I began my career as an
            engineer at Walmart in Austin, TX. In my four years at Walmart, I spent most of my time building in
            React and React Native, but also wrote a ton of Node on the backend.`
          }
        </p>
        <p className="text-lg pb-8 font-[family-name:var(--font-geist-mono)]">
          {
            `After my time with Walmart came to a close, I joined `}
            <Link href={"https://dpptech.com"} className="underline text-blue-500">{`DPP Tech`}</Link>
            {` to work as the first hire at a pre-seed AI startup they were incubating. I led all product and engineering
            development from scratch, sculpting & shipping the MVP to a rapidly growing set of beta users in Miami, FL.`}
            {` From there, I went on to join `}
            <Link href={"https://hitch.com"} className="underline text-blue-500">{`Hitch`}</Link>
            {` to build & ship the latest redesign of their web app's `}
            <Link href={"https://hitch.com/book"} className="underline text-blue-500">{`booking system`}</Link>
            {`.`}
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