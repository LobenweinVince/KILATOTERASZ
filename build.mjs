// Függőség: csak a "sharp" (képek átméretezéséhez). Használat:
//   node build.mjs                       éles build (hibával leáll, ha kitöltetlen [[...]] mező maradt az impresszum adataiban)
//   node build.mjs --allow-placeholders  előnézethez
// Bemenet: content/szerkesztheto/*.json (Renáta szerkeszti), content/fix/*.json (fejlesztő), src/*.html, public/
// Kimenet: dist/
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const allow = process.argv.includes("--allow-placeholders");
const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const warnings = [];
const warn = (m) => { warnings.push(m); console.warn("FIGYELEM: " + m); };

let sharp = null;
try { sharp = (await import("sharp")).default; } catch { warn("A sharp csomag nincs telepítve, a képek átméretezés nélkül kerülnek az oldalra (futtasd: npm install)."); }

const site = json("content/fix/site.json");
const fixAbout = json("content/fix/about.json");
const fixMenu = json("content/fix/menu.json");
const reviews = json("content/fix/reviews.json");
const nyit = json("content/szerkesztheto/nyitvatartas.json");
const bemutat = json("content/szerkesztheto/bemutatkozas.json");
const etlap = json("content/szerkesztheto/etlap.json");
const kepek = json("content/szerkesztheto/etelkepek.json");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const multi = (s) => esc(String(s ?? "").trim()).replace(/\r?\n/g, "<br>");
const host = site.domain.replace(/^https?:\/\//, "");

const flat = {
  ...Object.fromEntries(Object.entries(site).filter(([, v]) => typeof v === "string").map(([k, v]) => [k, esc(v)])),
  address_html: `${esc(site.address_line1)}<br>${esc(site.address_line2)}`,
  year: String(new Date().getFullYear()),
  domain_host: esc(host),
  // Renáta által szerkesztett: nyitvatartás
  hero_badge: esc(nyit.felirat),
  footer_hours: esc(nyit.felirat),
  season_text: multi(nyit.szoveg),
  // Renáta által szerkesztett: bemutatkozás
  about_title: esc(bemutat.cim),
  about_paragraphs: (bemutat.bekezdesek ?? []).filter((b) => String(b?.szoveg ?? "").trim()).map((b) => `<p>${multi(b.szoveg)}</p>`).join("\n      "),
  // fix tartalom (fejlesztő)
  hero_text: esc(fixAbout.hero_text),
};
// Renáta által szerkesztett: kártyák a Rólunk rész alatt (Kőhegy, Kutyabarát, ár, Google-értékelés). Az üres kártya kimarad.
const txt = (v) => String(v ?? "").trim();
const k = bemutat;
const facts = [];
const card = (title, text) => `<li><b>${esc(title)}</b><span>${esc(text)}</span></li>`;
if (txt(k.kohegy?.cim) || txt(k.kohegy?.szoveg)) facts.push(card(txt(k.kohegy?.cim), txt(k.kohegy?.szoveg)));
if (txt(k.kutyabarat?.cim) || txt(k.kutyabarat?.szoveg)) facts.push(card(txt(k.kutyabarat?.cim), txt(k.kutyabarat?.szoveg)));
const pont = txt(k.ertekeles?.pont), darab = txt(k.ertekeles?.darab);
if (pont && darab) facts.push(`<li><b>${esc(pont)} ★</b><span>${esc(darab)} Google-értékelés</span></li>`);
if (txt(k.ar?.osszeg)) facts.push(`<li><b>${esc(txt(k.ar.osszeg))}</b><span>átlagos költés fejenként</span></li>`);
flat.about_facts = facts.join("\n        ");
// A Vélemények rész pontszáma ugyanabból a két mezőből jön; ha egyik hiányzik, a blokk kimarad.
flat.rating_block = pont && darab ? `<div class="rating"><strong>${esc(pont)}</strong><span>átlagos értékelés a Google-on, ${esc(darab)} vendég véleménye alapján</span></div>` : "";
if (!(pont && darab)) warn("Hiányzik az értékelés pontszáma vagy darabszáma: a kártya és a Vélemények rész pontszáma kimarad.");

for (const [k, v] of Object.entries(site.legal)) flat[`legal.${k}`] = esc(v);

// Étlap
flat.menu_intro = esc(etlap.bevezeto);
flat.menu_rows = (etlap.sorok ?? []).filter((r) => String(r?.cim ?? "").trim() || String(r?.leiras ?? "").trim())
  .map((r) => `<li><h3>${esc(r.cim)}</h3><p>${esc(r.leiras)}</p></li>`).join("\n        ");
flat.menu_note = esc(fixMenu.note).replace(/Facebook(-oldal\w*)?/, (w) => `<a href="${esc(site.facebook)}" target="_blank" rel="noopener">${w}</a>`);

// Vélemények
const quote = (q, big) => {
  const lang = q.lang ? ` lang="${esc(q.lang)}"` : "";
  const tr = q.translation ? `\n          <p class="tr">${esc(q.translation)}</p>` : "";
  return `<figure class="q${big ? " big" : ""}">\n          <blockquote${lang}>${esc(q.text)}</blockquote>${tr}\n          <figcaption>${esc(q.author)}</figcaption>\n        </figure>`;
};
const [first, ...rest] = reviews.quotes;
flat.review_quotes = `\n      ${quote(first, true)}\n      <div class="qside">\n        ${rest.map((q) => quote(q, false)).join("\n        ")}\n      </div>`;

// Ételképek: legfeljebb 3 hely, a build átméretezi és AVIF-re alakítja őket; csak a használtak kerülnek a dist/img mappába.
rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(join(root, "dist"), { recursive: true });
cpSync(join(root, "public"), join(root, "dist"), { recursive: true });
rmSync(join(root, "dist/img"), { recursive: true, force: true });
mkdirSync(join(root, "dist/img"), { recursive: true });

const DEPTHS = ["0.1", "0.16", "0.08"];
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
async function preparePicture(slotName, slot, depth) {
  const val = String(slot?.fajl ?? "").trim();
  if (!val) return null;
  const name = basename(val.split("?")[0]);
  const candidates = [join(root, "public", val.replace(/^\/+/, "")), join(root, "public/img", name)];
  const src = candidates.find((c) => existsSync(c) && statSync(c).isFile());
  if (!src) { warn(`${slotName}: a kép nem található (${val}), kihagyva.`); return null; }
  const ext = extname(src).toLowerCase();
  if (!RASTER.has(ext)) { warn(`${slotName}: nem támogatott képformátum (${ext}), kihagyva.`); return null; }
  const stem = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "kep";
  let outName = `${stem}.avif`, width, height;
  try {
    if (sharp) {
      const meta = await sharp(src, { failOn: "none" }).metadata();
      const small = ext === ".avif" && statSync(src).size < 250 * 1024 && (meta.width ?? 0) <= 1100;
      if (small) { cpSync(src, join(root, "dist/img", outName)); width = meta.width; height = meta.height; }
      else {
        const info = await sharp(src, { failOn: "none" }).rotate().resize({ width: 900, height: 1125, fit: "inside", withoutEnlargement: true }).avif({ quality: 55 }).toFile(join(root, "dist/img", outName));
        width = info.width; height = info.height;
      }
    } else { outName = name; cpSync(src, join(root, "dist/img", outName)); }
  } catch (e) { warn(`${slotName}: a kép feldolgozása nem sikerült (${e.message}), kihagyva.`); return null; }
  const alt = String(slot?.leiras ?? "").trim() || "Étel a Kilátó Terasz kínálatából";
  const dim = width && height ? ` width="${width}" height="${height}"` : "";
  return `      <div class="plate" data-px><div class="layer" data-depth="${depth}"><img src="/img/${esc(outName)}" alt="${esc(alt)}"${dim} loading="lazy" decoding="async"></div></div>`;
}
const plates = [];
for (let i = 0; i < 3; i++) { const p = await preparePicture(`kep_${i + 1}`, kepek[`kep_${i + 1}`], DEPTHS[i]); if (p) plates.push(p); }
for (const k of Object.keys(kepek)) if (!/^kep_[123]$/.test(k)) warn(`Ismeretlen képmező: ${k}`);
flat.menu_pics = plates.length ? `<div class="menu-pics menu-pics--${plates.length}">\n${plates.join("\n")}\n    </div>` : "";
flat.menu_class = plates.length ? "" : " menu--single";

const fill = (tpl) => tpl.replace(/\{\{([\w.]+)\}\}/g, (_, k) => {
  if (!(k in flat)) throw new Error(`Ismeretlen mező: {{${k}}}`);
  return flat[k];
});

const schema = {
  "@context": "https://schema.org", "@type": "Restaurant", name: site.legal_name, alternateName: "Kilátó Terasz",
  url: `${site.domain}/`, image: `${site.domain}/og.jpg`, telephone: site.phone_tel.replace(/^\+36/, "+36 "),
  ...(txt(bemutat.ar?.osszeg) ? { priceRange: txt(bemutat.ar.osszeg) } : {}), servesCuisine: ["Magyar", "Pizza", "Lángos", "Grill"],
  address: { "@type": "PostalAddress", streetAddress: site.street, addressLocality: site.city, postalCode: site.postal_code, addressCountry: "HU" },
  geo: { "@type": "GeoCoordinates", latitude: Number(site.lat), longitude: Number(site.lng) },
  hasMap: `https://maps.google.com/?cid=${site.maps_cid}`, sameAs: [site.facebook],
  amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Kutyabarát", value: true }],
};

function page({ file, title, description, body, canonicalPath, home = false, noindex = false }) {
  const url = `${site.domain}${canonicalPath}`;
  const head = `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#15302a">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="restaurant">
<meta property="og:locale" content="hu_HU">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(site.domain)}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Kilátó Terasz, Zamárdi: szezonális vendéglátóhely a Kőhegyi kilátó mellett">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(site.domain)}/og.jpg">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/gloock-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
${home ? '<link rel="preload" as="image" href="/media/hero-garden-v2-poster.webp" type="image/webp" fetchpriority="high">\n' : ""}<link rel="stylesheet" href="/css/site.css">
${home ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>\n` : ""}</head>
<body>
${body}
${home ? '<script src="/js/site.js" defer></script>\n' : ""}</body>
</html>
`;
  writeFileSync(join(root, "dist", file), head);
}

page({ file: "index.html", title: site.name, description: site.description, body: fill(read("src/home.html")), canonicalPath: "/", home: true });
page({ file: "impresszum.html", title: `Impresszum – ${site.name}`, description: "A Kilátó Terasz weboldalának üzemeltetői adatai.", body: fill(read("src/pages/impresszum.html")), canonicalPath: "/impresszum.html" });
page({ file: "adatkezeles.html", title: `Adatkezelési tájékoztató – ${site.name}`, description: "Hogyan kezeli adatait a Kilátó Terasz weboldala.", body: fill(read("src/pages/adatkezeles.html")), canonicalPath: "/adatkezeles.html" });
page({ file: "404.html", title: `Az oldal nem található – ${site.name}`, description: "A keresett oldal nem található.", body: fill(read("src/pages/404.html")), canonicalPath: "/404.html", noindex: true });

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(root, "dist/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ["/", "/impresszum.html", "/adatkezeles.html"].map((p) => `  <url><loc>${site.domain}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n") + `\n</urlset>\n`);
writeFileSync(join(root, "dist/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
writeFileSync(join(root, "dist/site.webmanifest"), JSON.stringify({ name: site.name, short_name: "Kilátó Terasz", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png" }], theme_color: "#15302a", background_color: "#e3e9da", display: "browser", start_url: "/" }));

// Kitöltetlen helyőrzők ellenőrzése (csak a fejlesztő által kezelt impresszum-adatok)
const left = [];
const walk = (d) => { for (const e of readdirSync(join(root, d), { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(html|xml|txt|json|webmanifest)$/.test(e.name) && /\[\[[^\]]+\]\]/.test(readFileSync(join(root, p), "utf8"))) left.push(p); } };
walk("dist");
if (left.length) {
  const msg = `Kitöltetlen [[...]] mező: ${left.join(", ")}\nTöltsd ki a content/fix/site.json "legal" részét.`;
  if (allow) console.warn("FIGYELEM:\n" + msg); else { console.error("HIBA:\n" + msg + "\n(Előnézethez: node build.mjs --allow-placeholders)"); process.exit(1); }
}
console.log(`Kész: dist/ (${plates.length} ételkép, ${warnings.length} figyelmeztetés)`);
