/**
 * Blog generator for Savage Skin.
 *
 * Reads the finished posts in ../Blog/*.md, parses the "SEO SETTINGS" block,
 * converts the markdown body to HTML, rewrites internal links to this site's
 * paths, pulls the FAQ section into accordions + FAQPage JSON-LD, and writes
 * fully static, SEO-ready pages into blog/<slug>/index.html plus a blog index.
 *
 * Edit a markdown file, then run:  npm run blog
 */
import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOG_SRC = resolve(ROOT, '../Blog');
const SITE = 'https://savageskincare.com';
const OG_IMAGE = `${SITE}/atmosphere.jpg`;
const AUTHOR = 'Brianna Savage';

marked.setOptions({ gfm: true, breaks: false });

// Display order on the index = newest first. Dates are staggered biweekly.
const POSTS = [
  { file: '09_Post_How_To_Read_A_Skincare_Label.md',  date: '2026-07-13', category: 'Transparency' },
  { file: '05_LIP_Post_Fix_Chapped_Lips.md',          date: '2026-06-01', category: 'Lip Care' },
  { file: '06_LIP_Post_Balm_vs_Mask_vs_Oil.md',       date: '2026-05-18', category: 'Lip Care' },
  { file: '07_LIP_Post_Do_Lip_Plumpers_Work.md',      date: '2026-05-04', category: 'Lip Care' },
  { file: '01_Post_Teen_Skincare_Routine.md',         date: '2026-04-20', category: 'Teen Skincare' },
  { file: '02_Post_Can_Teens_Use_Actives.md',         date: '2026-04-06', category: 'Teen Skincare' },
  { file: '03_Post_Teen_Acne_Without_Wrecking_Barrier.md', date: '2026-03-23', category: 'Teen Skincare' },
];

// --- helpers ---------------------------------------------------------------

const esc = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const stripMd = (s = '') =>
  s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
   .replace(/\*\*([^*]+)\*\*/g, '$1')        // bold
   .replace(/\*([^*]+)\*/g, '$1')            // italic
   .replace(/`([^`]+)`/g, '$1')              // code
   .replace(/\s+/g, ' ')
   .trim();

const humanDate = (iso) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });

function productHref(text) {
  const t = text.toLowerCase();
  if (t.includes('clean start')) return '/products/clean-start-cleanser/';
  if (t.includes('dew guard')) return '/products/dew-guard-moisturizer/';
  if (t.includes('prime time')) return '/products/prime-time-toner/';
  if (t.includes('power fix')) return '/products/power-fix-spot-corrector/';
  if (t.includes('lip')) return '/products/glass-glow-lip-gloss/';
  return '/shop/';
}

function fixLinks(md) {
  return md
    .replace(/\]\(\/blogs\/news\/([a-z0-9-]+)\)/g, '](/blog/$1/)')
    .replace(/\]\(\/blogs\/news\)/g, '](/blog/)')
    .replace(/\[([^\]]+)\]\(\/products\)/g, (_m, text) => `[${text}](${productHref(text)})`);
}

function parseSeo(header) {
  const grab = (label) => {
    const m = header.match(new RegExp('^' + label + ':\\s*(.+)$', 'm'));
    return m ? m[1].trim() : '';
  };
  return {
    keyword: grab('Target keyword'),
    titleTag: grab('Title tag'),
    slug: grab('URL slug'),
    metaDesc: grab('Meta description'),
    tags: grab('Tags').split(',').map((t) => t.trim()).filter(Boolean),
    imgAlt: grab('Featured image alt text'),
  };
}

function parseFaq(faqMd) {
  const items = [];
  const re = /\*\*([^*]+?)\*\*\s*\n+([\s\S]*?)(?=\n\s*\*\*|$)/g;
  let m;
  while ((m = re.exec(faqMd))) {
    const q = m[1].trim();
    const aMd = m[2].trim();
    if (!q || !aMd) continue;
    items.push({
      q,
      aHtml: marked.parseInline(fixLinks(aMd)),
      aText: stripMd(aMd),
    });
  }
  return items;
}

function cleanFooter(footerMd) {
  return footerMd
    .replace(/Brianna \[Last Name\]/g, AUTHOR)
    .replace(/\s*\[Medically reviewed by \[Name\], \[credentials\]\.\]/g, '')
    .split('\n')
    .map((l) => l.trim().replace(/^\*+|\*+$/g, '').trim())
    .filter(Boolean);
}

function wrap(text, max) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function makeCover(title, category) {
  const lines = wrap(title, 20).slice(0, 4);
  const startY = 340 - (lines.length - 1) * 34;
  const tspans = lines
    .map((l, i) => `<tspan x="80" y="${startY + i * 68}">${esc(l)}</tspan>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#faf6f0"/>
      <stop offset="1" stop-color="#f0e7da"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.7">
      <stop offset="0" stop-color="#ff2d95" stop-opacity="0.20"/>
      <stop offset="1" stop-color="#ff2d95" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.12" cy="0.95" r="0.6">
      <stop offset="0" stop-color="#b026ff" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#b026ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <rect x="14" y="14" width="1172" height="602" rx="20" fill="none" stroke="#0a0a14" stroke-opacity="0.08"/>
  <text x="80" y="120" font-family="'JetBrains Mono', monospace" font-size="22" letter-spacing="6" fill="#d81f7a">/ ${esc(category.toUpperCase())}</text>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="500" fill="#0a0a14">${tspans}</text>
  <text x="80" y="560" font-family="Georgia, serif" font-size="26" fill="#0a0a14">Savage<tspan fill="#ff2d95">/</tspan>Skin</text>
</svg>`;
}

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">`;

const NAV = `<nav class="top">
  <a href="/" class="brand magnetic"><span class="mark"></span><span>Savage<em style="font-style:normal;color:var(--neon)">/</em>Skin</span></a>
  <div class="nav-links">
    <a href="/shop/" class="magnetic">Product</a>
    <a href="/shop/#science" class="magnetic">Science</a>
    <a href="/blog/" class="magnetic" aria-current="page">Journal</a>
    <a href="/founders/" class="magnetic">Story</a>
    <a href="/faq/" class="magnetic">FAQ</a>
  </div>
  <a href="/#join" class="nav-cart">Join the movement</a>
</nav>`;

const FOOTER = `<footer>
  <div class="foot-grid">
    <div class="foot-brand">
      <h3>Savage<em style="font-style:normal;color:var(--neon)">/</em>Skin</h3>
      <p>Clean, confident skincare — real actives, real percentages, in plain English on the label. Results vary. Not medical advice.</p>
    </div>
    <div class="foot"><h5>Products</h5><ul>
      <li><a href="/products/clean-start-cleanser/">Clean Start Cleanser</a></li>
      <li><a href="/products/prime-time-toner/">Prime Time Toner</a></li>
      <li><a href="/products/power-fix-spot-corrector/">Power Fix Spot Corrector</a></li>
      <li><a href="/products/dew-guard-moisturizer/">Dew Guard Moisturizer</a></li>
      <li><a href="/products/glass-glow-lip-gloss/">Lip Service</a></li>
    </ul></div>
    <div class="foot"><h5>Help</h5><ul><li><a href="/blog/">Journal</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/shipping-returns/">Shipping &amp; Returns</a></li><li><a href="/founders/">Our Story</a></li><li><a href="/#join">Join the movement</a></li></ul></div>
    <div class="foot"><h5>Connect</h5><ul><li><a href="https://www.instagram.com/savageskincare_4teens/" target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href="mailto:hello@savageskincare.com">hello@savageskincare.com</a></li></ul></div>
  </div>
  <div class="foot-bottom">
    <div>© 2026 Savage Skin — All rights reserved</div>
    <ul class="foot-policies" aria-label="Legal policies">
      <li><a href="/privacy/">Privacy</a></li>
      <li><a href="/terms/">Terms</a></li>
      <li><a href="/shipping-returns/#returns">Refund</a></li>
      <li><a href="/shipping-returns/">Shipping</a></li>
      <li><a href="/cookies/">Cookies</a></li>
    </ul>
    <div>Bold, not harsh.</div>
  </div>
</footer>`;

function postPage(p) {
  const url = `${SITE}/blog/${p.slug}/`;
  const cta = p.category === 'Lip Care'
    ? { href: '/products/glass-glow-lip-gloss/', label: 'Shop Lip Service' }
    : { href: '/shop/', label: 'See the lineup' };

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title.slice(0, 110),
    description: p.metaDesc,
    image: OG_IMAGE,
    datePublished: p.date,
    dateModified: p.date,
    author: { '@type': 'Person', name: AUTHOR, url: `${SITE}/founders/` },
    publisher: {
      '@type': 'Organization',
      name: 'Savage Skin',
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.aText },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE}/blog/` },
      { '@type': 'ListItem', position: 3, name: p.title, item: url },
    ],
  };

  const faqHtml = p.faq.map((f) => `        <details class="faq-item">
          <summary>${esc(f.q)}</summary>
          <div class="faq-body"><p>${f.aHtml}</p></div>
        </details>`).join('\n');

  const bylineHtml = p.footer.map((l, i) =>
    `<p class="${i === 0 ? 'post-byline-author' : 'post-byline-note'}">${marked.parseInline(fixLinks(l))}</p>`
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(p.titleTag)}</title>
<meta name="description" content="${esc(p.metaDesc)}" />
<link rel="canonical" href="${url}" />
<meta name="author" content="${AUTHOR}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Savage Skin" />
<meta property="og:title" content="${esc(p.titleTag)}" />
<meta property="og:description" content="${esc(p.metaDesc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="article:published_time" content="${p.date}" />
<meta property="article:author" content="${AUTHOR}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(p.titleTag)}" />
<meta name="twitter:description" content="${esc(p.metaDesc)}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="icon" type="image/png" href="/logo.png" />
${FONTS}
<script type="application/ld+json">${JSON.stringify(articleLd)}</script>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
</head>
<body class="pdp-body">

<div class="bg-mesh"></div>
<div class="scroll-progress" id="scrollProgress"></div>

<div class="layer">

${NAV}

<div class="pdp-crumb">
  <div class="container">
    <a href="/" class="magnetic">Home</a>
    <span class="sep">/</span>
    <a href="/blog/" class="magnetic">Journal</a>
    <span class="sep">/</span>
    <span class="current">${esc(p.title)}</span>
  </div>
</div>

<main>
  <article class="content-page blog-post">
    <div class="container content-narrow">
      <div class="reveal"><div class="section-tag">/ ${esc(p.category)}</div></div>
      <h1 class="content-title reveal d1">${esc(p.title)}</h1>
      <div class="post-meta reveal d2">
        <span>By <strong>${AUTHOR}</strong>, Founder of Savage Skin</span>
        <span class="post-dot">·</span>
        <time datetime="${p.date}">${humanDate(p.date)}</time>
        <span class="post-dot">·</span>
        <span>${p.readingTime} min read</span>
      </div>
      <figure class="post-figure reveal d2">
        <img src="cover.svg" width="1200" height="630" alt="${esc(p.imgAlt)}" />
      </figure>
      <div class="content-prose blog-prose reveal d2">
${p.bodyHtml}
      </div>
      <section class="post-faq reveal d2" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently asked questions</h2>
        <div class="faq-list">
${faqHtml}
        </div>
      </section>
      <div class="post-byline reveal d3">
        ${bylineHtml}
      </div>
      <div class="content-cta reveal d3">
        <a href="${cta.href}" class="btn btn-primary magnetic"><span>${cta.label} <span class="arr">→</span></span></a>
        <a href="/blog/" class="btn btn-ghost magnetic"><span>More from the Journal</span></a>
      </div>
    </div>
  </article>
</main>

${FOOTER}

</div>

<script type="module" src="/src/content-page.js"></script>
</body>
</html>
`;
}

function indexPage(posts) {
  const url = `${SITE}/blog/`;
  const cards = posts.map((p) => `        <a class="blog-card reveal" href="/blog/${p.slug}/">
          <div class="blog-card-media"><img src="/blog/${p.slug}/cover.svg" alt="${esc(p.imgAlt)}" loading="lazy" width="1200" height="630" /></div>
          <div class="blog-card-body">
            <div class="blog-card-cat">${esc(p.category)}</div>
            <h2 class="blog-card-title">${esc(p.title)}</h2>
            <p class="blog-card-excerpt">${esc(p.excerpt)}</p>
            <div class="blog-card-meta"><time datetime="${p.date}">${humanDate(p.date)}</time> · ${p.readingTime} min read</div>
          </div>
        </a>`).join('\n');

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/blog/${p.slug}/`,
      name: p.title,
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>The Savage Skin Journal — Lip Care & Teen Skincare Guides</title>
<meta name="description" content="Honest, derm-informed guides on lip care and teen skincare — chapped lips, lip plumpers, first routines, actives, and clearing acne without wrecking your skin." />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Savage Skin" />
<meta property="og:title" content="The Savage Skin Journal — Lip Care & Teen Skincare Guides" />
<meta property="og:description" content="Honest, derm-informed guides on lip care and teen skincare that actually work." />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="The Savage Skin Journal" />
<meta name="twitter:description" content="Honest, derm-informed guides on lip care and teen skincare that actually work." />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="icon" type="image/png" href="/logo.png" />
${FONTS}
<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>
</head>
<body class="pdp-body">

<div class="bg-mesh"></div>
<div class="scroll-progress" id="scrollProgress"></div>

<div class="layer">

${NAV}

<div class="pdp-crumb">
  <div class="container">
    <a href="/" class="magnetic">Home</a>
    <span class="sep">/</span>
    <span class="current">Journal</span>
  </div>
</div>

<main>
  <section class="content-page">
    <div class="container">
      <div class="blog-head content-narrow">
        <div class="reveal"><div class="section-tag">/ The Journal</div></div>
        <h1 class="content-title reveal d1">Skincare for your lips, <em>decoded.</em></h1>
        <p class="content-lead reveal d2">Honest, science-backed guides on lip care and teen skincare — what actually works, what's a waste, and how to do it without wrecking your skin.</p>
      </div>
      <div class="blog-grid">
${cards}
      </div>
    </div>
  </section>
</main>

${FOOTER}

</div>

<script type="module" src="/src/content-page.js"></script>
</body>
</html>
`;
}

// --- build -----------------------------------------------------------------

const built = [];

for (const cfg of POSTS) {
  const raw = readFileSync(resolve(BLOG_SRC, cfg.file), 'utf8');
  const h1Index = raw.search(/^# /m);
  if (h1Index === -1) throw new Error(`No H1 found in ${cfg.file}`);

  const header = raw.slice(0, h1Index);
  const body = raw.slice(h1Index);
  const seo = parseSeo(header);

  const title = body.match(/^# (.+)$/m)[1].trim();
  let rest = body.replace(/^# .+$/m, '').trim();

  const [mainMd, afterFaqRaw = ''] = rest.split(/^## FAQ\s*$/m);
  const [faqMd = '', footerMd = ''] = afterFaqRaw.split(/^---\s*$/m);

  const main = mainMd.trim();
  const bodyHtml = marked.parse(fixLinks(main));
  const faq = parseFaq(faqMd);
  const footer = cleanFooter(footerMd);

  const words = stripMd(main).split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(words / 200));

  const firstPara = main.split(/\n\s*\n/).find((b) => b && !b.startsWith('#')) || '';
  let excerpt = stripMd(firstPara);
  if (excerpt.length > 165) excerpt = excerpt.slice(0, 162).replace(/\s+\S*$/, '') + '…';

  const post = {
    ...cfg, ...seo, title, bodyHtml, faq, footer, readingTime, excerpt,
  };

  const coverSvg = makeCover(title, cfg.category);
  const outDir = resolve(ROOT, 'blog', seo.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'cover.svg'), coverSvg);
  writeFileSync(resolve(outDir, 'index.html'), postPage(post));
  // Vite only copies files under public/ into the production build — a cover.svg
  // written into blog/<slug>/ is NOT bundled and 404s on the live site. Emit a
  // copy into public/blog/<slug>/ so the deployed pages can load it.
  const pubCoverDir = resolve(ROOT, 'public', 'blog', seo.slug);
  mkdirSync(pubCoverDir, { recursive: true });
  writeFileSync(resolve(pubCoverDir, 'cover.svg'), coverSvg);
  built.push(post);
  console.log(`  ✓ blog/${seo.slug}/  (${readingTime} min, ${faq.length} FAQs)`);
}

mkdirSync(resolve(ROOT, 'blog'), { recursive: true });
writeFileSync(resolve(ROOT, 'blog', 'index.html'), indexPage(built));
console.log(`  ✓ blog/  (index, ${built.length} posts)`);

// Emit the vite input lines so they can be pasted into vite.config.js if needed.
console.log('\nvite inputs:');
console.log(`        blog: resolve(__dirname, 'blog/index.html'),`);
for (const p of built) {
  const key = 'blog_' + p.slug.replace(/-/g, '_');
  console.log(`        ${key}: resolve(__dirname, 'blog/${p.slug}/index.html'),`);
}
