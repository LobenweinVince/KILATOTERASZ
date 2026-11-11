# Kilátó Terasz weboldal (szerkeszthető változat)

Sima HTML, CSS és JavaScript, keretrendszer nélkül. Az oldalt egy rövid Node-script (`build.mjs`) építi össze a `content/` mappa adataiból a `dist/` mappába. A Renáta által szerkeszthető rész négy kis JSON-fájl, amit a Pages CMS űrlapokon mutat meg (`.pages.yml`).

Két külön dokumentum tartozik hozzá:
- `Utmutato-Szerkesztes-Renata.pdf`: az étterem tulajdonosának szóló útmutató (forrása: `docs/utmutato.html`).
- `docs/BEALLITAS-Vince.md`: telepítés, első próba, éles indítás (fejlesztőnek).

## Mi hol van

| Tartalom | Ki szerkeszti? | Hol? |
|---|---|---|
| Nyitvatartás (rövid felirat + szöveg) | Renáta | `content/szerkesztheto/nyitvatartas.json` |
| Bemutatkozás (Rólunk cím + bekezdések) | Renáta | `content/szerkesztheto/bemutatkozas.json` |
| Étlap leírása (bevezető + sorok) | Renáta | `content/szerkesztheto/etlap.json` |
| Ételképek az étlap mellett (3 hely) | Renáta | `content/szerkesztheto/etelkepek.json`, képek: `public/img/` |
| Telefon, cím, Facebook, impresszum-adatok | fejlesztő | `content/fix/site.json` |
| Hero-szöveg | fejlesztő | `content/fix/about.json` |
| Étlap alatti megjegyzés | fejlesztő | `content/fix/menu.json` |
| Vendégvélemények | fejlesztő | `content/fix/reviews.json` |
| Szerkezet, fejléc, lábléc | fejlesztő | `src/home.html`, `src/pages/` |
| Megjelenés, animáció | fejlesztő | `public/css/site.css`, `public/js/site.js` |

A Pages CMS (`.pages.yml`) csak az első négy sort mutatja Renátának. A többi fájl nincs felsorolva, így nem szerkeszthető a felületen.

## Parancsok

Szükséges: Node 20 vagy újabb (a `.nvmrc` a 22-est jelöli).

```
npm install                  # egyszer, a képfeldolgozó (sharp) miatt
npm run build:preview        # előnézeti build (engedi a kitöltetlen impresszum-adatokat)
npm run serve                # http://localhost:8080
npm run check                # a szerkeszthető fájlok ellenőrzése
npm run build                # éles build
```

Az éles build (`npm run build`) hibával leáll, ha a `content/fix/site.json` `legal` részében maradt kitöltetlen `[[...]]` mező, így nem kerülhet fel félkész impresszum.

## Mit csinál a build a képekkel?

A `content/szerkesztheto/etelkepek.json` három helyére (`kep_1`, `kep_2`, `kep_3`) mutató képeket átméretezi (legfeljebb 900×1125), automatikusan elforgatja a telefonos fotókat, és AVIF formátumra alakítja. Csak ezek kerülnek a `dist/img` mappába, az eredeti (nagy, esetleg helyadatot tartalmazó) fájlok nem. Hiányzó vagy hibás kép esetén a build figyelmeztet, a képet kihagyja, de nem áll le.

## Biztonság

- A szerkeszthető mezők szövege kódolva kerül az oldalra, nem lehet bele HTML-t vagy szkriptet írni.
- A `public/_headers` biztonsági fejlécek és gyorsítótárazás beállítását tartalmazza (Cloudflare Pages és Netlify is érti).
- Sütik és nyomkövetés nincs. A Google Térkép csak kattintásra tölt be.

## Betűtípusok

Figtree és Gloock (SIL Open Font License), a `public/fonts/` mappából töltődnek be.

## Fiókok (töltsd ki átadáskor)

| Mi | Kinek a nevén | Hol |
|---|---|---|
| Domain | | |
| GitHub tároló | | |
| Cloudflare | | |
| Pages CMS (GitHub-belépéssel) | | |
