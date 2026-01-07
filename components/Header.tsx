import Link from "./Link";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <Link
        className="inline-block text-2xl font-black"
        href="/"
      >
        <span
          style={{
            "--myColor1": "var(--text)",
            "--myColor2": "var(--text)",
            backgroundImage:
              "linear-gradient(45deg, var(--myColor1), var(--myColor2))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          } as React.CSSProperties}
        >
          overreacted
        </span>
      </Link>
      <span className="relative top-[4px] italic">
        by{" "}
        <a
          target="_blank"
          href="https://danabra.mov"
          rel="noopener noreferrer"
        >
          Dan Abramov
        </a>
      </span>
    </header>
  );
}
