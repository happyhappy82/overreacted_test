import { useState, useEffect } from "react";

interface BlogPost {
  title: string;
  description: string;
  url: string;
  image: string;
  date: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function AijeongInsights() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts.json")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="mt-16 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          에이정 인사이트
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          AI 활용법과 최신 트렌드를 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0b2077]/10 to-[#0b2077]/5 dark:from-[#0b2077]/30 dark:to-[#0b2077]/10">
                  <svg className="w-10 h-10 text-[#0b2077]/30 dark:text-[#0b2077]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-[#0b2077] dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {post.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {post.date?.split("T")[0]}
                </p>
              </div>
            </a>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-8">
            게시글을 불러올 수 없습니다.
          </p>
        )}
      </div>

      <div className="text-center mt-6">
        <a
          href="https://blog.aijeong.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0b2077] dark:text-blue-400 hover:underline"
        >
          블로그에서 더 보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
