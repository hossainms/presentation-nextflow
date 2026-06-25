# Nextflow Workflow Management — an interactive teaching deck

An interactive web presentation that builds a conceptual understanding of
[**Nextflow**](https://nextflow.io), the dataflow workflow-management system, by reading a
real, production bioinformatics pipeline rather than a toy example. The worked example threaded
through the talk is [**nf-core/hlatyping**](https://nf-co.re/hlatyping), an open-source community
pipeline for 4-digit HLA class I typing from NGS reads (OptiType, with an optional HLA-HD path
for class I + II).

The deck is built for a graduate-level audience that knows Python and bash but is new to Nextflow.
It covers the dataflow model, DSL2 syntax, channels and operators, the hlatyping DAG end to end,
executors and containers, the nf-core ecosystem, `-resume` caching, and built-in observability.

## Scope and attribution

This is an **educational walkthrough**. Its goal is to explain how Nextflow behaves in a real
project setting using a publicly available pipeline as the worked example.

**I am not a developer or maintainer of nf-core/hlatyping.** All credit for the pipeline's design
and implementation belongs to the nf-core community and its contributors. It is used here purely as
a teaching artifact because it is production-grade and freely inspectable.

- Pipeline: https://nf-co.re/hlatyping · https://github.com/nf-core/hlatyping
- Code snippets shown as "verbatim" are drawn from the nf-core/hlatyping source (nf-core template 3.5.1).

## Viewing the slides

The deck is a single self-contained `index.html`. To view it:

- **Locally:** open `index.html` in any modern browser (double-click, or `open index.html`).
  An internet connection is required the first time, since fonts and the Reveal.js / CodeMirror
  libraries load from CDNs.
- **Hosted:** deploy the repository to any static host (GitHub Pages, Cloudflare Pages, Netlify).
  No build step is needed.

Controls: `Space` to advance, arrow keys to navigate, `S` for speaker view (with per-slide notes),
`Esc` for the slide overview.

## Repository layout

| File | Purpose |
| --- | --- |
| `index.html` | The presentation (Reveal.js, all slide content and speaker notes) |
| `styles.css` | Visual system: Nextflow-green accent on a slate base, layout, widgets |
| `app.js` | Interactive widgets: animated DAG, channel-operator marbles, executor tabs, `-resume` simulator, live param-substitution editor |

## Tech stack

- [Reveal.js](https://revealjs.com) for slide structure and navigation
- Hand-rolled SVG and vanilla JavaScript for the interactive diagrams and widgets
- [CodeMirror](https://codemirror.net) for the editable DSL2 snippet
- Inter (body) and JetBrains Mono (code) via Google Fonts

## Credits and citations

- Di Tommaso et al. *Nextflow enables reproducible computational workflows.* Nat Biotechnol 35, 316–319 (2017).
- Ewels et al. *The nf-core framework for community-curated bioinformatics pipelines.* Nat Biotechnol 38, 276–278 (2020).
- Szolek et al. *OptiType: precision HLA typing from next-generation sequencing data.* Bioinformatics 30, 3310–3316 (2014).
- Kawaguchi et al. *HLA-HD: an accurate HLA typing algorithm for next-generation sequencing data.* Hum Mutat 38, 788–797 (2017).

## Author

**MD Shakhaowat Hossain**
PhD Candidate, Biomedical Sciences
Center for Biomedical Informatics and Genomics
Tulane University School of Medicine
