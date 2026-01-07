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
}: PostCardProps) {
  return (
    <Link
      className="block py-4"
      href={`/${slug}`}
    >
      <article>
        <h2
          className="text-[28px] font-black leading-none mb-2"
          style={{ color: lightColor }}
        >
          {title}
        </h2>
        <p className="text-[13px] text-gray-700">{date}</p>
        <p className="mt-1">{excerpt}</p>
      </article>
    </Link>
  );
}
