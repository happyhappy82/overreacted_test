import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getPostBySlug, getSortedPostsData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";

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

  return {
    title: `${post.title} — overreacted`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <h1
            className="text-[48px] font-black leading-tight mb-2"
            style={
              {
                "--lightLink": post.lightColor,
                "--darkLink": post.darkColor,
                color: "var(--lightLink)",
              } as React.CSSProperties
            }
          >
            {post.title}
          </h1>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-8">
            {post.date} · {post.readingTime}
          </p>
          <div className="mt-8">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </main>
    </>
  );
}
