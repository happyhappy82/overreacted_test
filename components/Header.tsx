import Link from "./Link";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <Link
        className="inline-block text-2xl font-black"
        href="/"
      >
        에이정
      </Link>
    </header>
  );
}
