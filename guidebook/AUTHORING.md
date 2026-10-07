# Authoring guide — adding and editing pages

For GPT, Claude, Grok or a human editor. One page = one Markdown file in `content/pages/`. Run `node tools/build.mjs --check` after every change.

## Front matter

```
---
id: restarting-after-gap            # permanent; used in links and URLs (#/n/<id>)
title: Restarting after a gap
short: Restarting                   # optional; atlas, map and trail label
route: /treatment/restarting-after-gap/
entrance: treatment                 # understand | treatment | care | evidence | accountability | about
priority: 3                         # order within the entrance (1 = first)
kind: hub                           # optional: hub (entrance landing) | home; omit for normal pages
summary: One sentence, plain language, shown under the title and in previews.
status: drafted                     # proposed | drafted | sourced | reviewed | integrated | checked | published
reviewed: 2026-10-06
endpoint: true                      # optional: page ends in a concrete action
endpoint_text: What the reader can now do.
next_action: appointment-preparation   # up to three onward links (ids)
next_related: formulations-response
next_deeper: treatment-evidence
---
```

## Body sections

```
@layer 1 Quick understanding        # titles are free text; numbers fix the depth position
@layer 2 Possible explanations
@layer 3 Useful next action
@layer 4 Treatment logic
@layer 5 Deeper explanation
@layer 6 Evidence and sources
@questions                          # shown after the last layer
@uncertainty                        # required on non-hub pages (build warns)
@unresolved                         # sources still needed
```

Pages may skip layers. Hubs normally have one layer plus `@component children`.

## Claims

A claim is a paragraph starting with a label, optional confidence, and source IDs:

```
!research[strong](W2, W3) Starting medication was associated with…
!guidance(W1) NICE recommends…
!institution(X3) The trust wrote that…
!patient(J) Matthew reports…
!contested(X1, X2) The trust records… ; the patient's addendum says…
!hypothesis() A shared pathway might…
!missing() The dispensing record for December has not been obtained.
!finding(C1) The coroner raised concern that…
```

Confidence: `strong | moderate | limited | pending`. guidance, research, institution, finding, patient and contested **must** cite a source. One claim per paragraph; keep each claim no stronger than its source.

## Inline syntax

- `[[page-id]]` or `[[page-id|link text]]` — internal link with hover preview
- `{W2}` or `{R1, W3}` — source reference buttons
- `**bold**`, `*italic*`, `` `code` ``, `[text](https://…)`
- Tables (`| a | b |`), lists, `- [ ] checklist`, `> quote`
- Callouts: `> [!note] Title`, `> [!warn] Title`, `> [!key] Title`, `> [!ask] Title`
- `### Subheading` inside a layer
- Components: `@component mechanism`, `@component timeline`, `@component request-builder`, `@component appointment-builder`, `@component legend`, `@component source-index`, `@component children <entrance>`

## Sources

Add to `content/sources.json` before citing. Required: `id`, `type`, `citation`, `access` (what was actually read: full text / abstract / supplied copy / pointer). Optional: `short`, `url`, `doi`, `checked`, `operative` (for policies: the period it was in force), `note`.

Case-record sources describe the document; they never contain identifiers. Private documents are never copied into `content/` or `dist/`.

## House rules (from the handoff review)

- Initiation studies are not withdrawal studies. Do not reverse their effect sizes.
- A patient report recorded by a clinician is still a patient report.
- Historical policy carries its operative period. Do not present it as current.
- "Not found in reviewed records" never becomes "did not happen".
- Hypotheses live on the open-questions page with competing explanations and an observable test; never as advice to self-experiment.
- No live day counters on disputed start dates.
- Replace "why their defence fails" with "possible explanation / evidence needed / remaining question".
