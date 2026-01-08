import Link from "./Link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <Link
        className="inline-block"
        href="/"
      >
        <Image
          src="/logo.png"
          alt="에이정"
          width={200}
          height={50}
          priority
          className="h-auto w-[180px]"
        />
      </Link>
    </header>
  );
}
