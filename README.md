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

## Kartgrunnlag (offentlige data, ingen innlogging)

| Lag | Kilde | Merknad |
| --- | --- | --- |
| Topografisk (standard) | Kartverket `cache.kartverket.no` | Åpen WMTS, CC BY 4.0 |
| Gråtone | Kartverket | Åpen WMTS |
| OpenStreetMap | tile.openstreetmap.org | Kun visning, ingen konto trengs |
| Berggrunn | NGU WMS (`BerggrunnWMS3`) | Overlegg under «Offentlige kartdata» |
| Kulturminner | Riksantikvaren OGC API Features (`api.ra.no`) | Åpne data. Hentes for Hvaler kommune, filtreres til øya, mellomlagres 30 dager |
| Tidevann | Kartverket «Se havnivå» (`vannstand.kartverket.no`) | Stasjon Viker. Krever kildehenvisning |
| Fergetider | Østfold kollektivtrafikk, Hvalerferga D 801 | Lagt inn som data i `src/features/ferry/timetables.ts` |
| Kjente turruter og kjente plasser | Turkart fra Havely Bryggerhus (Facebook 2020), stedfestet via Kartverket/OSM | `src/features/guide/guide.ts`. Bare Hovedveien har linje (fra OSM); Hjertestien og Kløverstien tegnes inn av brukeren. Plasser kan flyttes (dra eller «Velg i kartet»); flyttinger lagres lokalt som overstyringer, aldri i kildedataene |

Nye offentlige lag legges til i [src/map/publicLayers.ts](src/map/publicLayers.ts).

> Før appen publiseres for mange brukere: OSM sine fliser har en bruksregel som ikke tillater tung bruk i apper. Kartverket er derfor standard.

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
    guide/       kjente turer og plasser fra turkart (offentlig lag)
  test/          vitest-tester
```

Nye moduler (terrengskygger, turforslag, bilder, strålingsmålinger) legges til som egne mapper under `features/`, med kartlag i `map/`.

## Neste steg (forslag)

- Terrengskygger fra Kartverkets høydedata (DTM) i en egen modul `features/terrain`
- Bilder koblet til punkter (IndexedDB)
- Visning av strålingsmålinger fra Radiacode-spor
- PWA/offline-støtte og pakking som app (f.eks. Capacitor)
