import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: string;
  lightColor: string;
  darkColor: string;
}

export function getSortedPostsData(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx?$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // Remove first h1 heading from content to avoid duplicate title
      const contentWithoutTitle = content.replace(/^#\s+.+\n*/m, '').trim();

      const stats = readingTime(contentWithoutTitle);

      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        excerpt: data.excerpt || "",
        content: contentWithoutTitle,
        readingTime: stats.text,
        lightColor: data.lightColor || "lab(62.926 59.277 -1.573)",
        darkColor: data.darkColor || "lab(80.993 32.329 -7.093)",
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    let fileContents;

    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } else {
      const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
      if (fs.existsSync(mdxPath)) {
        fileContents = fs.readFileSync(mdxPath, "utf8");
      } else {
        return null;
      }
    }

    const { data, content } = matter(fileContents);

    // Remove first h1 heading from content to avoid duplicate title
    const contentWithoutTitle = content.replace(/^#\s+.+\n*/m, '').trim();

    const stats = readingTime(contentWithoutTitle);

    return {
      slug,
      title: data.title || slug,
      date: data.date || "",
      excerpt: data.excerpt || "",
      content: contentWithoutTitle,
      readingTime: stats.text,
      lightColor: data.lightColor || "lab(62.926 59.277 -1.573)",
      darkColor: data.darkColor || "lab(80.993 32.329 -7.093)",
    };
  } catch (error) {
    console.error(`Error loading post ${slug}:`, error);
    return null;
  }
}
