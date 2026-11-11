# Beállítás és első próba (fejlesztőnek)

Ez a dokumentum Vincének szól. A Renátának szóló útmutató a `Utmutato-Szerkesztes-Renata.pdf`.

## 1. Telepítés, sorrendben

1. **GitHub-tároló Renáta fiókjában.** Renáta nyit GitHub-fiókot (ingyenes), létrehoz egy üres tárolót. Add hozzá magad közreműködőként (írási joggal), majd töltsd fel a mappa tartalmát (a `node_modules` és a `dist` nélkül, a `.gitignore` ezt kezeli).
2. **Cloudflare Pages Renáta nevén.** Workers & Pages → Create → Pages → Connect to Git → a tároló. Beállítások:
   - Build command: `npm ci && npm run build`
   - Build output directory: `dist`
   - Ha a build Node-verzió miatt hibázik: környezeti változó `NODE_VERSION` = `22`
3. **Domain.** Renáta nevén regisztrálva, a Cloudflare-hez kötve (Custom domains). Ha nem `kilatoterasz.hu` lesz, írd át a `content/fix/site.json` `domain` mezőjét.
4. **Impresszum adatai.** Töltsd ki a `content/fix/site.json` `legal` részét. Amíg `[[...]]` mező marad, az éles build szándékosan leáll.
5. **Pages CMS.** Nyisd meg az app.pagescms.org oldalt, lépj be GitHub-fiókkal (Renátának is be kell lépnie, és neki kell telepítenie a GitHub-alkalmazást a tárolóra). A `.pages.yml` már a tárolóban van.

## 2. Első próba: mit kell ellenőrizni

A Pages CMS dokumentációjából nem derült ki minden részlet, ezért ezeket **egy valódi próbával** ellenőrizd, mielőtt az útmutatót Renátának adod:

| # | Ellenőrzés | Várt eredmény |
|---|---|---|
| 1 | A belépés után négy elem látszik: Nyitvatartás, Bemutatkozás (Rólunk), Étlap leírása, Ételképek az étlap mellett | Csak ez a négy, más fájl nem szerkeszthető |
| 2 | Az Étlap sorai és a Bekezdések lista: hozzáadás, törlés, szerkesztés | Működik, a mentés után a JSON-ban jó a szerkezet |
| 3 | A karakterkorlátok (`maxlength`) | A felület jelzi vagy megakadályozza a túl hosszú szöveget. Ha nem, az útmutató "tartsd be a hosszt" figyelmeztetése marad az egyetlen védelem |
| 4 | Képfeltöltés az Ételképek 1. helyén | A kép a `public/img/` mappába kerül, a mezőbe `/img/...` érték íródik |
| 5 | A fájlnév tisztítása (`rename: true`) | Ékezetes, szóközös fájlnév is rendben megy |
| 6 | Telefonos (iPhone) feltöltés | A kép kiválasztható, JPG-ként töltődik fel. Ha a HEIC nem megy, az útmutatóban jelzett "küldd el Vincének" a megoldás |
| 7 | Mentés → commit → Cloudflare build → élő oldal | Mérd meg az időt, és javítsd az útmutató "néhány perc" / "negyedóra" szövegét, ha eltér |
| 8 | A `.pages.yml` nem szerkeszthető Renáta számára | A Pages CMS dokumentációja szerint a kollaborátorok nem kezelhetik a konfigurációt |
| 9 | A Rólunk alatti négy kártya (Kőhegy, Kutyabarát, ár, Google-értékelés): beágyazott objektum mezők | Mindegyik szerkeszthető, a karakterkorlát érvényesül; mentés után az oldalon és a Vélemények pontszámában is megváltozik |
| 10 | A szerkesztés nem töri el az oldalt: tölts fel nagy telefonfotót, adj meg hosszú szöveget | A build lefut, az oldal rendben marad |

Ha bármelyik nem a vártnak megfelelően működik, a legvalószínűbb javítás a `.pages.yml` módosítása. A `docs/utmutato.html` szerkesztése és a PDF újragenerálása után (Playwright vagy a böngésző "Nyomtatás PDF-be") frissítsd a PDF-et is.

## 3. Alternatíva: szerkesztő GitHub-fiók nélkül

A Pages CMS dokumentációja említ olyan kollaborátort, akinek nincs GitHub-fiókja. A bejelentkezésének módja nem derült ki az átnézett oldalakból. Ha Renáta GitHub-fiók nélkül szeretne belépni, ezt külön próbáld ki, és ha működik, az útmutató "Belépés" részét írd át.

## 4. Ismert korlátok

- **GitHub-jogok:** a Pages CMS csak azt korlátozza, mit lát Renáta a szerkesztőfelületen. Mivel a tároló az ő fiókjában van, a GitHub oldalán technikailag bármit módosíthat. Az útmutató kéri, hogy ne tegye.
- **Képek:** csak három ételkép szerkeszthető, a többi (hero videó, Rólunk kép) fájlcserével módosítható.
- **Nyitvatartás:** egyetlen rövid felirat jelenik meg a hero-jelvényben és a láblécben. Az eredeti oldal láblécében más szöveg állt ("Szezonálisan, a Facebookon közzétett napokon"), most a felirat szerepel ott is.
- **Vélemények és értékelés:** kézzel megadott adatok, idővel elavulhatnak (a vendégidézetek: `content/fix/reviews.json`; a pontszám és a darabszám Renáta kártyájából jön).
- **Jogi szövegek:** az impresszum és az adatkezelési tájékoztató általános sablon, nem jogi tanács.
