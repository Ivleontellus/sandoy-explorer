import type { LineString } from 'geojson'
import type { BestTimes, PoiCategory } from '../../data/model'
import hjertestien from './hjertestien.json'
import hovedveien from './hovedveien.json'
import kloverstien from './kloverstien.json'

/**
 * Kjente turer og plasser på Søndre Sandøy. OFFENTLIG informasjon fra turkartet
 * til Havely Bryggerhus (Facebook, 1. august 2020) og OpenStreetMap/Kartverket for stedfesting.
 * Dette er ikke brukerens registreringer og blandes aldri med dem.
 *
 * Hovedveien er hentet direkte fra OpenStreetMap. Hjertestien og Kløverstien finnes ikke
 * digitalt; linjene er REKONSTRUERT ved å rute gjennom OSMs vei- og stinett via stedene
 * turkartet viser (scratch-skript: route.cjs). De må kontrolleres på tur.
 */

export const GUIDE_ATTRIBUTION = 'Turkart: Havely Bryggerhus · stedfesting: Kartverket / OpenStreetMap'

export interface GuideTrail {
  id: string
  name: string
  color: string
  lengthKm: number
  description: string
  /** Stedsnavn turen går via, slik turkartet viser dem. */
  via: string[]
  geometry?: LineString
  /** Linja er rekonstruert fra OSM-stinettet, ikke offisielt oppmålt. */
  reconstructed?: boolean
  /** Publisert fra appen (det publiserte datasettet), ikke fra kildedataene her. */
  published?: boolean
}

export const GUIDE_TRAILS: GuideTrail[] = [
  {
    id: 'hovedveien',
    name: 'Hovedveien',
    color: '#1a237e',
    lengthKm: 2.5,
    description: 'Gruslagt vei fra Nedgården til Buvika (Gravningsund). Egner seg for sykkel, barnevogn og føtter.',
    via: ['Nedgården', 'Grendehuset', 'Veveriet', 'Bakkevika', 'Buvika'],
    geometry: hovedveien as LineString,
  },
  {
    id: 'hjertestien',
    name: 'Hjertestien',
    color: '#b71c1c',
    lengthKm: 4,
    description:
      'Rundtur i variert terreng: nordover Langåsveien, østover mot Buvika, rundt østsiden ned til badeplassen i Gjøkvika og tilbake gjennom skogen. Ca. 4 km langs stiene (turkartet oppgir 5 km).',
    via: ['Veveriet', 'Langåsveien', 'Buvikveien', 'Gjøkvika', 'Veveriet'],
    geometry: hjertestien as LineString,
  },
  {
    id: 'kloverstien',
    name: 'Kløverstien',
    color: '#1b5e20',
    lengthKm: 3,
    description: 'Rundtur fra krysset (Olasvingen) ovenfor Nedgården rundt Stuevika og Rød. Passer for gående, syklende og barnevogn.',
    via: ['Olasvingen', 'Veveriet', 'Stuevika', 'Rød'],
    geometry: kloverstien as LineString,
    reconstructed: true,
  },
]

/** Kjente plasser bruker de samme kategoriene som egne punkter. */
export type GuideSpotType = PoiCategory

export interface GuideSpot {
  id: string
  name: string
  type: GuideSpotType
  /** [lat, lon] */
  position: [number, number]
  note?: string
  /** Stedets egen nettside, vist som en tydelig knapp. */
  website?: string
  /** Når plassen er på sitt beste; gir live sol/tidevann i detaljvisningen. */
  bestTimes?: BestTimes
  source: string
  /** Lenker til kildene bak en historie. */
  sources?: { label: string; url: string }[]
  /** Posisjonen er et gjett eller ukjent; brukeren bør flytte markøren. */
  approximate?: boolean
  /** Bildestier relativt til public/data/ (bare publiserte plasser). */
  photos?: string[]
  /** Publisert fra appen; endres via egne registreringer + «Oppdater publisert». */
  published?: boolean
}

const MORNING_EVENING: BestTimes = { daypart: ['morgen', 'kveld'], tide: [] }
const ALL_DAY: BestTimes = { daypart: ['morgen', 'dag', 'kveld'], tide: [] }

/**
 * Plasseringene er kontrollert og justert lokalt (november 2026), med utgangspunkt i turkartet
 * og navneregistrene. Ikke justert ennå: Salta, Gjøkvika, Reiertangen, Stuevika badeplass,
 * Utkikkspunkt losen og Nordre Sandøy skole.
 */
export const GUIDE_SPOTS: GuideSpot[] = [
  // Fiske
  { id: 'f-lervika', name: 'Lervika', type: 'fiske', position: [59.020268, 11.073162], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-krossholmen', name: 'Krossholmen', type: 'fiske', position: [59.014256, 11.058061], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-salta', name: 'Salta', type: 'fiske', position: [59.01369, 11.06278], source: 'Turkart · Kartverket' },
  { id: 'f-sauholmen', name: 'Sauholmen', type: 'fiske', position: [59.009677, 11.057771], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-fiskekroken', name: 'Fiskekroken', type: 'fiske', position: [59.011588, 11.08807], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-gjokvika', name: 'Gjøkvika', type: 'fiske', position: [59.0174, 11.1054], source: 'Turkart · OpenStreetMap' },
  { id: 'f-reiertangen', name: 'Reiertangen', type: 'fiske', position: [59.01672, 11.10976], source: 'Turkart · Kartverket' },
  { id: 'f-storhavna', name: 'Storhavna', type: 'fiske', position: [59.021155, 11.112252], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-buvika', name: 'Buvika', type: 'fiske', position: [59.022969, 11.091889], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  // Bading og båt
  { id: 'b-stuevika', name: 'Stuevika', type: 'bade', position: [59.0084, 11.0833], note: 'Bade- og teltplass med sandstrand.', source: 'Turkart · OpenStreetMap' },
  {
    id: 'br-stuevika',
    name: 'Stuevika brygge',
    type: 'brygge',
    position: [59.009042, 11.085935],
    note: 'Av- og påstigningsbrygge som hører til Stuevika teltplass.',
    bestTimes: { daypart: [], tide: ['hoyvann', 'lavvann'] },
    source: 'Lokalkunnskap',
  },
  // Natur og utsikt
  { id: 'u-losen', name: 'Utkikkspunkt losen', type: 'utsikt', position: [58.9942, 11.0623], source: 'OpenStreetMap' },
  { id: 'n-blabaer', name: 'Blåbær', type: 'baer', position: [59.012754, 11.079454], note: 'Godt med blåbær langs stien.', source: 'Lokalkunnskap' },
  // Publisert etter eksplisitt ønske fra den som registrerte den (mineralforekomster holdes ellers private).
  {
    id: 'g-kvarts',
    name: 'Kvartsforekomst',
    type: 'geologi',
    position: [59.007492, 11.085162],
    note: 'Fin hvit kvarts under mosen. Se og ta bilder, men la steinen ligge, så andre også kan oppleve den.',
    source: 'Lokalkunnskap',
  },
  // Historier: små merker på hus og steder. Tekstene er skrevet med egne ord fra kildene som er oppgitt.
  {
    id: 'h-rodsbrygga',
    name: 'Rødsbrygga: prinsen som kom i land',
    type: 'historie',
    position: [59.0037, 11.068],
    approximate: true,
    note: 'Morgenen 21. mai 1813 gikk den danske arveprinsen Christian Frederik i land på Rødsbrygga. Det var hans første skritt på norsk jord. Han kom som ny stattholder, og reiste forkledd som matros for ikke å bli oppdaget av engelskmennene.\n\nÅret etter ble han valgt til Norges konge på Eidsvoll, men han måtte gi fra seg kronen samme høst.',
    source: 'Østfoldmuseene / Kystmuseet Hvaler',
    sources: [
      { label: 'DigitaltMuseum: Christian Frederik går i land', url: 'https://digitaltmuseum.no/011085442239/christian-frederik-gar-i-land-pa-sondre-sandoy' },
      { label: 'Oslo Islands: Søndre Sandøy', url: 'https://osloislands.com/history/sondre-sandoy/' },
    ],
  },
  {
    id: 'h-klara',
    name: 'Klara-huset på Havna',
    type: 'historie',
    position: [59.00472, 11.07646],
    note: 'Her bodde Klara Andersen, kjent som «Klara Havna» og «Tante Klara». Hun ble født på plassen 20. januar 1892, og bodde her i over 99 år.\n\nHun vokste opp med foreldrene og lillesøsteren. Faren døde i 1910 og søsteren året etter. Klara bodde med moren til hun døde i 1943, og siden alene med kattene sine.\n\nDa strømmen kom til øya i 1950, skal naboene ha samlet inn penger, så også Klara fikk kokestrøm og et lampepunkt. Hun huskes som glad i besøk, med god hukommelse for navn og datoer. Huset var lite, men i mange år hadde hun likevel plass til en familie som sommergjester.\n\nVåren 1991 flyttet hun til aldershjemmet, og hun døde året etter, drøyt 100 år gammel. Til 100-årsdagen fortalte hun Fredriksstad Blad at hun hadde vært i Halden, på tur til Strømstad og bodd et halvt år i Fredrikstad. Resten av livet hadde hun her.\n\nHuset står i SEFRAK-registeret som «Bolighus, Kasa (Klara-huset)», med byggetid på 1700-tallet. Det er privat eiendom, så se det gjerne fra veien.',
    source: 'Lokalhistorisk tekst om Klara · Riksantikvaren (SEFRAK 0111-0102-085)',
  },
  {
    id: 'h-oldtidshuset',
    name: 'Oldtidshuset på Skjelleren',
    type: 'historie',
    position: [59.00999, 11.06716],
    note: 'I 1948 restaurerte amatørarkeologen Hjalmar Johnsen en gammel hustuft her, med hjelp fra studenter. Hovedrommet målte omtrent 4,5 ganger 4,5 meter, med ildsted og røykåpning, og rett innenfor inngangen var det en kubås. Det ble også funnet en vikingøks.\n\nDet er avdekket rundt 300 hustufter på Hvaler, særlig på Kirkøy og Søndre Sandøy. Dette er den eneste som ble fullstendig restaurert. Tuftene er kulturminner, så la steinene ligge.',
    source: 'Fredriksstad Blad 1974 · Riksantikvaren · Hvaler kulturvernforening',
    sources: [
      { label: 'Arthur Holter, Fredrikstad Blad 1974', url: 'https://stig.ulfsby.no/2017/05/sondre-sandoy-en-naturperle/' },
      { label: 'Hvaler kulturvernforening: Hvalers historie', url: 'http://www.hvalerkulturvernforening.no/6758-2/' },
    ],
  },
  {
    id: 'h-batteritangen',
    name: 'Batteritangen og krigen i 1814',
    type: 'historie',
    position: [59.01033, 11.08613],
    note: 'Søndre Sandøy var sterkt engasjert i forsvaret av Fredrikstad festning i 1814. Det ble bygd flere batterier på øya, blant dem fire ved Stuevika. Etter sagnet skal tre svenske soldater ha falt her og blitt begravet.\n\nRiksantikvaren oppgir både gamle hustufter og kanonstillinger på tangen, og omtaler stillingene som svenske. Avisartikkelen fra 1974 forteller at de var en del av forsvaret på øya.',
    source: 'Fredriksstad Blad 1974 · Riksantikvaren',
    sources: [{ label: 'Arthur Holter, Fredrikstad Blad 1974', url: 'https://stig.ulfsby.no/2017/05/sondre-sandoy-en-naturperle/' }],
  },
  {
    id: 'h-nedgarden',
    name: 'Soldathuset på Nedgården',
    type: 'historie',
    position: [59.01473, 11.06729],
    approximate: true,
    note: 'I 1814 holdt mannskapene til i et hus på Nedgården, 90 mann under premierløytnant Hans Helgesen. Huset ble bygd i 1801 og solgt i 1806 for 600 speciedaler. I 1974 sto det fremdeles to store spiker i veggen inne i huset, brukt til å henge opp køyene da soldatene sov der.\n\nHvilket hus det er, må bekreftes. Merket står på et bolighus fra 1800–1824 i SEFRAK-registeret, som passer med byggeåret. Husene her er privat eiendom.',
    source: 'Fredriksstad Blad 1974 · Riksantikvaren (SEFRAK 0111-0102-001)',
    sources: [{ label: 'Arthur Holter, Fredrikstad Blad 1974', url: 'https://stig.ulfsby.no/2017/05/sondre-sandoy-en-naturperle/' }],
  },
  {
    id: 'h-salteriet',
    name: 'Sildesalteriet i Gravningsund',
    type: 'historie',
    position: [59.02329, 11.09375],
    note: 'Det første trankokeriet i sundet kom i 1787. Eieren var sunnmøringen Østen Olsen. Naboene klaget på stanken og utslippene, men det hjalp ikke, for han var en stor og sterk kar som alle var redde for.\n\nPå slutten av 1870-tallet kom sildesalteriet. En tønne saltet sild kostet 3 kroner, og to måneders sildefiske ga rundt 150 kroner per mann. I 1880 ble silden plutselig borte.\n\nSEFRAK-registeret har salteribygningen her med byggetid 1875–1899, og Gravningsund regnes som et regionalt verneverdig kulturmiljø.',
    source: 'Fredriksstad Blad 1974 · Riksantikvaren (SEFRAK 0111-0102-037)',
    sources: [{ label: 'Arthur Holter, Fredrikstad Blad 1974', url: 'https://stig.ulfsby.no/2017/05/sondre-sandoy-en-naturperle/' }],
  },
  {
    id: 'h-tollstedet',
    name: 'Gravningsund tollsted',
    type: 'historie',
    position: [59.0237, 11.10052],
    note: 'Tollstedet ble opprettet i 1892 som det første av fem faste tollsteder på Hvaler. Før det patruljerte tollfartøyer kysten, men det gjorde det for lett å smugle, særlig etter at dampskipene kom. Bygningene sto ferdige 1893–1894.\n\nDa stedet ble lagt ned 1. januar 1958, handlet tjenesten mest om småbåttrafikken til og fra Sverige. Fra 1959 ble det feriehjem for Tollvesenet. Anlegget ble fredet i 2015.',
    source: 'Lokalhistoriewiki (CC BY-SA) · Riksantikvaren',
    sources: [{ label: 'Lokalhistoriewiki: Gravningsund tollsted', url: 'https://lokalhistoriewiki.no/wiki/Gravningsund_tollsted' }],
  },
  {
    id: 'h-grotvika',
    name: 'Steinen til Oslo rådhus',
    type: 'historie',
    position: [59.01389, 11.10072],
    approximate: true,
    note: 'I Grøtvika ligger et nedlagt steinbrudd. Gneisen til fasaden på Oslo rådhus ble tatt ut her. Grå gneis kløyver ikke jevnt slik granitt gjør, så det kostet mye arbeid å få ut pene emner.',
    source: 'Visit Fredrikstad & Hvaler · Fredriksstad Blad 1974',
    sources: [
      { label: 'Visit Fredrikstad & Hvaler: Søndre Sandøy', url: 'https://www.visitfredrikstadhvaler.com/no/skjargardsriket-hvaler/hvaler---oy-for-oy/Sondre-Sandoy' },
      { label: 'Arthur Holter, Fredrikstad Blad 1974', url: 'https://stig.ulfsby.no/2017/05/sondre-sandoy-en-naturperle/' },
    ],
  },
  {
    id: 'h-ankervillaen',
    name: 'Ankervillaen (Sølyst)',
    type: 'historie',
    position: [59.02091, 11.08708],
    note: 'Sommervilla ved Gravningsund, bygd av haldenseren Christian August Anker i 1886. Den regnes som en av de første hyttene på Hvaler. Privat eiendom.',
    source: 'Riksantikvaren (Kulturminnesøk)',
    sources: [{ label: 'Kulturminnesøk: Sølyst (Ankervillaen)', url: 'https://kulturminnesok.no/ra/lokalitet/325041' }],
  },
  {
    id: 'h-torine',
    name: 'Ferga Torine',
    type: 'historie',
    position: [59.0168, 11.0639],
    note: 'Hvalerferga MS Torine, som legger til her, er oppkalt etter Nilsine «Torine» Madsen. Hun var forskolelærer og ble i 1913 den første kvinnen i Hvaler herredsstyre, valgt inn for Venstre. Ved det valget kom bare to kvinner inn på fast plass i et herredsstyre i Smaalenenes Amt, i Rygge og på Hvaler.',
    source: 'Dagsavisen 2023 · Hvaler kulturvernforening',
    sources: [{ label: 'Dagsavisen: Ferga får navn etter kvinnelig pioner', url: 'https://www.dagsavisen.no/nyheter/den-nye-hvalerferga-far-navn-etter-kvinnelig-pioner/5439689' }],
  },
  // Kafé og gårdsutsalg
  {
    id: 's-oline',
    name: 'Café Oline',
    type: 'servering',
    position: [59.014952, 11.066966],
    note: 'Familiedrevet kafé og pub ved det gamle landhandleriet, i samme bygning siden 1906. Kiosk med is og bakst. Åpent i skoleferier og utvalgte helger.\n\nAndreas og Josefine Christoffersen startet butikken i 1906. I 1939 tok nevøen og adoptivsønnen Sigurd Olsen over med kona Inger, og han styrte også poståpneriet. Som gutt bar han daglig seks liter melk fra Nedgården til pensjonatene i Gravningsund, 2,5 km hver vei, for 72 øre i uka. Kafeen kom i 1992 og er oppkalt etter Oline Marie Olsen (1835–1916).',
    bestTimes: { daypart: ['dag', 'kveld'], tide: [] },
    website: 'https://cafeoline.no/',
    source: 'Lokalkunnskap · cafeoline.no · Lokalhistoriewiki · Fredriksstad Blad 1974',
  },
  {
    id: 's-vingard',
    name: 'Ytre Hvaler Vingård',
    type: 'servering',
    position: [59.01141, 11.07309],
    note: 'Vingård som lager vin og andre lokale, bærekraftige drikkevarer.',
    website: 'https://www.ytre.vin/',
    source: 'Lokalkunnskap · ytre.vin',
  },
  { id: 'bod-fluge', name: 'Flugeboden', type: 'bod', position: [59.014024, 11.071091], note: 'Grønnsaker fra Svanekilen gård. Selvbetjent, i sommerhalvåret.', source: 'Lokalkunnskap' },
  { id: 'bod-sando', name: 'Sandø boden', type: 'bod', position: [59.005976, 11.072325], note: 'Tekstiler og keramikk. Selvbetjent.', source: 'Lokalkunnskap' },
  { id: 'bod-kvale', name: 'Kvale boden', type: 'bod', position: [59.014832, 11.068728], note: 'Honning og grønnsaker. Selvbetjent.', source: 'Lokalkunnskap' },
  // Praktisk info
  {
    id: 'p-oppslagstavle',
    name: 'Oppslagstavle',
    type: 'annet',
    position: [59.015017, 11.067704],
    note: 'Oppslagstavle med lokal info. Utsalgssted for Søndre Tidende.',
    source: 'Lokalkunnskap',
  },
  // Kultur og historie
  {
    id: 'h-lokkeberg-skole',
    name: 'Løkkeberg skole (gamle skolen)',
    type: 'historisk',
    position: [59.013298, 11.074699],
    note: 'Den gamle skolen på Søndre Sandøy, Stuevikveien 29, rett før Åsheim. Bygd i teglstein i en tradisjon som er typisk for skolebygg og forsamlingslokaler fra siste del av 1800-tallet og begynnelsen av 1900-tallet, på samme måte som skolene på Nordre Sandøy, Asmaløy og Spjærøy (Dypedal, 1893). I dag bolig for fastboende og base for kunstnerne bak «Den gamle skolen» og Mikrogalleri Nor. Ikke registrert i SEFRAK.',
    website: 'https://www.dengamleskolen.com/',
    source: 'Lokalhistorie · dengamleskolen.com',
  },
  {
    id: 'k-mikrogalleri-nor',
    name: 'Mikrogalleri Nor',
    type: 'kunst',
    position: [59.0133, 11.075],
    note: 'Kunstnerdrevet mikrogalleri ved Den gamle skolen – «der små ting får en størrelse». Gulvflate 150 × 60 cm, to etasjer og fire rom, synlig fra veien på vei til badestranda. Ved siden av henger «Månedens bilde», nytt bilde hver måned hele året. Drives av Vilde Rudjord, Magne Rudjord og Inger-Marie D. Thorkildsen.',
    website: 'https://www.dengamleskolen.com/mikrogallerinor',
    source: 'dengamleskolen.com',
  },
  {
    id: 'h-nordre-sandoy-skole',
    name: 'Nordre Sandøy skole',
    type: 'historisk',
    position: [59.03503, 11.09656],
    note: 'Gammel skole i teglstein fra samme tradisjon som Løkkeberg skole. I dag fritidsbolig. Posisjon fra SEFRAK-registeret («Skole, Nordre Sandø»).',
    source: 'Lokalhistorie · Riksantikvaren (SEFRAK)',
  },
]

/** Grupper for kjente plasser, så vanlige brukere kan slå av og på det de er ute etter. */
export interface SpotGroup {
  id: 'fiske' | 'bade' | 'mat' | 'historie' | 'kultur' | 'natur' | 'praktisk'
  label: string
  symbol: string
  types: PoiCategory[]
}

export const SPOT_GROUPS: SpotGroup[] = [
  { id: 'fiske', label: 'Fiske', symbol: '🐟', types: ['fiske'] },
  { id: 'bade', label: 'Bading og båt', symbol: '≈', types: ['bade', 'brygge'] },
  { id: 'mat', label: 'Kafé og gårdsutsalg', symbol: '☕', types: ['servering', 'bod'] },
  { id: 'historie', label: 'Historier', symbol: '📖', types: ['historie'] },
  { id: 'kultur', label: 'Kultur og historie', symbol: '⚑', types: ['historisk', 'kunst'] },
  { id: 'natur', label: 'Natur og utsikt', symbol: '◉', types: ['utsikt', 'baer', 'sopp', 'planter', 'dyr', 'geologi'] },
  { id: 'praktisk', label: 'Praktisk info', symbol: 'ℹ', types: ['annet'] },
]

export function groupOf(type: PoiCategory): SpotGroup['id'] {
  return SPOT_GROUPS.find((g) => g.types.includes(type))?.id ?? 'praktisk'
}

const GROUPS_KEY = 'sandoy-explorer:guide-groups-off:v1'

/** Grupper brukeren har slått av (bekvemmelighet per enhet). */
export function loadGroupsOff(): SpotGroup['id'][] {
  try {
    const raw = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x) => SPOT_GROUPS.some((g) => g.id === x)) : []
  } catch {
    return []
  }
}

export function saveGroupsOff(ids: SpotGroup['id'][]) {
  try {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(ids))
  } catch {
    /* lagring kan være blokkert */
  }
}

const OVERRIDE_KEY = 'sandoy-explorer:guide-positions:v1'
export type GuideOverrides = Record<string, [number, number]>

/** Brukerens egne justeringer av offentlige plasser. Lagres lokalt, endrer aldri kildedataene. */
export function loadGuideOverrides(): GuideOverrides {
  try {
    const raw = JSON.parse(localStorage.getItem(OVERRIDE_KEY) ?? '{}')
    return raw && typeof raw === 'object' ? raw : {}
  } catch {
    return {}
  }
}

export function saveGuideOverrides(o: GuideOverrides) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o))
  } catch {
    /* lagring kan være blokkert */
  }
}

const HIDDEN_KEY = 'sandoy-explorer:guide-hidden:v1'

/** Offentlige plasser brukeren har skjult (f.eks. fordi de har laget en egen, riktigere versjon). */
export function loadHiddenSpots(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function saveHiddenSpots(ids: string[]) {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids))
  } catch {
    /* lagring kan være blokkert */
  }
}

export type ResolvedSpot = GuideSpot & { moved: boolean; hidden: boolean }

/** Plasser med eventuelle lokale justeringer og skjuling lagt på. */
export function resolveSpots(overrides: GuideOverrides, hidden: string[] = [], extra: GuideSpot[] = []): ResolvedSpot[] {
  return [...GUIDE_SPOTS, ...extra].map((s) => ({
    ...s,
    position: overrides[s.id] ?? s.position,
    moved: !!overrides[s.id],
    hidden: hidden.includes(s.id),
  }))
}

/** Fiskeplasser fra turkartet som ikke lot seg stedfeste via navneregistrene. */
export const GUIDE_UNPLACED = ['Askjærholmen (sørvest)', 'Ødegårdstranda (sør)']
