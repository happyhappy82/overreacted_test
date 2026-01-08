import { notFound } from "next/navigation";
import Header from "@/components/Header";
import TableOfContents from "@/components/TableOfContents";
import QnA from "@/components/QnA";
import { getPostBySlug, getSortedPostsData } from "@/lib/posts";
import { extractQnA, removeQnASection } from "@/lib/qna-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const url = `https://blog.aijeong.com/${slug}`;

  return {
    title: `${post.title} — 에이정`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: url,
      siteName: "에이정 공식 블로그",
      locale: "ko_KR",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Extract Q&A and remove from main content
  const qnaItems = extractQnA(post.content);
  const contentWithoutQnA = removeQnASection(post.content);

  return (
    <>
      <Header />
      <TableOfContents content={contentWithoutQnA} />
      <main>
        <article className="prose prose-lg max-w-none">
          <h1
            className="text-[48px] font-black leading-tight mb-2"
            style={{ color: post.lightColor }}
          >
            {post.title}
          </h1>
          <p className="text-[13px] text-gray-700 mb-8">
            {post.date} · {post.readingTime}
          </p>
          <div className="mt-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = String(children).replace(/\*\*/g, '');
                  const id = generateId(text);
                  return <h2 id={id}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children).replace(/\*\*/g, '');
                  const id = generateId(text);
                  return <h3 id={id}>{children}</h3>;
                }
              }}
            >
              {contentWithoutQnA}
            </ReactMarkdown>

            {qnaItems.length > 0 && (
              <>
                <h2 id="자주-묻는-질문" className="mt-12 mb-6">자주 묻는 질문</h2>
                <QnA items={qnaItems} />
              </>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
