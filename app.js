/* Nextflow lecture deck — interactive widgets
   Six widgets: morph, operator playground, hlatyping DAG, live editor,
   executor tabs, resume simulator.

   All widgets are idempotent: safe to re-initialize when Reveal.js fires
   slidechanged after returning from speaker view or overview. */

(() => {
  'use strict';

  // ---------- Reveal.js bootstrap ----------
  const deck = new Reveal({
    hash: true,
    width: 1280,
    height: 800,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2.0,
    slideNumber: false,
    transition: 'fade',
    transitionSpeed: 'fast',
    backgroundTransition: 'none',
    controls: true,
    progress: true,
    center: false,
    plugins: [RevealNotes, RevealHighlight],
  });

  deck.initialize().then(() => {
    injectFooters();
    initMorph();
    initOperatorPlayground();
    initDAG();
    initEditor();
    initExecutorTabs();
    initResumeSimulator();
    initGantt();
    initSeqera();
  });

  // ---------- Footer (section name + slide number) ----------
  function injectFooters() {
    const sections = document.querySelectorAll('.reveal .slides > section');
    sections.forEach((s, idx) => {
      if (s.querySelector('.slide-footer')) return;
      const sect = s.getAttribute('data-section') || '';
      const footer = document.createElement('div');
      footer.className = 'slide-footer';
      footer.innerHTML =
        `<span>${escape(sect)}</span>` +
        `<span>Shakhaowat, Gragert Lab</span>` +
        `<span>${idx + 1} / ${sections.length}</span>`;
      s.appendChild(footer);
    });
  }

  // ---------- 1) Morph widget (bash ↔ DSL2) ----------
  function initMorph() {
    const left = document.getElementById('morph-left');
    const right = document.getElementById('morph-right');
    const btnReset = document.getElementById('morph-reset');
    const btnGo = document.getElementById('morph-go');
    if (!left || !right || !btnReset || !btnGo) return;

    const apply = (state) => {
      if (state === 'bash') {
        right.style.opacity = '0.18';
        right.style.transition = 'opacity 0.4s';
        left.style.opacity = '1';
        btnReset.classList.add('active');
        btnGo.classList.remove('active');
      } else {
        right.style.opacity = '1';
        right.style.transition = 'opacity 0.4s';
        left.style.opacity = '0.45';
        btnGo.classList.add('active');
        btnReset.classList.remove('active');
      }
    };

    btnReset.addEventListener('click', () => apply('bash'));
    btnGo.addEventListener('click', () => apply('dsl2'));
    apply('dsl2');
  }

  // ---------- 2) Channel operator playground ----------
  const MARBLES = {
    branch: {
      title: 'branch · route by predicate',
      desc:
        'In hlatyping: split a single samplesheet channel into three named streams by input file type.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="branch operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="100" x2="350" y2="100"/>
          <line class="marble-axis" x1="10" y1="140" x2="350" y2="140"/>
          <line class="marble-axis" x1="10" y1="180" x2="350" y2="180"/>
          <text class="marble-label" x="14" y="32">in</text>
          <text class="marble-label" x="14" y="92">bam</text>
          <text class="marble-label" x="14" y="132">fastq_multi</text>
          <text class="marble-label" x="14" y="172">fastq_single</text>
          ${marble(80, 40, 'A.bam', 'warn')}
          ${marble(160, 40, 'B_R1', 'alt')}
          ${marble(240, 40, 'C_L1', '')}
          ${marble(80, 100, 'A.bam', 'warn')}
          ${marble(160, 140, 'B_R1', 'alt')}
          ${marble(240, 180, 'C_L1', '')}
          <text class="marble-label" x="170" y="68">branch</text>
        </svg>`,
    },
    cross: {
      title: 'cross · emit key-matched pairs',
      desc:
        'In hlatyping: cross() pairs each sample’s reads with the Yara index sharing its key, emitting nested [[meta,reads],[meta,index]] tuples. Unlike join (which flattens to one item per key), cross is combinatorial within a key — fine here because each sample key is unique.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="cross operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="100" x2="350" y2="100"/>
          <line class="marble-axis" x1="10" y1="160" x2="350" y2="160"/>
          <text class="marble-label" x="14" y="32">reads</text>
          <text class="marble-label" x="14" y="92">index</text>
          <text class="marble-label" x="14" y="152">out</text>
          ${marble(80, 40, 'S1', '')}
          ${marble(180, 40, 'S2', 'alt')}
          ${marble(80, 100, 'S1', '')}
          ${marble(180, 100, 'S2', 'alt')}
          ${marble(80, 160, 'S1+', '')}
          ${marble(180, 160, 'S2+', 'alt')}
        </svg>`,
    },
    multiMap: {
      title: 'multiMap · split a joined tuple back into named streams',
      desc:
        'In hlatyping: after cross() pairs reads and index, multiMap re-emits each into named outputs so the next process’s two inputs are filled in lockstep.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="multiMap operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="120" x2="350" y2="120"/>
          <line class="marble-axis" x1="10" y1="170" x2="350" y2="170"/>
          <text class="marble-label" x="14" y="32">in: [r, i]</text>
          <text class="marble-label" x="14" y="112">reads</text>
          <text class="marble-label" x="14" y="162">index</text>
          ${marble(80, 40, 'S1r/i', '')}
          ${marble(180, 40, 'S2r/i', 'alt')}
          ${marble(80, 120, 'S1r', '')}
          ${marble(180, 120, 'S2r', 'alt')}
          ${marble(80, 170, 'S1i', '')}
          ${marble(180, 170, 'S2i', 'alt')}
        </svg>`,
    },
    groupTuple: {
      title: 'groupTuple · group by key',
      desc:
        'In hlatyping: group all (process_name, tool, version) emissions by process name before composing the software_versions.yml.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="groupTuple operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="140" x2="350" y2="140"/>
          <text class="marble-label" x="14" y="32">in</text>
          <text class="marble-label" x="14" y="132">grouped</text>
          ${marble(60, 40, 'F:fastqc', '')}
          ${marble(130, 40, 'O:opt', 'alt')}
          ${marble(200, 40, 'F:multi', '')}
          ${marble(270, 40, 'O:samt', 'alt')}
          ${marble(120, 140, 'F:[..]', '')}
          ${marble(220, 140, 'O:[..]', 'alt')}
        </svg>`,
    },
    combine: {
      title: 'combine · Cartesian product',
      desc:
        'In hlatyping: broadcast the single HLA-HD install artifact to every sample channel, so each typing task sees the install.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="combine operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="100" x2="350" y2="100"/>
          <line class="marble-axis" x1="10" y1="160" x2="350" y2="160"/>
          <text class="marble-label" x="14" y="32">samples</text>
          <text class="marble-label" x="14" y="92">install</text>
          <text class="marble-label" x="14" y="152">out</text>
          ${marble(80, 40, 'S1', '')}
          ${marble(160, 40, 'S2', 'alt')}
          ${marble(240, 40, 'S3', '')}
          ${marble(160, 100, 'HLAHD', 'warn')}
          ${marble(80, 160, 'S1+H', '')}
          ${marble(160, 160, 'S2+H', 'alt')}
          ${marble(240, 160, 'S3+H', '')}
        </svg>`,
    },
    mix: {
      title: 'mix · merge streams of the same shape',
      desc:
        'In hlatyping: ch_versions = ch_versions.mix(MODULE.out.versions.first()) accumulates per-module version YAMLs into one provenance stream.',
      svg: () => `
        <svg viewBox="0 0 360 200" role="img" aria-label="mix operator marble diagram">
          <line class="marble-axis" x1="10" y1="40" x2="350" y2="40"/>
          <line class="marble-axis" x1="10" y1="100" x2="350" y2="100"/>
          <line class="marble-axis" x1="10" y1="160" x2="350" y2="160"/>
          <text class="marble-label" x="14" y="32">A</text>
          <text class="marble-label" x="14" y="92">B</text>
          <text class="marble-label" x="14" y="152">mixed</text>
          ${marble(70, 40, 'a1', '')}
          ${marble(160, 40, 'a2', '')}
          ${marble(100, 100, 'b1', 'alt')}
          ${marble(220, 100, 'b2', 'alt')}
          ${marble(70, 160, 'a1', '')}
          ${marble(110, 160, 'b1', 'alt')}
          ${marble(160, 160, 'a2', '')}
          ${marble(220, 160, 'b2', 'alt')}
        </svg>`,
    },
  };

  function marble(x, y, label, cls) {
    return `
      <circle class="marble-node ${cls}" cx="${x}" cy="${y}" r="14"/>
      <text class="marble-text" x="${x}" y="${y + 1}">${escape(label)}</text>`;
  }

  function initOperatorPlayground() {
    const buttons = document.querySelectorAll('.op-btn');
    const mount = document.getElementById('marble-mount');
    const btnRestart = document.getElementById('marble-restart');
    if (!buttons.length || !mount) return;

    let current = 'branch';

    const render = (op) => {
      const m = MARBLES[op];
      if (!m) return;
      current = op;
      mount.innerHTML =
        `<h3 style="font-size:0.8em; margin:0 0 0.3em 0; color: var(--off-white)">${escape(
          m.title
        )}</h3>${m.svg()}<p class="op-desc">${escape(m.desc)}</p>`;
      const svg = mount.querySelector('svg');
      if (svg) animateMarbles(svg);
    };

    buttons.forEach((b) =>
      b.addEventListener('click', () => {
        buttons.forEach((x) => x.classList.remove('active'));
        b.classList.add('active');
        render(b.dataset.op);
      })
    );

    if (btnRestart) {
      btnRestart.addEventListener('click', () => render(current));
    }

    render('branch');
  }

  // Stagger marbles in left-to-right; output-row marbles slide down from the
  // input axis so the diagram reads as data flowing along the timelines.
  // Re-runs on every render (tab switch / restart) because the SVG is rebuilt.
  function animateMarbles(svg) {
    const circles = Array.from(svg.querySelectorAll('.marble-node'));
    const texts = Array.from(svg.querySelectorAll('.marble-text'));
    if (!circles.length) return;
    const cys = circles.map((c) => parseFloat(c.getAttribute('cy')));
    const inputCy = Math.min(...cys);

    // Rank by horizontal position for a left-to-right cascade.
    const order = circles
      .map((c, i) => ({ i, cx: parseFloat(c.getAttribute('cx')) }))
      .sort((a, b) => a.cx - b.cx);

    order.forEach((o, rank) => {
      const delay = (rank * 0.07).toFixed(2) + 's';
      const isOutput = cys[o.i] > inputCy + 5;
      const dy = inputCy - cys[o.i]; // negative: start at input axis, settle down
      [circles[o.i], texts[o.i]].forEach((el) => {
        if (!el) return;
        if (isOutput) el.style.setProperty('--dy', dy + 'px');
        el.style.animation =
          `${isOutput ? 'marbleDrop' : 'marbleIn'} 0.55s ease both`;
        el.style.animationDelay = delay;
      });
    });
  }

  // ---------- 3) Animated 8-stop hlatyping DAG ----------
  const DAG_NODES = [
    { id: 1, x: 30, y: 60, w: 140, h: 50, label: 'samplesheet.csv' },
    { id: 2, x: 200, y: 60, w: 140, h: 50, label: '.branch{...}' },
    { id: 3, x: 370, y: 60, w: 140, h: 50, label: 'CAT_FASTQ /\nCOLLATEFASTQ' },
    { id: 4, x: 540, y: 60, w: 140, h: 50, label: 'FASTQC' },
    { id: 5, x: 30, y: 240, w: 140, h: 50, label: 'YARA_INDEX' },
    { id: 6, x: 200, y: 240, w: 140, h: 50, label: 'YARA_MAPPER' },
    { id: 7, x: 370, y: 240, w: 140, h: 50, label: 'OPTITYPE' },
    { id: 8, x: 540, y: 240, w: 140, h: 50, label: 'MULTIQC' },
  ];

  const DAG_EDGES = [
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  ];

  const DAG_STAGES = [
    {
      title: 'Stage 1 · Samplesheet ingestion',
      detail:
        'PIPELINE_INITIALISATION validates --input against nextflow_schema.json and emits ch_samplesheet.',
      channel:
        '[ meta:[id:"P07", seq_type:"dna", single_end:false],\n  [P07_R1.fq.gz, P07_R2.fq.gz] ]',
    },
    {
      title: 'Stage 2 · Input-type branch',
      detail:
        'A single .branch{} routes each item into one of three downstream sub-DAGs based on file extension and sample size.',
      channel:
        'ch_input_files.bam  ·  ch_input_files.fastq_multiple  ·  ch_input_files.fastq_single',
    },
    {
      title: 'Stage 3 · Normalize inputs',
      detail:
        'BAM samples go through SAMTOOLS_COLLATEFASTQ; multi-file FASTQs are concatenated by CAT_FASTQ. Single-file FASTQs pass through unchanged.',
      channel:
        '[ meta:[id:"P07"], P07_merged_R1.fq.gz, P07_merged_R2.fq.gz ]',
    },
    {
      title: 'Stage 4 · FastQC',
      detail:
        'Per-sample read QC. Outputs feed both the MultiQC report and ch_multiqc_files.',
      channel: 'FASTQC.out.zip → [ meta:[id:"P07"], P07_fastqc.zip ]',
    },
    {
      title: 'Stage 5 · Yara index',
      detail:
        'YARA_INDEX builds an index against $projectDir/data/references/hla_reference_${meta.seq_type}.fasta — DNA or RNA reference, automatic per sample.',
      channel: 'YARA_INDEX.out.index → [ meta:[id:"P07"], hla_index_dna/ ]',
    },
    {
      title: 'Stage 6 · Yara pre-mapping',
      detail:
        'YARA_MAPPER aligns reads to the HLA reference, producing a small BAM. This pre-mapping step exists to avoid OptiType’s slower internal RazerS mapping.',
      channel:
        'YARA_MAPPER.out.bam join YARA_MAPPER.out.bai →\n  [ meta:[id:"P07"], P07.bam, P07.bam.bai ]',
    },
    {
      title: 'Stage 7 · OptiType ILP solver',
      detail:
        'Integer linear programming over the mapped reads, simultaneous across all class-I loci, yields a 4-digit class I HLA call.',
      channel:
        'OPTITYPE.out.hla_type → [ meta:[id:"P07"], P07_result.tsv ]\n  // A*02:01  A*24:02  B*07:02  B*35:01  C*04:01  C*07:02',
    },
    {
      title: 'Stage 8 · MultiQC aggregate',
      detail:
        'All FastQC zips, OptiType TSVs, coverage plots, and software_versions.yml fold into a single audit-ready HTML report.',
      channel: 'MULTIQC.out.report → multiqc_report.html',
    },
  ];

  function initDAG() {
    const svg = document.getElementById('dag-svg');
    const side = document.getElementById('dag-side');
    const stepEl = document.getElementById('dag-step');
    const btnPrev = document.getElementById('dag-prev');
    const btnNext = document.getElementById('dag-next');
    const btnReset = document.getElementById('dag-reset');
    if (!svg || !side || !btnPrev || !btnNext) return;

    svg.innerHTML = renderDAG();
    let step = 1;

    const render = () => {
      stepEl.textContent = step;
      // Update node classes
      DAG_NODES.forEach((n) => {
        const g = svg.querySelector(`[data-node="${n.id}"]`);
        if (!g) return;
        g.classList.remove('active', 'done');
        if (n.id < step) g.classList.add('done');
        if (n.id === step) g.classList.add('active');
      });
      // Update edges
      DAG_EDGES.forEach(([a, b], i) => {
        const e = svg.querySelector(`[data-edge="${i}"]`);
        if (!e) return;
        e.classList.toggle('active', b <= step);
      });
      // Side panel
      const s = DAG_STAGES[step - 1];
      side.innerHTML = `
        <h3>${escape(s.title)}</h3>
        <p style="margin:0 0 0.6em 0">${escape(s.detail)}</p>
        <div class="channel">${escape(s.channel)}</div>`;
    };

    btnPrev.addEventListener('click', () => {
      step = Math.max(1, step - 1);
      render();
    });
    btnNext.addEventListener('click', () => {
      step = Math.min(DAG_STAGES.length, step + 1);
      render();
    });
    btnReset.addEventListener('click', () => {
      step = 1;
      render();
    });

    render();
  }

  function renderDAG() {
    // Curved edges between nodes (right-edge of A to left-edge of B,
    // or down/around for the row jump).
    const edgeParts = DAG_EDGES.map(([a, b], i) => {
      const na = DAG_NODES.find((n) => n.id === a);
      const nb = DAG_NODES.find((n) => n.id === b);
      const ax = na.x + na.w;
      const ay = na.y + na.h / 2;
      const bx = nb.x;
      const by = nb.y + nb.h / 2;
      let d;
      if (na.y === nb.y) {
        // Horizontal: straight line with small curve
        d = `M ${ax} ${ay} C ${ax + 18} ${ay} ${bx - 18} ${by} ${bx} ${by}`;
      } else {
        // Row jump: from right edge of node 4 back to left edge of node 5
        // Use a U-shape via top-right → bottom-left
        d = `M ${ax} ${ay} C ${ax + 60} ${ay} ${nb.x - 60} ${by} ${bx} ${by}`;
        // Better: go down-and-left
        d = `M ${na.x + na.w / 2} ${na.y + na.h}
             L ${na.x + na.w / 2} ${(na.y + na.h + nb.y) / 2}
             L ${nb.x + nb.w / 2} ${(na.y + na.h + nb.y) / 2}
             L ${nb.x + nb.w / 2} ${nb.y}`;
      }
      // Arrowhead at end
      return `<path class="edge" data-edge="${i}" d="${d}" marker-end="url(#arrow)"/>`;
    }).join('');

    const nodeParts = DAG_NODES.map((n) => {
      // Two-line labels: split on newline
      const lines = n.label.split('\n');
      const tspans = lines
        .map((line, idx) => {
          const dy = idx === 0 ? -6 : 14;
          return `<tspan x="${n.x + n.w / 2}" dy="${dy}">${escape(line)}</tspan>`;
        })
        .join('');
      return `
        <g class="node" data-node="${n.id}">
          <rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6" ry="6"/>
          <text x="${n.x + n.w / 2}" y="${n.y + n.h / 2}">${tspans}</text>
          <text x="${n.x + 8}" y="${n.y + 14}" style="font-size:9px; fill:#0DC09D; text-anchor:start">${n.id}</text>
        </g>`;
    }).join('');

    return `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1F2937"/>
        </marker>
      </defs>
      ${edgeParts}
      ${nodeParts}`;
  }

  // ---------- 4) Live DSL2 editor with param substitution ----------
  // Two samplesheet rows the selector toggles between, each a distinct
  // substitution context. Demonstrates how one process body renders
  // differently per sample without changing the workflow definition.
  const SAMPLESHEETS = {
    dna: {
      label: 'DNA · paired-end',
      ctx: {
        'params.outdir': 'results',
        'meta.id': 'PATIENT_07',
        'meta.seq_type': 'dna',
        'bam': 'PATIENT_07.bam',
        'bai': 'PATIENT_07.bam.bai',
        'task.process': 'NFCORE_HLATYPING:HLATYPING:OPTITYPE',
      },
    },
    rna: {
      label: 'RNA · single-end',
      ctx: {
        'params.outdir': 'results',
        'meta.id': 'TUMOR_R3',
        'meta.seq_type': 'rna',
        'bam': 'TUMOR_R3.bam',
        'bai': 'TUMOR_R3.bam.bai',
        'task.process': 'NFCORE_HLATYPING:HLATYPING:OPTITYPE',
      },
    },
  };

  function initEditor() {
    const mount = document.getElementById('editor-mount');
    const preview = document.getElementById('editor-preview');
    if (!mount || !preview) return;

    if (mount.dataset.cmInit === '1') return;
    mount.dataset.cmInit = '1';

    const cm = CodeMirror.fromTextArea(mount, {
      mode: 'groovy',
      theme: 'dracula',
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      indentUnit: 2,
    });

    let sheet = 'dna';
    const render = () => {
      preview.innerHTML = renderScriptBlock(cm.getValue(), SAMPLESHEETS[sheet].ctx);
    };

    const ssTabs = document.querySelectorAll('.ss-tab');
    ssTabs.forEach((t) =>
      t.addEventListener('click', () => {
        ssTabs.forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        sheet = t.dataset.sheet;
        render();
      })
    );

    cm.on('change', render);
    render();
  }

  function renderScriptBlock(src, ctx) {
    // Extract the script block; fall back to full source.
    const scriptMatch = src.match(/script\s*:\s*"""([\s\S]*?)"""/m);
    let body = scriptMatch ? scriptMatch[1] : src;

    // Highlight unresolved + substitute resolved.
    const escaped = escape(body)
      .replace(/\$\{([^}]+)\}/g, (m, key) => {
        const trimmed = key.trim();
        if (ctx[trimmed] !== undefined) {
          return `<span class="param">${escape(ctx[trimmed])}</span>`;
        }
        return `<span style="color: var(--amber)">${escape(m)}</span>`;
      })
      .replace(/\\\n/g, '\\\n');

    return `
<div style="font-size:0.8em; color: var(--muted); margin-bottom:0.5em;">
  Substitution context · <span class="param">meta.id</span>=${escape(ctx['meta.id'])} ·
  <span class="param">meta.seq_type</span>=${escape(ctx['meta.seq_type'])} ·
  <span class="param">params.outdir</span>=${escape(ctx['params.outdir'])}
</div>
<div>${escaped.trim() || '<em style="color:var(--muted)">No script block found.</em>'}</div>`;
  }

  // ---------- 5) Executor profile tabs ----------
  const EXECUTOR_CONFIGS = {
    local: {
      label: 'Local · Docker',
      delta: [], // baseline
      code: `// nextflow.config — local workstation, Docker engine
profiles {
    docker {
        docker.enabled         = true
        singularity.enabled    = false
        process.container      = 'quay.io/biocontainers/...'
    }
}

process {
    executor = 'local'   // run tasks as local subprocesses
    cpus     = 4
    memory   = '8 GB'
}

// invoked as:
// nextflow run nf-core/hlatyping -profile docker --input samplesheet.csv --outdir results/`,
    },
    singularity: {
      label: 'HPC · Singularity',
      delta: [
        ['container engine', '<code>docker</code> → <code>singularity</code>', 'rootless containers, the HPC norm'],
        ['+ autoMounts', '<code>singularity.autoMounts = true</code>', 'bind host paths automatically'],
      ],
      code: `// nextflow.config — HPC login node, Singularity / Apptainer
profiles {
    singularity {
        singularity.enabled    = true
        singularity.autoMounts = true
        docker.enabled         = false
    }
}

process {
    executor = 'local'   // tasks run on the same node; combine with SLURM below
}

// invoked as:
// nextflow run nf-core/hlatyping -profile singularity --input samplesheet.csv --outdir results/`,
    },
    slurm: {
      label: 'SLURM',
      delta: [
        ['executor', "<code>'local'</code> → <code>'slurm'</code>", 'tasks become scheduled cluster jobs'],
        ['+ queue / account', '<code>queue</code>, <code>clusterOptions</code>', 'where and on whose allocation jobs land'],
        ['+ retry scaling', '<code>{ 16.GB * task.attempt }</code>', 'auto-escalate resources on a failed attempt'],
        ['+ per-process override', '<code>withName: OPTITYPE</code>', 'give the ILP solver extra memory'],
      ],
      code: `// nextflow.config — SLURM cluster + Singularity
process {
    executor      = 'slurm'
    queue         = 'normal'
    clusterOptions = '--account=transplant_lab'

    cpus   = { 4   * task.attempt }
    memory = { 16.GB * task.attempt }
    time   = { 4.h  * task.attempt }

    withName: OPTITYPE { memory = { 32.GB * task.attempt } }
}
singularity.enabled    = true
singularity.autoMounts = true

// invoked as:
// nextflow run nf-core/hlatyping -profile singularity \\
//   --input samplesheet.csv --outdir s3://lab/runs/01/`,
    },
    awsbatch: {
      label: 'AWS Batch',
      delta: [
        ['executor', "<code>'local'</code> → <code>'awsbatch'</code>", 'cloud-managed compute environment'],
        ['+ aws block', '<code>region</code>, <code>batch.cliPath</code>', 'credentials and transfer tuning'],
        ['workDir', '<code>./work</code> → <code>s3://…</code>', 'intermediate files live in object storage'],
        ['container', 'per-process image required', 'no shared filesystem to fall back on'],
      ],
      code: `// nextflow.config — AWS Batch managed compute
aws {
    region = 'us-east-1'
    batch {
        cliPath  = '/usr/local/bin/aws'
        maxParallelTransfers = 8
    }
}

process {
    executor  = 'awsbatch'
    queue     = 'lab-spot-queue'
    container = 'quay.io/biocontainers/optitype:1.3.5--hdfd78af_3'
}

workDir = 's3://lab-nextflow-work/'

// invoked as:
// nextflow run nf-core/hlatyping -profile awsbatch \\
//   --input s3://lab-inputs/samplesheet.csv \\
//   --outdir s3://lab-outputs/runs/01/`,
    },
  };

  function initExecutorTabs() {
    const tabs = document.querySelectorAll('.exec-tab');
    const codeEl = document.getElementById('exec-code');
    const deltaEl = document.getElementById('exec-delta');
    if (!tabs.length || !codeEl) return;

    const render = (key) => {
      const cfg = EXECUTOR_CONFIGS[key];
      if (!cfg) return;
      codeEl.textContent = cfg.code;
      // Reveal.js Highlight plugin needs a re-run.
      if (window.hljs) {
        codeEl.removeAttribute('data-highlighted');
        delete codeEl.dataset.highlighted;
        try { window.hljs.highlightElement(codeEl); } catch (e) {}
      }
      if (deltaEl) {
        const rows = cfg.delta || [];
        const body = rows.length
          ? `<ul class="plain">${rows
              .map(
                ([what, change, why]) =>
                  `<li><strong>${escape(what)}</strong> — ${change}` +
                  ` <span style="color:var(--muted)">· ${escape(why)}</span></li>`
              )
              .join('')}</ul>`
          : `<p class="none">Baseline profile — every other tab is described relative to this one.</p>`;
        deltaEl.innerHTML = `<h4>What changed vs Local · Docker</h4>${body}`;
      }
    };

    tabs.forEach((t) =>
      t.addEventListener('click', () => {
        tabs.forEach((x) => x.classList.remove('active'));
        t.classList.add('active');
        render(t.dataset.exec);
      })
    );

    render('local');
  }

  // ---------- 6) Resume simulator ----------
  const RESUME_PROCESSES = [
    { name: 'PIPELINE_INITIALISATION', run1: 'run', run2: 'cache' },
    { name: 'CAT_FASTQ',               run1: 'run', run2: 'cache' },
    { name: 'FASTQC',                  run1: 'run', run2: 'cache' },
    { name: 'YARA_INDEX',              run1: 'run', run2: 'cache' },
    { name: 'YARA_MAPPER',             run1: 'run', run2: 'cache' },
    { name: 'OPTITYPE',                run1: 'run', run2: 'cache' },
    { name: 'HLAHD_INSTALL',           run1: 'skipped', run2: 'run' },
    { name: 'HLAHD',                   run1: 'skipped', run2: 'run' },
    { name: 'MULTIQC',                 run1: 'run', run2: 'run' },
    { name: 'PIPELINE_COMPLETION',     run1: 'run', run2: 'run' },
  ];

  function initResumeSimulator() {
    const r1 = document.getElementById('resume-run1');
    const r2 = document.getElementById('resume-run2');
    if (!r1 || !r2) return;

    const render = (col, key) =>
      RESUME_PROCESSES.map((p) => {
        const tag = p[key];
        const label =
          tag === 'run'     ? 'run'     :
          tag === 'cache'   ? 'cached'  :
          'skipped';
        return `<div class="resume-step">
                  <span>${escape(p.name)}</span>
                  <span class="tag ${tag}">${label}</span>
                </div>`;
      }).join('');

    r1.innerHTML = render('run1', 'run1');
    r2.innerHTML = render('run2', 'run2');
  }

  // ---------- 7) Execution-timeline (Gantt) mockup ----------
  // Mirrors pipeline_info/execution_timeline.html for one hlatyping sample.
  const GANTT_TASKS = [
    { name: 'PIPELINE_INIT', start: 0,   dur: 8,   cpu: '12%',  ram: '0.2 GB', status: 'cached' },
    { name: 'CAT_FASTQ',     start: 8,   dur: 22,  cpu: '38%',  ram: '0.6 GB', status: 'ok' },
    { name: 'FASTQC',        start: 30,  dur: 45,  cpu: '96%',  ram: '1.1 GB', status: 'ok' },
    { name: 'YARA_INDEX',    start: 30,  dur: 60,  cpu: '410%', ram: '4.8 GB', status: 'ok' },
    { name: 'YARA_MAPPER',   start: 90,  dur: 120, cpu: '780%', ram: '7.9 GB', status: 'ok' },
    { name: 'OPTITYPE',      start: 210, dur: 180, cpu: '185%', ram: '28.4 GB', status: 'peak' },
    { name: 'MULTIQC',       start: 390, dur: 35,  cpu: '42%',  ram: '1.3 GB', status: 'ok' },
  ];

  function initGantt() {
    const svg = document.getElementById('gantt-svg');
    const info = document.getElementById('gantt-info');
    if (!svg || !info) return;

    const W = 520, H = 300, padL = 124, padR = 10, padT = 10, padB = 24;
    const plotW = W - padL - padR;
    const rowH = (H - padT - padB) / GANTT_TASKS.length;
    const maxT = Math.max(...GANTT_TASKS.map((t) => t.start + t.dur));
    const xs = (t) => padL + (t / maxT) * plotW;

    // Time gridlines every ~100s
    let grid = '';
    for (let tk = 0; tk <= maxT; tk += 100) {
      const x = xs(tk);
      grid += `<line class="gantt-grid" x1="${x}" y1="${padT}" x2="${x}" y2="${H - padB}"/>
               <text class="gantt-tick" x="${x}" y="${H - padB + 14}">${tk}s</text>`;
    }

    const bars = GANTT_TASKS.map((t, i) => {
      const y = padT + i * rowH + rowH * 0.18;
      const h = rowH * 0.6;
      const x = xs(t.start);
      const w = Math.max(3, (t.dur / maxT) * plotW);
      const delay = (i * 0.08).toFixed(2);
      return `
        <g class="gantt-bar" data-i="${i}" tabindex="0" role="button"
           aria-label="${escape(t.name)} metrics">
          <text class="gantt-label" x="6" y="${y + h / 2}">${escape(t.name)}</text>
          <rect x="${x}" y="${y}" width="${w}" height="${h}"
                style="animation-delay:${delay}s"/>
        </g>`;
    }).join('');

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = grid + bars;

    const show = (i) => {
      const t = GANTT_TASKS[i];
      svg.querySelectorAll('.gantt-bar').forEach((g) =>
        g.classList.toggle('active', +g.dataset.i === i)
      );
      const badge =
        t.status === 'peak' ? '<span class="badge badge-value">peak RSS</span>' :
        t.status === 'cached' ? '<span class="badge badge-nfcore">cached</span>' :
        '<span class="badge badge-local">ok</span>';
      info.innerHTML = `
        <h3>${escape(t.name)} ${badge}</h3>
        <div class="metric"><span>Duration</span><span>${t.dur}s</span></div>
        <div class="metric"><span>CPU usage</span><span>${escape(t.cpu)}</span></div>
        <div class="metric"><span>Peak memory</span><span>${escape(t.ram)}</span></div>
        <div class="metric"><span>Started at</span><span>t+${t.start}s</span></div>`;
    };

    svg.querySelectorAll('.gantt-bar').forEach((g) => {
      const i = +g.dataset.i;
      g.addEventListener('mouseenter', () => show(i));
      g.addEventListener('focus', () => show(i));
    });

    // Default to the resource hotspot — the ILP solver.
    show(5);
  }

  // ---------- 8) Seqera Platform dashboard mockup ----------
  function initSeqera() {
    const mount = document.getElementById('seqera-mount');
    if (!mount) return;

    const dials = [
      { cap: 'CPU efficiency', pct: 88 },
      { cap: 'Cache hits',     pct: 64 },
      { cap: 'Memory used',    pct: 73 },
    ];
    const r = 28;
    const circ = 2 * Math.PI * r;

    const dialSvg = (d) => {
      const off = (circ * (1 - d.pct / 100)).toFixed(1);
      return `
        <div class="dial">
          <svg viewBox="0 0 80 80" role="img" aria-label="${escape(d.cap)} ${d.pct}%">
            <circle class="ring-bg" cx="40" cy="40" r="${r}"/>
            <circle class="ring-fg" cx="40" cy="40" r="${r}"
                    stroke-dasharray="${circ.toFixed(1)}"
                    style="--circ:${circ.toFixed(1)}; --off:${off}"/>
            <text class="ring-val" x="40" y="41">${d.pct}%</text>
          </svg>
          <div class="dial-cap">${escape(d.cap)}</div>
        </div>`;
    };

    const done = 142, total = 200;
    const pct = Math.round((done / total) * 100);
    mount.innerHTML = `
      <div class="dash-head"><span class="live-dot"></span>
        RUNNING · nf-core/hlatyping · run <code>festering_curie</code></div>
      <div class="progress-label">
        <span>${done} / ${total} samples complete</span>
        <span>~22 tasks/min</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="--pct:${pct}%"></div>
      </div>
      <div class="dials">${dials.map(dialSvg).join('')}</div>`;
  }

  // ---------- helpers ----------
  function escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
