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
      {/* 모바일/태블릿 아코디언 */}
      <nav className="xl:hidden mb-8 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700">
            목차
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isOpen && (
          <ul className="px-4 py-3 space-y-2 text-sm bg-white">
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
                    setIsOpen(false);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>

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
