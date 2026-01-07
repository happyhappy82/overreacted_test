import Link from "./Link";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <Link
        className="inline-block text-2xl font-black"
        href="/"
      >
        overreacted
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
