import { POSTS as BANK } from "@/data/posts";
import slideSet from "../../content/posts/slides.json";

export type EvidenceLabel = "Research" | "Guidance" | "Editorial";

export type Layer = { heading: string; text: string };

export type StorySlide = { id: string; heading: string; body: string };

export type SourceLink = { label: string; href: string };

export type FeedPost = {
  id: string;
  title: string;
  text: string;
  time: string;
  topic: string;
  evidence: EvidenceLabel;
  deck?: string;
  /** Not through MJB evidence review. Shown with a visible chip. */
  sample: boolean;
  layers: Layer[];
  /** Finite story. Built only from text already on the post. */
  slides: StorySlide[];
  sources: SourceLink[];
  article?: { href: string; label: string };
};

export type Deck = {
  id: string;
  emoji: string;
  title: string;
  short: string;
  topic: string;
  post: string;
  notice?: string;
  cards: { tone: "gold" | "violet" | "blue" | "teal" | "rose"; emoji?: string; kicker: string; heading: string; body: string }[];
};

function attachSampleSlides(post: Omit<FeedPost, "slides">): FeedPost {
  const opening = post.text.split("\n\n")[0] ?? post.text;
  return {
    ...post,
    slides: [
      { id: `${post.id}-opening`, heading: post.title, body: opening },
      ...post.layers.map((layer) => ({
        id: `${post.id}-${layer.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        heading: layer.heading,
        body: layer.text,
      })),
    ],
  };
}

const AUTHORED = slideSet.posts as Record<string, StorySlide[]>;

export const SLIDE_SET = {
  contentRevision: String(slideSet.content_revision),
  revisedOn: slideSet.revised_on,
};

/** Sample threads from the 4 Nov review. Citations are named; the copy is not an approved MJB article. */
const SAMPLE: FeedPost[] = (
  [
  {
    id: "p-herit",
    title: "ADHD is one of the most heritable conditions in psychiatry.",
    time: "",
    topic: "genetics",
    evidence: "Research",
    deck: "genes",
    sample: true,
    text: "Across twin studies, the average heritability of ADHD is often summarised at about 74%. That is a population figure, not a verdict on one person, and it is not a reason to skip the sources.\n\nThe short version: family patterns are largely genetic. The careful version is in the layers, with the papers named.",
    layers: [
      {
        heading: "The simple version",
        text: "ADHD runs in families. Twin studies attribute most of that pattern to genetics rather than upbringing alone.",
      },
      {
        heading: "How it works",
        text: "Heritability describes variation across a group. About three-quarters of the differences in ADHD traits, in those studies, line up with genetic differences. It does not mean 74% of one person’s ADHD is “from genes”, and it does not make environment irrelevant.",
      },
      {
        heading: "The genetics",
        text: "Demontis and colleagues (2023) reported 27 genome regions linked to ADHD. Each common variant has a small effect. Together they build risk. This card is sample copy pending MJB evidence review.",
      },
    ],
    sources: [
      {
        label: "Faraone & Larsson (2019). Genetics of ADHD. Molecular Psychiatry.",
        href: "https://doi.org/10.1038/s41380-018-0070-0",
      },
      {
        label: "Demontis et al. (2023). Genome-wide analyses of ADHD. Nature Genetics.",
        href: "https://doi.org/10.1038/s41588-022-01285-8",
      },
    ],
  },
  {
    id: "p-time",
    title: "Time blindness is measurable. It is not a moral failing.",
    time: "",
    topic: "brain",
    evidence: "Research",
    deck: "time",
    sample: true,
    text: "People with ADHD often describe time as “now” and “not now”. Studies of interval timing and delay discounting are the sources for that description — not a slogan.\n\nExternal cues (a visible timer, a labelled alarm) move time out of your head. This preview’s alarms are still only as reliable as an open browser tab.",
    layers: [
      {
        heading: "The simple version",
        text: "If later rewards feel weaker, a deadline does not feel real until it is close. That is a description of the research pattern, not a diagnosis.",
      },
      {
        heading: "How it works",
        text: "Timing papers point at frontal, striatal and cerebellar networks. Delay-discounting reviews find steeper discounting in ADHD groups. Sample copy — check the papers.",
      },
      {
        heading: "What helps",
        text: "Visible countdowns, alarms that say the actual task, and short chunks. None of these replace an assessment or a prescription.",
      },
    ],
    sources: [
      {
        label: "Noreika, Falter & Rubia (2013). Timing deficits in ADHD. Neuropsychologia.",
        href: "https://doi.org/10.1016/j.neuropsychologia.2012.09.036",
      },
      {
        label: "Jackson & MacKillop (2016). ADHD and delay discounting. Biological Psychiatry: CNNI.",
        href: "https://doi.org/10.1016/j.bpsc.2016.05.003",
      },
    ],
  },
  {
    id: "p-nice",
    title: "A questionnaire on its own cannot diagnose ADHD — or rule it out.",
    time: "",
    topic: "care",
    evidence: "Guidance",
    deck: "assess",
    sample: true,
    text: "NICE NG87 treats rating scales as support for a specialist assessment, not as a diagnosis by themselves.\n\nIf a decision rested on a score alone, the useful next step is to ask what else was considered, and to get the answer in writing.",
    layers: [
      {
        heading: "The simple version",
        text: "A form is a starting point, not a verdict.",
      },
      {
        heading: "What the guidance says",
        text: "NG87 recommends diagnosis by an appropriately qualified specialist after a full clinical and psychosocial assessment. Rating scales should not be used alone.",
      },
      {
        heading: "What to ask next",
        text: "Which parts of the assessment were done? Who is responsible while you wait? Can you have the decision and the reasons in writing?",
      },
    ],
    sources: [
      {
        label: "NICE NG87. ADHD: diagnosis and management.",
        href: "https://www.nice.org.uk/guidance/ng87",
      },
    ],
  },
] satisfies Array<Omit<FeedPost, "slides">>).map(attachSampleSlides);

const DRAFTS: FeedPost[] = BANK.map((post) => {
  const articleHref = post.article?.url
    ? post.article.url.startsWith("http")
      ? post.article.url
      : `https://mjb-adhd.org.uk${post.article.url}`
    : "https://mjb-adhd.org.uk/science/what-is-adhd/";
  const articleLabel = post.article?.label ?? "What is ADHD?";
  const slides = AUTHORED[post.id];
  if (!slides?.length) {
    throw new Error(`No authored slides for ${post.id}. Refusing to split the post into sentences.`);
  }
  return {
    id: post.id,
    title: post.title,
    time: "Draft",
    topic: post.primary_topic,
    evidence: "Editorial" as const,
    sample: false,
    text: post.body.join("\n\n"),
    layers: post.body.map((paragraph, index) => ({
      heading: index === 0 ? "What this draft says" : "The next line",
      text: paragraph,
    })),
    slides,
    sources: [{ label: articleLabel, href: articleHref }],
    article: { label: articleLabel, href: articleHref },
  };
});

/** The publication preview. Sample threads are not in this list. */
export const EDITORIAL: FeedPost[] = DRAFTS;
/** Kept apart from the publication. Always labelled pending review. */
export const SAMPLES: FeedPost[] = SAMPLE;

export const FEED: FeedPost[] = [...SAMPLE, ...DRAFTS];

export const DECKS: Deck[] = [
  {
    id: "genes",
    emoji: "🧬",
    short: "Genetics",
    title: "ADHD genetics in 4 screens",
    topic: "genetics",
    post: "p-herit",
    notice: "Sample copy. Pending evidence review.",
    cards: [
      { tone: "violet", emoji: "🧬", kicker: "1 · The headline", heading: "ADHD runs strongly in families.", body: "Twin studies put heritability high." },
      { tone: "blue", emoji: "📊", kicker: "2 · What the number means", heading: "Not “74% of your ADHD is genes”.", body: "Heritability is about variation in a population, not one person’s fate." },
      { tone: "teal", emoji: "🧩", kicker: "3 · How it works", heading: "Many small variants, not one ADHD gene.", body: "Demontis et al. 2023 is the paper named on the thread." },
      { tone: "gold", emoji: "🎯", kicker: "4 · Why it matters", heading: "Biology is not a character flaw.", body: "Open the thread for the sources. This deck does not replace them." },
    ],
  },
  {
    id: "time",
    emoji: "⏳",
    short: "Time blindness",
    title: "Time blindness, explained",
    topic: "brain",
    post: "p-time",
    notice: "Sample copy. Pending evidence review.",
    cards: [
      { tone: "rose", emoji: "⏳", kicker: "1 · The experience", heading: "Five minutes became an hour.", body: "Many people describe ADHD time as now and not-now. The research is linked from the thread." },
      { tone: "violet", emoji: "🧠", kicker: "2 · The research", heading: "Timing can be measured.", body: "Interval timing and delay discounting are the two lines of evidence named here." },
      { tone: "teal", emoji: "💰", kicker: "3 · The reward link", heading: "Later rewards can feel worth less.", body: "That is a group finding, not a personal test." },
      { tone: "gold", emoji: "🔔", kicker: "4 · What helps", heading: "Make time visible.", body: "A labelled alarm is a cue. It is not proof you did the thing." },
    ],
  },
  {
    id: "assess",
    emoji: "🩺",
    short: "Assessment",
    title: "Getting assessed in England",
    topic: "care",
    post: "p-nice",
    notice: "Sample copy. Pending evidence review. Navigation, not a diagnosis.",
    cards: [
      { tone: "blue", emoji: "🩺", kicker: "1 · Start", heading: "The GP is the usual door.", body: "Ask for a referral. Examples from childhood and now help." },
      { tone: "teal", emoji: "🗺️", kicker: "2 · Choice", heading: "Right to Choose is an England route.", body: "It is not a guarantee of a short wait, and it is not the rule for the whole UK." },
      { tone: "violet", emoji: "📋", kicker: "3 · The assessment", heading: "A questionnaire is not a diagnosis.", body: "NICE NG87 says rating scales do not replace a specialist assessment." },
      { tone: "gold", emoji: "🗂️", kicker: "4 · Paper trail", heading: "Get the plan in writing.", body: "An assurance is not a safety plan. Ask who holds responsibility now." },
    ],
  },
];

export const HELP: { title: string; body: string; href: string }[] = [
  {
    title: "When starting is the hard part",
    body: "A short public page on small supports for getting started. It is not a clinic and it does not book appointments.",
    href: "/support/quick-starts/",
  },
  {
    title: "Care navigation",
    body: "How to think about who is involved in care. MJB does not take on your case.",
    href: "/guide/static/care/",
  },
  {
    title: "Medication continuity",
    body: "What to ask if prescribing is interrupted. This is not a promise that a prescription will continue.",
    href: "/guide/static/treatment/continuity/",
  },
  {
    title: "If nobody is prescribing",
    body: "A page about the gap when shared care stops. Ask who holds responsibility now, in writing.",
    href: "/guide/static/care/no-prescriber/",
  },
  {
    title: "Records and escalation",
    body: "How records and escalation are described on the public site. Confirm any deadline with the organisation itself.",
    href: "/guide/static/care/records-escalation/",
  },
  {
    title: "Put it in writing",
    body: "When help doesn’t come: what to write down, and what an assurance is not.",
    href: "/support/when-help-doesnt-come/",
  },
  {
    title: "What you can ask for",
    body: "Access and adjustments across the UK. The service decides what is reasonable.",
    href: "/rights/overview/",
  },
];

export const MYTHS = [
  {
    claim: "ADHD is diagnosed from a questionnaire.",
    why: "Rating scales are screening and support tools.",
    says: "NICE NG87: a diagnosis needs a full clinical and psychosocial assessment by a specialist. Scales should not be used alone.",
    cost: "People can be screened out by a score, or labelled without the history that should guide care.",
    ask: "Which parts of a full assessment were completed?",
    href: "https://www.nice.org.uk/guidance/ng87",
  },
  {
    claim: "Responding to stimulants proves, or disproves, ADHD.",
    why: "Stimulants can change attention in people without ADHD as well.",
    says: "Treatment response informs treatment. It is not the diagnosis. Rapoport and colleagues (1978) is the classic paper cited for this point.",
    cost: "The wrong conclusion in either direction.",
    ask: "What is the diagnosis based on, separately from medication response?",
    href: "https://doi.org/10.1126/science.339386",
  },
  {
    claim: "Adults grow out of ADHD.",
    why: "What other people can see often changes. The load may not.",
    says: "NICE recognises ADHD in adults and sets out assessment and management where criteria are met.",
    cost: "Adults told they seem fine, so nobody owns the plan.",
    ask: "Are you assessing an adult presentation, or a childhood stereotype?",
    href: "https://www.nice.org.uk/guidance/ng87",
  },
  {
    claim: "ADHD is caused by bad parenting or too much screen time.",
    why: "Family patterns largely track shared genes in the twin literature.",
    says: "Faraone & Larsson (2019) review that heritability evidence. Screens and upbringing can still matter. They are not the whole cause.",
    cost: "Blame replaces a proper assessment.",
    ask: "Which evidence are you using for cause, and what can it not show?",
    href: "https://doi.org/10.1038/s41380-018-0070-0",
  },
];

export function feedById(id: string): FeedPost | undefined {
  return FEED.find((post) => post.id === id);
}

export function deckById(id: string): Deck | undefined {
  return DECKS.find((deck) => deck.id === id);
}

export const TOPICS = ["genetics", "brain", "care", "intro", "evidence-method"] as const;

export const TOPIC_LABELS: Record<(typeof TOPICS)[number], string> = {
  genetics: "Genetics",
  brain: "Brain and time",
  care: "Getting care",
  intro: "Start here",
  "evidence-method": "How evidence is used",
};
