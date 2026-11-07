import { createFileRoute } from "@tanstack/react-router";
import { TopicReader } from "@/components/topic-reader";
import { Thread } from "@/components/reader";
import { feedById } from "@/data/feed";
import { proposalById } from "@/data/proposals";
import { readerPost } from "@/data/reader-bank";

export const Route = createFileRoute("/post/$id")({
  validateSearch: (search: Record<string, unknown>) => {
    const slide = Math.floor(Number(search.slide));
    return slide >= 1 ? { slide } : {};
  },
  head: ({ params }) => {
    const published = readerPost(params.id);
    const proposed = proposalById(params.id);
    const post = feedById(params.id);
    const title = published?.title || proposed?.title || post?.title;
    const description = published?.hook || proposed?.learningPoint || post?.text.split("\n")[0] || "";
    const label = title ? `${title} · MJB ADHD` : "Post not found · MJB ADHD";
    return {
      meta: [
        { title: label },
        { name: "description", content: description.slice(0, 200) },
        { property: "og:title", content: label },
        { property: "og:description", content: description.slice(0, 200) },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { slide } = Route.useSearch();
  if (readerPost(id) || proposalById(id)) return <TopicReader key={id} id={id} initialSlide={slide} />;
  return <Thread key={id} id={id} initialSlide={slide} />;
}
