import Link from "./Link";

interface PostCardProps {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  lightColor: string;
  darkColor: string;
}

export default function PostCard({
  title,
  date,
  excerpt,
  slug,
  lightColor,
  darkColor,
}: PostCardProps) {
  return (
    <Link
      className="block py-4 hover:scale-[1.005] will-change-transform scale-100 active:scale-100"
      href={`/${slug}`}
      style={{
        opacity: 1,
        transition: "transform 0.2s ease-in-out, opacity 0.2s linear 0.4s",
      }}
    >
      <article>
        <h2
          className="text-[28px] font-black leading-none mb-2"
          style={
            {
              "--lightLink": lightColor,
              "--darkLink": darkColor,
              color: "var(--lightLink)",
            } as React.CSSProperties
          }
        >
          {title}
        </h2>
        <p className="text-[13px] text-gray-700 dark:text-gray-300">{date}</p>
        <p className="mt-1">{excerpt}</p>
      </article>
    </Link>
  );
}
