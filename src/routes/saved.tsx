import { createFileRoute, Link } from "@tanstack/react-router";
import { catalogItem } from "@/data/registry";
import { slideSearch } from "@/lib/place";
import { useHydrated, usePrivate } from "@/lib/session";

export const Route = createFileRoute("/saved")({ component: SavedPage });

function SavedPage() {
  const hydrated = useHydrated();
  const bookmarks = usePrivate((state) => state.bookmarks);
  const lastId = usePrivate((state) => state.lastPostId);
  const toggle = usePrivate((state) => state.toggleBookmark);
  const last = lastId ? catalogItem(lastId) : undefined;

  return (
    <div className="px-4 py-4">
      <h1 className="font-serif text-3xl text-ink">Saved</h1>
      <p className="text-sm text-muted">Saving a post does not mark it as read.</p>
      {hydrated && last?.available ? (
        <p>
          <Link to="/post/$id" params={{ id: last.id }} search={slideSearch(last.id)} className="btn">
            Back to {last.title}
          </Link>
        </p>
      ) : null}
      <ul className="m-0 list-none p-0">
        {hydrated && bookmarks.length === 0 ? (
          <li className="text-muted">Nothing saved yet. Use Save on any post to keep it here.</li>
        ) : null}
        {bookmarks.map((id) => {
          const item = catalogItem(id);
          return (
            <li key={id} className="border-b border-line py-3">
              {item.available && item.kind === "article" && item.href ? (
                <a href={item.href} className="text-xl text-ink">
                  {item.title}
                </a>
              ) : item.available ? (
                <Link to="/post/$id" params={{ id }} search={slideSearch(id)} className="text-xl text-ink">
                  {item.title}
                </Link>
              ) : (
                <p className="m-0 text-xl text-ink">{item.title}</p>
              )}
              {item.kind === "sample" ? <p className="mb-0 text-sm text-muted">Preview sample. Not the publication.</p> : null}
              <button type="button" className="btn mt-2" onClick={() => toggle(id)}>
                Remove
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
