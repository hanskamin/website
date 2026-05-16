export default function GradientBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-midnight md:animate-hue"
    >
      <div
        className="absolute -top-[40vw] -left-[30vw] h-[120vw] w-[120vw] rounded-full bg-deep-ocean opacity-55 mix-blend-screen animate-drift"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute top-[10vw] -right-[35vw] h-[120vw] w-[120vw] rounded-full bg-deep-ocean opacity-40 mix-blend-screen animate-drift-slow"
        style={{ filter: "blur(80px)", animationDelay: "-6s" }}
      />
      <div
        className="hidden md:block absolute -bottom-[40vw] left-[10vw] h-[110vw] w-[110vw] rounded-full bg-deep-ocean opacity-30 mix-blend-screen animate-drift-slower"
        style={{ filter: "blur(80px)", animationDelay: "-12s" }}
      />
      <div className="absolute inset-0 bg-midnight/55" />
    </div>
  );
}
