# Sandøy Explorer

Interaktivt natur- og turkart over Søndre Sandøy i Hvaler. React + TypeScript + Vite + Leaflet.

## Kom i gang

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # enhetstester (GPX, eksport, sol)
npm run build      # produksjonsbygg i dist/
```

Test GPX-import med `samples/eksempel-radiacode-spor.gpx` (syntetisk spor).

## Publisering (GitHub Pages)

Appen er en ren statisk side, bygd med relativ base (`base: './'`), så `dist/` kan legges hvor som helst.

1. Lag et tomt repo på GitHub og push `main`.
2. I repoet: **Settings → Pages → Source: «GitHub Actions»**.
3. Hver push til `main` kjører [.github/workflows/deploy.yml](.github/workflows/deploy.yml): tester, bygg og publisering til `https://<bruker>.github.io/<repo>/`.

Bygget setter `VITE_FEEDBACK_URL` til repoets «New issue»-side, så knappen «Gi tilbakemelding» (velkomstvinduet og Meny) åpner et ferdig utfylt issue med versjon, skjermstørrelse og nettleser. Uten variabelen skjules knappen. Testere trenger en (gratis) GitHub-konto for å skrive issues; vil du ha et skjema uten konto, sett `VITE_FEEDBACK_URL` til f.eks. et Google- eller Microsoft-skjema.

## For testere

- Første besøk viser et velkomstvindu med en kort bruksanvisning. Det kan åpnes igjen under Meny → «Slik bruker du kartet». Øk `WELCOME_VERSION` i [src/config.ts](src/config.ts) for å vise det på nytt etter store endringer.
- Versjon (commit-id) og byggedato vises i Meny, og legges ved tilbakemeldinger.
- Appen kan legges på hjemskjermen (manifest og ikoner i `public/`). Den virker ikke offline ennå.
- Testere starter i Utforsk-modus. Redigering kan slås på i Meny, men egne registreringer lagres bare på deres egen enhet.
- Krasjer noe, vises en feilside med «Last inn på nytt» i stedet for hvit skjerm; data på enheten røres ikke.

## Kartgrunnlag (offentlige data, ingen innlogging)

| Lag | Kilde | Merknad |
| --- | --- | --- |
| Topografisk (standard) | Kartverket `cache.kartverket.no` | Åpen WMTS, CC BY 4.0 |
| Gråtone | Kartverket | Åpen WMTS |
| OpenStreetMap | tile.openstreetmap.org | Kun visning, ingen konto trengs |
| Kulturminner | Riksantikvaren OGC API Features (`api.ra.no`) | Åpne data. Hentes for Hvaler kommune, filtreres til øya, mellomlagres 30 dager |
| Eldre bygninger | Riksantikvaren OGC API Features, SEFRAK-registeret (`api.ra.no/KulturminnerSEFRAKbygninger`) | NLOD. Hentes med bbox for øya (ca. 340 bygninger), mellomlagres 30 dager. Koder oversettes med SOSI-spesifikasjonen «Kulturminner – SEFRAK» 20160503 i `src/features/buildings/sefrakApi.ts`. Under zoom 15 vises bare meldepliktige (før 1850) |
| Tidevann | Kartverket «Se havnivå» (`vannstand.kartverket.no`) | Stasjon Viker. Krever kildehenvisning |
| Fergetider | Østfold kollektivtrafikk, Hvalerferga D 801 | Lagt inn som data i `src/features/ferry/timetables.ts` |
| Kjente turruter og kjente plasser | Turkart fra Havely Bryggerhus (Facebook 2020), stedfestet via Kartverket/OSM | `src/features/guide/guide.ts`. Bare Hovedveien har linje (fra OSM); Hjertestien og Kløverstien tegnes inn av brukeren. Plasser kan flyttes (dra eller «Velg i kartet»); flyttinger lagres lokalt som overstyringer, aldri i kildedataene |

**Historier** (kategori `historie`) er små merker på hus og steder, i `GUIDE_SPOTS` med egne `sources`. Tekstene skrives med egne ord, og ikke klipp inn bøker, avisartikler eller bilder uten tillatelse. Nye historier kan også lages i appen: nytt punkt i kategorien «Historier», og «Publiser for alle».

Nye offentlige lag legges til i [src/map/publicLayers.ts](src/map/publicLayers.ts).

> Før appen publiseres for mange brukere: OSM sine fliser har en bruksregel som ikke tillater tung bruk i apper. Kartverket er derfor standard.

## Utforsk- og redigeringsmodus

Appen starter i **Utforsk** (for alle): kart, publisert innhold, kjente turruter og plasser, kulturminner, ferge og sol – ingen redigering. **Redigering** (for den som vedlikeholder kartet) slås på under ⚙ Meny → Innstillinger og gir egne registreringer, stier, GPX og eksport. Valget lagres på enheten.

**Publisering fra appen**: i Redigering har hvert eget punkt og hver godkjent sti knappen «Publiser for alle». Appen skriver da objektet (og bildene) inn i `public/data/publisert.geojson` / `public/data/bilder/` i GitHub-repoet via GitHub sitt Contents-API, og publiseringsjobben oppdaterer siden for alle etter 1–2 minutter. Det krever en fine-grained GitHub-nøkkel med «Contents: Read and write» på dette repoet, som administratoren selv legger inn under Meny → Publisering; den lagres bare i nettleseren på den enheten og fungerer som admin-passord. Sårbare objekter og sti-utkast kan ikke publiseres. Publiserte punkter vises under «Kjente plasser» i riktig gruppe, publiserte stier under «Kjente turruter». En sti laget med «Lag eget sti-utkast av linja» erstatter den kjente ruta når den publiseres.

> Fordi appen committer til `main`, må du kjøre `git pull` før du jobber videre lokalt.

## Bilder

Bilder legges til på punkter og stier i detaljvisningen (kamera eller filvelger på mobil). De komprimeres til maks 1600 px JPEG og lagres i IndexedDB på enheten (`src/features/photos/photoStore.ts`), aldri i `localStorage` eller i GeoJSON-egenskapene. Når en registrering slettes, slettes bildene. Eksport med «Ta med bilder» gir en zip med GeoJSON + `bilder/<id>.jpg`, og i den fila peker `properties.photos` på bildestiene; import av zip legger bildene tilbake i IndexedDB. Publisert innhold bruker samme `photos`-stier relativt til `public/data/`.

## Fergetider og bestilling

Rutetabellen ligger som TypeScript-data (én `Trip` per kolonne i PDF-en). Når en ny sesongtabell publiseres: legg til et nytt `Timetable`-objekt i `TIMETABLES` med `validFrom` (og sett `validTo` på den forrige). Appen velger tabell etter dato og advarer når ingen tabell dekker datoen.

Bestillingsknappen åpner `ostfold-kollektiv.no/bestilling-hvalerferga` med fra, til og dato ferdig utfylt (stoppested-ID-er fra Nasjonalt stoppestedsregister). Selve bestillingen krever innlogging der.

Avganger som kun kjøres lørdag (gulmerket i PDF-en, i høsttabellen bare 08:10) har `days: 'lor'`.

## Prinsipper i koden

- **Offentlig vs. privat**: offentlige kartdata ligger kun i `src/map/publicLayers.ts`. Egne registreringer ligger i `src/data/` og lagres i `localStorage` på enheten.
- **Sårbare data**: geologi (inkl. mineralforekomster) er sårbar som standard, men kan skrus av per punkt. Andre objekter kan merkes sårbare. Den gamle kategorien «mineraler» migreres automatisk til geologi + sårbar. Sårbare objekter tas aldri med i «Delbar eksport». Ingenting er delbart før brukeren selv krysser av for det.
- **GPS-spor ≠ sti**: GPX-import lager `track`-objekter (rådata). En sti (`path`) lages bare når brukeren trykker «Lag sti-utkast», og starter alltid som `utkast`. Bare en eksplisitt «Godkjenn sti» gir `godkjent`. Også linjer fra fremmede GeoJSON-filer blir utkast.
- **GPX-metadata bevares**: tidsstempler og per-punkt-utvidelser som `@tmcw/togeojson` klarer å lese, lagres på sporet for senere strålingsanalyse. Ikke testet mot en ekte Radiacode-fil ennå.

## Struktur

```
src/
  data/          datamodell, lokal lagring, GPX- og GeoJSON-import/eksport
  map/           kartvisning, offentlige lag, tema-lag, tegne-/redigeringsverktøy, ikoner
  features/
    layers/      lagpanel
    data/        import/eksport og objektliste
    details/     detaljer/redigering av valgt objekt
    poi/         skjema for interessepunkter
    sun/         solberegning, panel og solpil i kartet
    tide/        tidevann fra Kartverket
    conditions/  «beste tid» per plass og live sol/tidevann
    ferry/       rutetabeller, neste avgang og bestillingslenker
    heritage/    kulturminner fra Riksantikvaren (offentlig lag)
    buildings/   eldre bygninger fra SEFRAK-registeret (offentlig lag)
    published/   visning av publisert innhold (skrivebeskyttet)
    photos/      bilder på registreringer (IndexedDB, komprimering, galleri)
    settings/    modusvalg og publiseringsinfo
    guide/       kjente turer og plasser fra turkart (offentlig lag)
  test/          vitest-tester
```

Nye moduler (terrengskygger, turforslag, bilder, strålingsmålinger) legges til som egne mapper under `features/`, med kartlag i `map/`.

## Neste steg (forslag)

- Terrengskygger fra Kartverkets høydedata (DTM) i en egen modul `features/terrain`
- Visning av strålingsmålinger fra Radiacode-spor
- PWA/offline-støtte og pakking som app (f.eks. Capacitor)
