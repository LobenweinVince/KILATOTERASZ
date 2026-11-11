// Gyors ellenőrzés: minden szerkeszthető JSON-fájl létezik, értelmezhető, és megvannak a szükséges mezők.
// Használat: node scripts/check.mjs
import { readFileSync } from "node:fs";
const root = new URL("../", import.meta.url).pathname;
const expect = {
  "content/szerkesztheto/nyitvatartas.json": { felirat: "string", szoveg: "string" },
  "content/szerkesztheto/bemutatkozas.json": { cim: "string", bekezdesek: "array", kohegy: "object", kutyabarat: "object", ar: "object", ertekeles: "object" },
  "content/szerkesztheto/etlap.json": { bevezeto: "string", sorok: "array" },
  "content/szerkesztheto/etelkepek.json": { kep_1: "object", kep_2: "object", kep_3: "object" },
};
let bad = 0;
for (const [file, keys] of Object.entries(expect)) {
  let data;
  try { data = JSON.parse(readFileSync(root + file, "utf8")); } catch (e) { console.error(`HIBA ${file}: ${e.message}`); bad++; continue; }
  for (const [k, t] of Object.entries(keys)) {
    const v = data[k];
    const ok = t === "array" ? Array.isArray(v) : t === "object" ? v && typeof v === "object" && !Array.isArray(v) : typeof v === t;
    if (!ok) { console.error(`HIBA ${file}: a(z) "${k}" mező hiányzik vagy nem ${t} típusú`); bad++; }
  }
}
console.log(bad ? `${bad} hiba` : "Rendben: minden szerkeszthető fájl megfelelő.");
process.exit(bad ? 1 : 0);
