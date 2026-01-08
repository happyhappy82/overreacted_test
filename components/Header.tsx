import Link from "./Link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="mb-14 flex flex-row place-content-between">
      <div className="flex items-center gap-3">
        <a
          href="https://aijeong.com"
          className="inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo.png"
            alt="에이정"
            width={200}
            height={50}
            priority
            className="h-auto w-[140px]"
          />
        </a>
        <span className="text-gray-400 text-2xl">|</span>
        <a
          href="https://blog.aijeong.com"
          className="text-2xl font-semibold hover:opacity-70 transition-opacity"
        >
          Blog
        </a>
      </div>
    </header>
  );
}
