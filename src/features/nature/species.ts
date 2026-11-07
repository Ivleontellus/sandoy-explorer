/**
 * Arter du kan møte på Søndre Sandøy. OFFENTLIG informasjon. Arter flytter på seg, så de vises
 * som kort med områder og aldri som punkter. Sårbare og rødlistede arter skal ikke inn her.
 *
 * Månedene og områdene er oppsummert fra funn i GBIF (hentet november 2026). Bildene er tatt på
 * øya, ligger nedskalert i public/arter/ og krever navn på fotografen og lisens ved visning.
 * CC BY-NC-bilder kan bare brukes så lenge appen er gratis og uten reklame eller salg.
 */

export interface SpeciesPhoto {
  /** Filnavn i public/arter/. */
  file: string
  photographer: string
  license: 'CC BY 4.0' | 'CC BY-NC 4.0'
  licenseUrl: string
  /** Funnet bildet hører til. */
  sourceUrl: string
}

export interface Species {
  id: string
  name: string
  latinName: string
  group: 'Sommerfugl' | 'Snegl' | 'Plante'
  /** Når arten er registrert på øya, eller når planten er lettest å se. */
  season: string
  /** Hvor på øya den er funnet flest ganger. */
  places: string
  note: string
  /** Status i Norsk rødliste 2021, bare for rødlistede arter. */
  redList?: string
  photo: SpeciesPhoto
}

const CC_BY = 'https://creativecommons.org/licenses/by/4.0/deed.no'
const CC_BY_NC = 'https://creativecommons.org/licenses/by-nc/4.0/deed.no'

/**
 * Plantene Fylkesmannen selv omtaler fra Sandøysalta (2011). De vises bare samlet på reservatet,
 * aldri med punkt. Bildene er fra andre steder, så de peker ikke ut voksestedene i reservatet.
 * «Når» er oppsummert fra funn i GBIF rundt Hvaler; rødlistestatus er Norsk rødliste 2021.
 */
export const SANDOYSALTA_PLANTS: Species[] = [
  {
    id: 'tusengylden',
    name: 'Tusengylden',
    latinName: 'Centaurium littorale',
    group: 'Plante',
    season: 'Juli–september',
    places: 'Sandøysalta',
    note: 'En vakker liten plante med rosa stjerneblomster, typisk for strandenger.',
    redList: 'Nær truet',
    photo: {
      file: 'tusengylden.jpg',
      photographer: 'Kristine Kvellestad',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/5233752409',
    },
  },
  {
    id: 'dverggylden',
    name: 'Dverggylden',
    latinName: 'Centaurium pulchellum',
    group: 'Plante',
    season: 'Juli–august',
    places: 'Sandøysalta',
    note: 'Den enda mindre slektningen til tusengylden. Du må nesten ned på kne for å se den.',
    photo: {
      file: 'dverggylden.jpg',
      photographer: 'Theodor Korsgaard',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/5287679638',
    },
  },
  {
    id: 'jordbaerklover',
    name: 'Jordbærkløver',
    latinName: 'Trifolium fragiferum',
    group: 'Plante',
    season: 'Juli–august',
    places: 'Sandøysalta',
    note: 'Navnet kommer av at blomsten minner om et jordbær.',
    redList: 'Sårbar',
    photo: {
      file: 'jordbaerklover.jpg',
      photographer: 'Else Ruud-Jørgensen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/6434921327',
    },
  },
  {
    id: 'strandrodtopp',
    name: 'Strandrødtopp',
    latinName: 'Odontites litoralis',
    group: 'Plante',
    season: 'Juli–august',
    places: 'Sandøysalta',
    note: 'Rødlig strandplante med små blomster langs stilken.',
    photo: {
      file: 'strandrodtopp.jpg',
      photographer: 'Jan Sørensen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/2528941167',
    },
  },
  {
    id: 'ormetunge',
    name: 'Ormetunge',
    latinName: 'Ophioglossum vulgatum',
    group: 'Plante',
    season: 'Mai–august',
    places: 'Sandøysalta',
    note: 'En liten og uvanlig bregne med ett blad og en sporebærende «tunge».',
    redList: 'Nær truet',
    photo: {
      file: 'ormetunge.jpg',
      photographer: 'Jon Bekken',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4989441157',
    },
  },
  {
    id: 'marinokkel',
    name: 'Marinøkkel',
    latinName: 'Botrychium lunaria',
    group: 'Plante',
    season: 'Mai–juni',
    places: 'Sandøysalta',
    note: 'En annen liten bregne, med vifteformede småblader. Den er lett å overse.',
    photo: {
      file: 'marinokkel.jpg',
      photographer: 'Ole Bjørn Braathen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/6356572468',
    },
  },
  {
    id: 'bittergronn',
    name: 'Bittergrønn',
    latinName: 'Chimaphila umbellata',
    group: 'Plante',
    season: 'Juli–august',
    places: 'Tørrere mark i Sandøysalta',
    note: 'En fredet plante med blanke, tagget blader. Den er grønn hele året.',
    redList: 'Sterkt truet',
    photo: {
      file: 'bittergronn.jpg',
      photographer: 'Else Ruud-Jørgensen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/6405707427',
    },
  },
]

export const SPECIES: Species[] = [
  {
    id: 'svalestjert',
    name: 'Svalestjert',
    latinName: 'Papilio machaon',
    group: 'Sommerfugl',
    season: 'Mai–august',
    places: 'Stuevika, Salta og Gravningsund',
    note: 'En av våre største dagsommerfugler, gul og svart, med små «haler» på bakvingene. Sees ofte på blomster.',
    photo: {
      file: 'svalestjert.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/6495278098',
    },
  },
  {
    id: 'sitronsommerfugl',
    name: 'Sitronsommerfugl',
    latinName: 'Gonepteryx rhamni',
    group: 'Sommerfugl',
    season: 'Mai–august',
    places: 'Stuevika og Rød',
    note: 'Vingene ligner blader, sitrongule hos hannen og blekere hos hunnen. Den overvintrer som voksen sommerfugl.',
    photo: {
      file: 'sitronsommerfugl.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517879680',
    },
  },
  {
    id: 'ildgullvinge',
    name: 'Ildgullvinge',
    latinName: 'Lycaena phlaeas',
    group: 'Sommerfugl',
    season: 'Mai–august',
    places: 'Stuevika og Rød',
    note: 'Liten og kvikk, med skinnende oransje forvinger og svarte flekker.',
    photo: {
      file: 'ildgullvinge.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517913332',
    },
  },
  {
    id: 'dagpafugloye',
    name: 'Dagpåfugløye',
    latinName: 'Aglais io',
    group: 'Sommerfugl',
    season: 'Mai–august',
    places: 'Stuevika og Rød',
    note: 'Rødbrun med store øyeflekker på vingene. Den overvintrer som voksen og kan dukke opp tidlig på året.',
    photo: {
      file: 'dagpafugloye.jpg',
      photographer: 'marvinpope',
      license: 'CC BY-NC 4.0',
      licenseUrl: CC_BY_NC,
      sourceUrl: 'https://www.gbif.org/occurrence/2626375253',
    },
  },
  {
    id: 'vinbergsnegl',
    name: 'Vinbergsnegl',
    latinName: 'Helix pomatia',
    group: 'Snegl',
    season: 'April–september',
    places: 'Nedgården, Rød og Stuevika',
    note: 'Norges største landsnegl med hus, ofte kalt fransk snegl. Se gjerne historien om den ved Stuevika.',
    photo: {
      file: 'vinbergsnegl.jpg',
      photographer: 'Mika Tomta',
      license: 'CC BY-NC 4.0',
      licenseUrl: CC_BY_NC,
      sourceUrl: 'https://www.gbif.org/occurrence/4153888470',
    },
  },
]
