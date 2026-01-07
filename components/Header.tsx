import Link from "./Link";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <Link
        className="inline-block text-2xl font-black scale-100 active:scale-100"
        style={{
          opacity: 1,
          transition: "transform 0.2s ease-in-out, opacity 0.2s 0.4s linear",
        }}
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
            transition: "--myColor1 0.2s ease-out, --myColor2 0.2s ease-in-out",
          } as React.CSSProperties}
        >
          overreacted
        </span>
      </Link>
      <span className="relative top-[4px] italic">
        by{" "}
        <a
          target="_blank"
          className="scale-100 active:scale-100"
          style={{
            opacity: 1,
            transition: "transform 0.2s ease-in-out, opacity 0.2s 0.4s linear",
          }}
          href="https://danabra.mov"
          rel="noopener noreferrer"
        >
          Dan Abramov
        </a>
      </span>
    </header>
  );
}
