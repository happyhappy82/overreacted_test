import type { APIRoute } from "astro";
import { getSortedPostsData } from "@/lib/posts";

export const GET: APIRoute = () => {
  const posts = getSortedPostsData().slice(0, 3);

  const data = posts.map((post) => ({
    title: post.title,
    description: post.excerpt,
    url: `https://blog.aijeong.com/${post.slug}`,
    image: `/og/${post.slug}.png`,
    date: post.date,
  }));

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
