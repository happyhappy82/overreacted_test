import Header from "@/components/Header";
import PostCard from "@/components/PostCard";
import { getSortedPostsData } from "@/lib/posts";

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <>
      <Header />
      <main>
        <div className="relative -top-[10px] flex flex-col gap-8">
          {posts.length === 0 ? (
            <p>No posts yet. Create your first post in content/posts/</p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.slug} {...post} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
