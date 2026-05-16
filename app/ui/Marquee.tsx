type Props = { items: string[] };

export default function Marquee({ items }: Props) {
  const text = items.join("   ◆   ");
  return (
    <div className="marquee-bar" aria-hidden="true">
      <span className="marquee-track">
        {text}   ◆   {text}   ◆   {" "}
      </span>
      <span className="marquee-track">
        {text}   ◆   {text}   ◆   {" "}
      </span>
    </div>
  );
}
