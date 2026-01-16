import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-[#0066cc] text-white font-medium rounded-lg hover:bg-[#0052a3] transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </>
  );
}
