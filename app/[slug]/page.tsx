import { notFound } from "next/navigation";
import Image from "next/image";
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
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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
    alternates: {
      canonical: url,
    },
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

  const url = `https://blog.aijeong.com/${slug}`;

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "에이정",
      url: "https://blog.aijeong.com",
    },
    publisher: {
      "@type": "Organization",
      name: "에이정",
      logo: {
        "@type": "ImageObject",
        url: "https://blog.aijeong.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: "https://blog.aijeong.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: url,
      },
    ],
  };

  // FAQPage Schema (only if Q&A exists)
  const faqSchema =
    qnaItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: qnaItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <Header />
      <TableOfContents content={contentWithoutQnA} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main>
        <article className="prose prose-lg max-w-none">
          <h1
            className="text-[48px] font-black leading-tight mb-2"
            style={{ color: post.lightColor }}
          >
            {post.title}
          </h1>
          <p className="text-[13px] text-gray-700 mb-8">
            <time dateTime={post.date}>
              {post.date.split("T")[0]}
            </time>{" "}
            · {post.readingTime}
          </p>
          <div className="mt-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = String(children).replace(/\*\*/g, "");
                  const id = generateId(text);
                  return <h2 id={id}>{children}</h2>;
                },
                h3: ({ children }) => {
                  const text = String(children).replace(/\*\*/g, "");
                  const id = generateId(text);
                  return <h3 id={id}>{children}</h3>;
                },
                img: ({ src, alt }) => {
                  if (!src || typeof src !== "string") return null;
                  const altText = alt || post.title;
                  // Local images use Next.js Image component
                  if (src.startsWith("/")) {
                    return (
                      <Image
                        src={src}
                        alt={altText}
                        width={800}
                        height={450}
                        className="rounded-lg"
                        loading="lazy"
                        style={{ width: "100%", height: "auto" }}
                      />
                    );
                  }
                  // External images use regular img tag with lazy loading
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={altText}
                      loading="lazy"
                      className="rounded-lg w-full h-auto"
                    />
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table>{children}</table>
                  </div>
                ),
                td: ({ children, ...props }) => {
                  const isFirstColumn =
                    props.node?.position?.start.column === 1;
                  return (
                    <td
                      className={isFirstColumn ? "whitespace-nowrap" : ""}
                      {...props}
                    >
                      {children}
                    </td>
                  );
                },
              }}
            >
              {contentWithoutQnA}
            </ReactMarkdown>

            {qnaItems.length > 0 && (
              <>
                <h2 id="자주-묻는-질문" className="mt-12 mb-6">
                  자주 묻는 질문
                </h2>
                <QnA items={qnaItems} />
              </>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
