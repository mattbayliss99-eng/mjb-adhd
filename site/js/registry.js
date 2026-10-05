/* MJB ADHD — central route registry.
   Loaded as a classic script so file:// works (no fetch/JSON CORS). */
(function (g) {
  const ROUTES = [
    { id: "route.home", slug: "/", title: "Home", crumb: "Home", group: "core" },
    { id: "route.science", slug: "science/what-is-adhd/", title: "What ADHD is", crumb: "Confirmed Science", group: "primary" },
    { id: "route.support", slug: "support/quick-starts/", title: "Small supports for starting", crumb: "ADHD: The Experience", group: "primary" },
    { id: "route.compounds", slug: "compounds/", title: "Medications & Supplements", crumb: "Medications & Supplements", group: "primary" },
    { id: "route.compounds-cannabis", slug: "compounds/cannabis/", title: "Medical cannabis in depth", crumb: "Medical cannabis", group: "compounds" },
    { id: "route.compounds-strains", slug: "compounds/strain-reviews/", title: "Strain & chemovar reviews", crumb: "Strain reviews", group: "compounds" },
    { id: "route.rights", slug: "rights/overview/", title: "Access and adjustments", crumb: "Medical rights", group: "primary" },
    { id: "route.about", slug: "about/mission/", title: "Why this site exists", crumb: "Mission", group: "meta" },
    { id: "route.sources", slug: "sources/", title: "Source documents", crumb: "Sources", group: "meta" },
    { id: "route.contact", slug: "contact/", title: "Contact", crumb: "Contact", group: "meta" },
    { id: "route.evidence-map", slug: "sources/evidence-map/", title: "Evidence map", crumb: "Evidence map", group: "meta" },
    { id: "route.source-method", slug: "sources/method/", title: "How evidence is handled", crumb: "Source method", group: "meta" },
    { id: "route.archive", slug: "archive/", title: "Living archive", crumb: "Living archive", group: "meta" },
    { id: "route.gen-00", slug: "science/genetics/", title: "GEN-00: Genetics and ADHD: start here", crumb: "Genetics and ADHD: start here", group: "science" },
    { id: "route.gen-01", slug: "science/genetics/gen-01/", title: "GEN-01: ADHD and genes: what the evidence shows", crumb: "ADHD and genes: what the evidence shows", group: "science" },
    { id: "route.gen-02", slug: "science/genetics/gen-02/", title: "GEN-02: How to read a genetic claim", crumb: "How to read a genetic claim", group: "science" },
    { id: "route.gen-03", slug: "science/genetics/gen-03/", title: "GEN-03: The dopamine supply chain in plain English", crumb: "The dopamine supply chain in plain English", group: "science" },
    { id: "route.gen-04", slug: "science/genetics/gen-04/", title: "GEN-04: Common variants, rare variants and the heritability gap", crumb: "Common variants, rare variants and the heritability gap", group: "science" },
    { id: "route.gen-05", slug: "science/genetics/gen-05/", title: "GEN-05: Polygenic scores: what they can and cannot do", crumb: "Polygenic scores: what they can and cannot do", group: "science" },
    { id: "route.gen-06", slug: "science/genetics/gen-06/", title: "GEN-06: When movement symptoms and ADHD traits overlap: single-gene conditions clinicians consider", crumb: "When movement symptoms and ADHD traits overlap: single-gene conditions clinicians consider", group: "science" },
    { id: "route.gen-09", slug: "science/genetics/gen-09/", title: "GEN-09: Family history and inheritance patterns", crumb: "Family history and inheritance patterns", group: "science" },
    { id: "route.gen-10", slug: "science/genetics/gen-10/", title: "GEN-10: Autism genetics in brief", crumb: "Autism genetics in brief", group: "science" },
    { id: "route.gen-11", slug: "science/genetics/gen-11/", title: "GEN-11: Genetics glossary", crumb: "Genetics glossary", group: "science" },
    { id: "route.gen-12", slug: "science/genetics/gen-12/", title: "GEN-12: The 27 ADHD risk loci: a closer look", crumb: "The 27 ADHD risk loci: a closer look", group: "science" },
    { id: "route.pathway", slug: "science/pathway/", title: "The dopamine pathway explorer", crumb: "Dopamine pathway", group: "science" },
    { id: "route.numbers", slug: "sources/numbers/", title: "Verified numbers", crumb: "Verified numbers", group: "meta" }
  ];
  const ALIASES = {
    "confirmed-science": "science/what-is-adhd/",
    "adhd-the-experience": "support/quick-starts/",
    "healthcare-access-and-rights": "rights/overview/"
  };

  /* Test data for unpublished sections (synthetic objects, atlas graph, rights
     situations and nations) was removed in 0.6.5: the renderers that read it are
     not bundled. Recoverable from core065_original.zip. */

  g.MJB_ADHD = {
    version: "0.6.8",
    routes: ROUTES,
    aliases: ALIASES
  };
})(typeof window !== "undefined" ? window : globalThis);
