import type { LineString } from 'geojson'
import type { BestTimes, PoiCategory } from '../../data/model'
import { GJOLERTANGEN_PHOTO, PENSJONATET_PHOTO, SALTERIET_PHOTO, SANDOYSALTA_PLANTS, type Species, type SpeciesPhoto } from '../nature/species'
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
  /** Bilde av stedet, med fotograf og lisens. */
  image?: SpeciesPhoto
  /** Planter som vises med bilde på plassen, uten egne punkter. */
  plants?: Species[]
  /** Bildestier relativt til public/data/ (bare publiserte plasser). */
  photos?: string[]
  /** Publisert fra appen; endres via egne registreringer + «Oppdater publisert». */
  published?: boolean
}

const MORNING_EVENING: BestTimes = { daypart: ['morgen', 'kveld'], tide: [] }
const ALL_DAY: BestTimes = { daypart: ['morgen', 'dag', 'kveld'], tide: [] }

/**
 * Plasseringene er kontrollert og justert lokalt (november 2026), med utgangspunkt i turkartet
 * og navneregistrene. Ikke justert ennå: Reiertangen, Stuevika badeplass,
 * Utkikkspunkt losen og Nordre Sandøy skole.
 */
export const GUIDE_SPOTS: GuideSpot[] = [
  // Fiske
  { id: 'f-lervika', name: 'Lervika', type: 'fiske', position: [59.020268, 11.073162], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-krossholmen', name: 'Krossholmen', type: 'fiske', position: [59.014256, 11.058061], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
  { id: 'f-sauholmen', name: 'Sauholmen', type: 'fiske', position: [59.009677, 11.057771], bestTimes: MORNING_EVENING, source: 'Turkart · lokalkunnskap' },
  { id: 'f-fiskekroken', name: 'Fiskekroken', type: 'fiske', position: [59.011588, 11.08807], bestTimes: ALL_DAY, source: 'Turkart · lokalkunnskap' },
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
  // Overnatting og camping
  {
    id: 'o-stuevika',
    name: 'Stuevika teltplass',
    type: 'overnatting',
    position: [59.00849, 11.08255],
    note: 'Familievennlig teltplass ved sandstranda i Stuevika, ca. 20 minutter å gå fra fergekaia på Nedgården. Nytt, flott sanitæranlegg med dusj, tilpasset funksjonshemmede.\n\nNår du leier teltplass, får du en hylle i kjøleskap og en i fryser, og strøm til lading av enkelt utstyr. All camping må bestilles på forhånd.',
    website: 'https://onlinebooking.camp/stuevikateltplass',
    source: 'Visit Fredrikstad & Hvaler · OpenStreetMap · lokalkunnskap',
  },
  {
    id: 'o-havely',
    name: 'Havely Bryggerhus',
    type: 'overnatting',
    position: [59.016159, 11.070104],
    note: 'Bryggerhus til leie på Nedgården, 60 m² med 6 senger. Leies ut privat.',
    website: 'https://www.finn.no/reise/feriehus-hytteutleie/ad.html?finnkode=171963101',
    source: 'FINN · lokalkunnskap',
  },
  {
    id: 'o-sjohus-nedgarden',
    name: 'Sjøhus på Nedgården',
    type: 'overnatting',
    position: [59.016803, 11.064981],
    note: 'Sjøhus til leie på stranda ved fergeleiet, med stue og kjøkken, to soverom, hems, bad og veranda med grill.',
    source: 'Visit Fredrikstad & Hvaler · lokalkunnskap',
    sources: [{ label: 'Visit Fredrikstad & Hvaler', url: 'https://wordpress.visitfredrikstadhvaler.com/en/kategori/seahouse-en/' }],
  },
  // Natur og utsikt
  { id: 'u-losen', name: 'Utkikkspunkt losen', type: 'utsikt', position: [58.9942, 11.0623], source: 'OpenStreetMap' },
  {
    id: 'n-sandoysalta',
    name: 'Sandøysalta naturreservat',
    type: 'planter',
    position: [59.0127, 11.0641],
    note: 'For noen hundre år siden måtte man vasse eller ro over til Sauholmen. Landhevingen løftet så Salta opp av sjøen, og øyboerne tok den i bruk som beite. Beitingen ga et helt spesielt planteliv, med mange arter som er uvanlige i dag.\n\nStrandenger som denne var vanlige før, men mange er borte på grunn av utbygging, oppdyrking og gjengroing. Salta er en av de største på Hvaler og regnes som nasjonalt verneverdig. Reservatet er på 98 dekar og ble vernet i 2010.\n\nI løvskogen på østsiden er fuglelivet rikt i hekketiden, og også nattergalen er hørt her.\n\nAlle plantene er fredet, så se, men ikke plukk. Bål er forbudt, og sykler skal holde seg på stier og traktorvei.',
    plants: SANDOYSALTA_PLANTS,
    source: 'Fylkesmannen i Østfold 2011 · verneforskriften',
    sources: [
      { label: 'Informasjonsark fra Fylkesmannen i Østfold', url: 'https://felles.naturbase.no/api/dokument/hent/10152.PDF' },
      { label: 'Verneforskriften på Lovdata', url: 'https://lovdata.no/forskrift/2010-04-16-547' },
      { label: 'Faktaark i Naturbase', url: 'https://faktaark.naturbase.no/?id=VV00002955' },
    ],
  },
  {
    id: 'n-gjolertangen',
    name: 'Gjølertangen naturreservat',
    type: 'planter',
    image: GJOLERTANGEN_PHOTO,
    position: [58.9981, 11.0811],
    note: 'Gjølertangen er sørspissen av Søndre Sandøy. Her har vind og bølger fritt spillerom. Fjellet vaskes rent, og busker og trær må huke seg ned for å overleve.\n\nFurua dominerer, og i den lunere nordre delen står trær som er hele 70 cm tykke. Skogen har også en av fylkets største forekomster av barlind, et tre som kan bli over 2000 år gammelt. Barlinden er giftig for dyr og mennesker, men rådyret tåler den og spiser gjerne det grønne baret om vinteren.\n\nBlant de uvanlige plantene er strandmalurt, kommuneblomsten til Hvaler. Reservatet er på 215 dekar og ble vernet i 2010.\n\nAlle plantene og trærne er fredet, så se, men ikke plukk. Bål er forbudt, og sykler skal holde seg på stier og traktorvei.',
    source: 'Fylkesmannen i Østfold 2011 · verneforskriften',
    sources: [
      { label: 'Informasjonsark fra Fylkesmannen i Østfold', url: 'https://felles.naturbase.no/api/dokument/hent/10152.PDF' },
      { label: 'Verneforskriften på Lovdata', url: 'https://lovdata.no/forskrift/2010-04-16-552' },
      { label: 'Faktaark i Naturbase', url: 'https://faktaark.naturbase.no/?id=VV00002960' },
    ],
  },
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
    id: 'h-gartnerens-dagbok',
    name: 'Gartnerens dagbok fra 1938',
    type: 'historie',
    position: [59.01413, 11.07284],
    approximate: true,
    note: 'Våren 1938 begynte gartner Dagfinn Andresen på Løkkeberg å skrive dagbok. Arbeidet i drivbenkene startet 27. mars, og 8. april prikket han ut 1400 tomatplanter og 850 sommerkålplanter.\n\nVåren ble en prøvelse. Langfredag var himmelen sommerblå, og dagen etter lå snøen på bakken. Så kom tørken. Gartneren vannet med bøtter og kanner og skrev at de snart var «på van(n)viddets rand». Kråkene trakk opp sukkerertene, og kråkejakten ga ikke en eneste fjær. Den 11. mai kom nattefrosten, og den 23. ble kuene sluppet i skauen, der det var lite å gnage på.\n\nLørdagene dro han til torvet i Halden med purre, nellik, stemorsblomster og forglemmegei. Første torvdag ga rundt 60 kroner. Da 1. mai kom, så han seg om etter demonstrasjonstog, men hvem skulle vel demonstrere på Søndre Sandøy? Og storoksen Ferdinant satte seg fast mellom stallen og fjøset, men kom seg etter hvert.\n\nDen 1. juni kom regnet endelig. Den 18. juni bestemte Dagfinn seg for å bade, men det ble med en tå i vannet. Ved sankthans var det 12 grader, og de første badegjestene dukket opp i badedrakt.',
    source: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler · Kartverket',
    sources: [{ label: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler', url: 'https://www.nb.no/items/acf3b5e1696622d0aee152b766149a12' }],
  },
  {
    id: 'h-kuene-1898',
    name: 'Kuene til Severin',
    type: 'historie',
    position: [59.00218, 11.07807],
    approximate: true,
    note: 'Nabokrangel er ikke noe nytt på øya. Skipsfører Ole Peter Eriksen bygde hus i Stuevika i 1875, og rundt 1896 begynte kuene til Severin Olsen på Ødegården å ta seg inn på jordet hans.\n\nEriksen satte opp nytt gjerde. Han hugde staur i skogen og rodde dem hjem, og sammen med kona hentet han 100 staur til. Han betalte også for 10 dagsverk, til 30–35 kroner. Likevel kom kuene og brøt seg gjennom. Havren, vikkeren, potetene, rugen og kløveren sto i fare.\n\nDen 25. juni 1898 hadde han fått nok og skrev til lensmannen. Han ba om at Olsen skulle få beskjed om å passe på dyrene sine, ellers ville loven gjelde. For, som han skrev: «1 Dag kan hele Sæden og Avlingen være forødet».\n\nVi vet ikke om kuene noen gang holdt seg på sin side av gjerdet.',
    source: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler · Kartverket',
    sources: [{ label: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler', url: 'https://www.nb.no/items/acf3b5e1696622d0aee152b766149a12' }],
  },
  {
    id: 'h-pensjonat-gravningsund',
    name: 'Gravningsund Sommerpensjonat',
    type: 'historie',
    position: [59.024, 11.0985],
    approximate: true,
    image: PENSJONATET_PHOTO,
    note: 'Sina Eilertsen åpnet sommerpensjonatet sitt i 1936, lengst øst i sundet, i et hus fra 1912. Her var 12 soverom, to stuer og en stor spisesal, og plass til rundt 25 gjester. Verandaen ble bygd på i 1938–39.\n\nRegnskapet for 1940 viser et overskudd på rundt 1500 kroner, og gjestene la igjen 5165 kroner. Det meste pensjonatet trengte, kom fra øya. Sina hadde ku, kvige, kalv, 12 høner og 19 mål dyrket jord.\n\nDriften stoppet en periode under krigen i 1941, men gikk så videre til 1949. Etterpå kunne man i noen år leie seg inn og stelle seg selv.',
    source: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler · Østfold fylkes billedarkiv',
    sources: [
      { label: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler', url: 'https://www.nb.no/items/acf3b5e1696622d0aee152b766149a12' },
      { label: 'Flyfoto fra 1964 i DigitaltMuseum', url: 'https://digitaltmuseum.no/011015144456/gravningsund' },
    ],
  },
  {
    id: 'h-pensjonat-bakkevik',
    name: 'Bakkevik Pensjonat',
    type: 'historie',
    position: [59.02079, 11.07841],
    approximate: true,
    note: 'Bakkevik Pensjonat åpnet i 1936 og holdt det gående i rundt seks år, til krigen gjorde det vanskelig å skaffe mat. Det var fullt hus hver sommer. Først var det 15 gjester, de siste tre årene 18, og da ble det også leid rom i nabohusene. Pensjonatet hadde sin egen lille badestrand, som ble flittig brukt.',
    source: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler · Kartverket',
    sources: [{ label: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler', url: 'https://www.nb.no/items/acf3b5e1696622d0aee152b766149a12' }],
  },
  {
    id: 'h-pensjonat-bjornvall',
    name: 'Bjørnvalls pensjonat',
    type: 'historie',
    position: [59.00258, 11.06926],
    approximate: true,
    note: 'Bjørnvalls pensjonat i Herfølrenna startet i 1929. Marianne Bjørnvall drev det til hun døde i 1938, og så overtok datteren Karoline. Først var det plass til 10–15 gjester. Flere rom ble innredet i forretningen til faren Thor, og på det meste kunne 30–35 gjester nyte sommeren på Vennern. Driften gikk for fullt til 1939.',
    source: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler · Kartverket',
    sources: [{ label: 'Nordre og Søndre Sandøy: tvillingøyer i østre Hvaler', url: 'https://www.nb.no/items/acf3b5e1696622d0aee152b766149a12' }],
  },
  {
    id: 'h-oldtidshuset',
    name: 'Oldtidshuset på Skjelleren',
    type: 'historie',
    position: [59.00999, 11.06716],
    approximate: true,
    note: 'Sommeren 1941 ble en gammel hustuft på gården Skjelleren bygd opp igjen. Trelastagent og amatørarkeolog Hjalmar Johnsen ledet arbeidet, og en gruppe studenter gjorde jobben gratis på to uker. Fredrikstad og Omegns Historielag tok initiativet, mens De No Fa og Lilleborg Fabrikker betalte det meste av utgiftene.\n\nHuset ble kalt Oldtidshuset og hadde to rom. Det største var omtrent 4,5 x 4,5 meter, med åre og røykåpning, og det minste ble tolket som en kubås. Under arbeidet fant de flintavfall, en knokkel som trolig var fra ku, og en stridsøks av jern av vikingtidstype.\n\nSamme sommer la de også en stor bronsealderrøys på Rød tilbake i sin opprinnelige form.\n\nDet er avdekket rundt 300 hustufter på Hvaler, særlig på Kirkøy og Søndre Sandøy. Dette er den eneste som ble fullstendig restaurert. Tuftene er kulturminner, så la steinene ligge.\n\nVi vet ikke helt sikkert hvilken tuft som ble bygd opp igjen, så merket er omtrentlig. Vet du mer, si gjerne fra.',
    source: 'Den Nye Tid 1942 · Fredriksstad Blad 1974 og 1977 · Riksantikvaren · Hvaler kulturvernforening',
    sources: [
      { label: 'Den Nye Tid, 6. mai 1942, s. 2', url: 'https://www.nb.no/items/ba0f9aac7d9e0f36620458a355214e96' },
      { label: 'Fredriksstad Blad, 6. juli 1974, s. 11', url: 'https://www.nb.no/items/971c3d8b6a2152481647bc9e25e5dba7' },
      { label: 'Fredriksstad Blad, 27. august 1977, s. 7', url: 'https://www.nb.no/items/2146140b7089bb917a05ac5c2a6f695f' },
      { label: 'Hvaler kulturvernforening: Hvalers historie', url: 'http://www.hvalerkulturvernforening.no/6758-2/' },
    ],
  },
  {
    id: 'h-adolfsen',
    name: 'Adolfsen Båtbyggeri',
    type: 'historie',
    position: [59.016595, 11.064445],
    note: 'I 1937 startet brødrene Harry og Gunnar Adolfsen båtbyggeri på Søndre Sandøy. De bygde båter i tradisjonell krysser-stil, og noen av dem kan du fortsatt se på fjorden.\n\nHarrys sønn Tore tok over i 1973, og sommeren 1978 ble den siste båten bygd helt og fullt her. Siden 2017 har Tore drevet videre sammen med sønnen Martin.\n\nBedriften holder til på samme sted som i 1937, men slippen er byttet ut med truck. I dag er det bryggeplass til 40 båter og vinteropplag for 130. Det meste av arbeidet er på plastbåter, men trebåtene er fortsatt en spesialitet.',
    website: 'https://adolfsenbat.no/',
    source: 'Adolfsen Båtbyggeri',
    sources: [{ label: 'Adolfsen Båtbyggeri: Historie', url: 'https://adolfsenbat.no/historie/' }],
  },
  {
    id: 'h-rodsbrygga',
    name: 'Rødsbrygga: prinsen som kom i land',
    type: 'historie',
    position: [59.00523, 11.06849],
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
    image: SALTERIET_PHOTO,
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
    position: [59.014121, 11.100655],
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
  {
    id: 'h-torbal',
    name: 'Torine fra Torbal',
    type: 'historie',
    position: [59.02281, 11.09987],
    note: 'Fra Torbal kom Torine Pettersen. Hun giftet seg med Haldor Pettersen og flyttet ut til Tisler, den ytterste øya i Hvaler som har vært bebodd. Der ute var han tredje generasjon, og hjemmet deres het Enga.\n\nDe to ble kjent som fargerike og solide slitere, med et par kuer, sauer og fiske som levebrød. Tisler-folket var ofte blant de første som kom forliste til hjelp.\n\nDa Haldor var død, flyttet Torine inn til Skjærhalden, der hun levde resten av livet. Hun må ikke forveksles med fergen Torine, som har navnet etter Nilsine «Torine» Madsen.',
    source: 'Aslak Jensen, Fredriksstad Blad 1984 · Kartverket',
    sources: [{ label: 'Aslak Jensen: Møte med Tisler, Fredriksstad Blad 28. juli 1984, s. 9', url: 'https://www.nb.no/items/ee117a6031c12f0b6bcaa58f2adf8145' }],
  },
  {
    id: 'h-cubaflagget',
    name: 'Cuba-flagget i Gravningsund',
    type: 'historie',
    position: [59.02466, 11.09657],
    approximate: true,
    note: 'Sommeren 1969 vaiet Cubas revolusjonsflagg over en av holmene i Gravningsund. Ifølge Halden Arbeiderblad gikk det rykter om at eieren av holmen hadde søkt Cubas ambassade om lov til å bruke flagget, og fått ja.\n\nAvisen spøkte med at det kanskje skjedde mens Finn Gustavsen ferievikarierte som ambassadør, og slo fast at Castro hadde okkupert en holme i det aristokratiske Gravningsund.\n\nAvisen sier ikke hvilken holme det var, så merket står bare omtrent. Vet du hvilken, si gjerne fra.',
    source: 'Halden Arbeiderblad 1969',
    sources: [{ label: 'Sommer-aristokratiske Gravningsund blir folketomt til vinteren, Halden Arbeiderblad 16. august 1969, s. 6', url: 'https://www.nb.no/items/ea26daf0072f8fabc3c5d98cf42778e3' }],
  },
  {
    id: 'h-vinbergsnegl',
    name: 'De «franske» sneglene',
    type: 'historie',
    position: [59.009876, 11.084991],
    note: 'De store sneglene med brunt hus som du kan møte på øya, er vinbergsnegl, den samme arten som ofte blir til franske escargots. Den er Norges største landsnegl med hus.\n\nPå Hvaler er den satt ut noen steder, og på Søndre Sandøy er den registrert flere steder, blant annet her ved Stuevika.\n\nPå øya fortelles det at sneglene rømte fra en som avlet dem her. Hvem det var og når, har vi ikke funnet ut. Vet du mer, si gjerne fra.\n\nTil Norge kom arten trolig allerede i middelalderen, men sneglene her har nok en mye yngre historie.',
    source: 'Østfolds naturarv · GBIF · lokalkunnskap',
    sources: [
      { label: 'Østfolds naturarv, s. 232', url: 'https://www.nb.no/items/449d07d90a1239d4880f52b0cfbd42ef' },
      { label: 'GBIF: Helix pomatia', url: 'https://www.gbif.org/species/search?q=Helix%20pomatia' },
    ],
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
  id: 'fiske' | 'bade' | 'overnatting' | 'mat' | 'historie' | 'kultur' | 'natur' | 'praktisk'
  label: string
  symbol: string
  types: PoiCategory[]
}

export const SPOT_GROUPS: SpotGroup[] = [
  { id: 'fiske', label: 'Fiske', symbol: '🐟', types: ['fiske'] },
  { id: 'bade', label: 'Bading og båt', symbol: '≈', types: ['bade', 'brygge'] },
  { id: 'overnatting', label: 'Overnatting og camping', symbol: '⛺', types: ['overnatting'] },
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
