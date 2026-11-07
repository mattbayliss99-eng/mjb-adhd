import { createFileRoute } from "@tanstack/react-router";
import { listProfiles } from "@/lib/self-profile";

export const Route = createFileRoute("/questionnaires/")({
  component: QuestionnaireHub,
});

const ASRS_PDF = "https://www.hcp.med.harvard.edu/ncs/ftpdir/adhd/6Q_ASRS_English.pdf";
const ASRS_CURRENT = "https://www.hcp.med.harvard.edu/ncs/asrs_2025.php";
const ASRS_OLDER = "https://www.hcp.med.harvard.edu/ncs/asrs.php";

function QuestionnaireHub() {
  const profiles = listProfiles();
  return (
    <div className="px-4 py-4">
      <h1 className="font-serif text-3xl text-ink">Understand your patterns</h1>
      <p>Explore everyday difficulties, describe what happens, and keep a summary if it is useful. MJB self-profiles are exploratory. Official questionnaires are listed separately and keep their own instructions.</p>

      <section className="mt-4" aria-labelledby="mjb-profiles">
        <h2 id="mjb-profiles">MJB exploratory self-profiles</h2>
        <div className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <article key={profile.id} className="card">
              <p className="kicker">Exploratory · not a diagnostic test · adults 18+</p>
              <h3 className="text-xl">{profile.title}</h3>
              <p>{profile.subtitle}</p>
              <a className="btn btn-primary" href={`/questionnaires/${profile.id}`}>Start</a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6" aria-labelledby="official-questionnaires">
        <h2 id="official-questionnaires">Official questionnaires</h2>
        <article className="card">
          <p className="kicker">Official source · screening, not diagnosis</p>
          <h3 className="text-xl">Adult ADHD screener — official ASRS v1.1</h3>
          <p>Open the official six-question adult ADHD screener and follow its own instructions. It is separate from the MJB exploratory profiles. A screening result is not a diagnosis.</p>
          <div className="flex flex-wrap gap-2">
            <a className="btn btn-primary" href={ASRS_PDF} rel="noopener" target="_blank">Open official screener</a>
            <a className="btn" href={ASRS_CURRENT} rel="noopener" target="_blank">Source, permissions and versions</a>
            <a className="btn" href={ASRS_OLDER} rel="noopener" target="_blank">Older distribution and conditions page</a>
          </div>
          <p className="text-sm text-muted">These open Harvard’s pages. This site does not score the official form, does not ask you to enter its answers, and does not turn it into an MJB result.</p>
        </article>
      </section>

      <p className="mt-4 text-sm">
        <a href="/questionnaire-demo">Fictional questionnaire demonstration</a>
        <span className="text-muted"> — a separate, unscored example. It is not one of these profiles.</span>
      </p>
    </div>
  );
}
