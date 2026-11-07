import { createFileRoute, Link } from "@tanstack/react-router";
import { HELP } from "@/data/feed";

export const Route = createFileRoute("/help")({ component: HelpPage });

function HelpPage() {
  return (
    <div className="px-4 py-4">
      <h2 className="font-serif text-3xl text-ink">An assurance isn’t a safety plan.</h2>
      <p>
        This is navigation, not clinical care. MJB does not watch this page, answer emergencies, or replace the clinician
        who holds responsibility for you. Nothing here is a request for casework.
      </p>
      <ul className="m-0 list-none p-0">
        {HELP.map((item) => (
          <li key={item.href} className="border-b border-line py-3">
            <h3 className="m-0 text-xl text-ink">
              <a href={item.href}>{item.title}</a>
            </h3>
            <p className="mb-0 mt-1">{item.body}</p>
          </li>
        ))}
      </ul>
      <p>
        Non-urgent contact: <Link to="/contact">Follow & contact</Link>. Messages there are not monitored as emergencies.
      </p>
      <p>
        Danger: <a href="tel:999">999</a>. Urgent, not an emergency: <a href="tel:111">NHS 111</a>. Samaritans:{" "}
        <a href="tel:116123">116 123</a>.
      </p>
    </div>
  );
}
