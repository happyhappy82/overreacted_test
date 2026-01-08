"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    // Remove markdown bold syntax (**text**)
    const text = match[2].replace(/\*\*/g, '');
    const id = generateId(text);

    headings.push({ id, text, level });
  }

  return headings;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const extracted = extractHeadings(content);
    setHeadings(extracted);

    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%" }
    );

    // Observe all headings
    extracted.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <>
      {/* 모바일/태블릿 플로팅 버튼 */}
      <div className="xl:hidden">
        {/* 플로팅 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-black/70 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center hover:bg-black/80 transition-all"
          aria-label="목차"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* 모달 오버레이 */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">목차</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <ul className="px-6 py-4 space-y-3">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}
                  >
                    <a
                      href={`#${heading.id}`}
                      className={`block py-2 transition-colors ${
                        activeId === heading.id
                          ? 'text-black font-semibold'
                          : 'text-gray-600 hover:text-black'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                        setIsOpen(false);
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </div>

      {/* 데스크탑 고정 사이드바 */}
      <nav className="hidden xl:block fixed right-8 top-32 w-56">
        <div className="sticky top-32">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
            목차
          </p>
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: heading.level === 3 ? '1rem' : '0' }}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block transition-colors ${
                    activeId === heading.id
                      ? 'text-black font-medium'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
