"use client";

import type { QnAItem } from "@/lib/qna-utils";

interface QnAProps {
  items: QnAItem[];
}

export default function QnA({ items }: QnAProps) {
  return (
    <div className="space-y-3 my-8">
      {items.map((item, index) => (
        <details
          key={index}
          className="group border border-gray-200 rounded-lg overflow-hidden"
        >
          <summary className="cursor-pointer px-5 py-4 bg-white hover:bg-gray-50 transition-colors list-none flex items-start">
            <span className="mr-3 text-gray-400 group-open:rotate-90 transition-transform">
              ▶
            </span>
            <span className="font-medium text-gray-900 flex-1">
              {item.question}
            </span>
          </summary>
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
