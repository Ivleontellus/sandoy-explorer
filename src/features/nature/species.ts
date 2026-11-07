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
  license: 'CC BY 4.0' | 'CC BY-NC 4.0' | 'CC BY-SA 3.0' | 'Fri bruk med navn'
  licenseUrl: string
  /** Funnet bildet hører til. */
  sourceUrl: string
}

export interface Species {
  id: string
  name: string
  latinName: string
  group: 'Sommerfugl' | 'Småkryp' | 'Snegl' | 'Krypdyr' | 'Fugl' | 'I sjøen' | 'Plante'
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
const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/deed.no'

/** Bilder av steder fra Wikimedia Commons. Husk navn og lisens ved visning. */
export const GJOLERTANGEN_PHOTO: SpeciesPhoto = {
  file: 'gjolertangen.jpg',
  photographer: 'Stig Ulfsby',
  license: 'CC BY-SA 3.0',
  licenseUrl: CC_BY_SA_3,
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gj%C3%B8lertangen.jpg',
}

/** Fotografen oppgir at bildene kan brukes fritt med referanse til ham. */
export const PENSJONATET_PHOTO: SpeciesPhoto = {
  file: 'pensjonatet-buvika.jpg',
  photographer: 'Stig Ulfsby',
  license: 'Fri bruk med navn',
  licenseUrl: 'https://stig.ulfsby.no/2011/04/bilder-sondre-sandoy-hvaler/',
  sourceUrl: 'https://stig.ulfsby.no/2011/04/bilder-sondre-sandoy-hvaler/',
}

export const SALTERIET_PHOTO: SpeciesPhoto = {
  file: 'salteriet.jpg',
  photographer: 'Stig Ulfsby',
  license: 'CC BY-SA 3.0',
  licenseUrl: CC_BY_SA_3,
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sildesalteri_Gravningsund.jpg',
}

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
    id: 'kystringvinge',
    name: 'Kystringvinge',
    latinName: 'Hipparchia semele',
    group: 'Sommerfugl',
    season: 'Juli–august',
    places: 'Stuevika og Rød',
    note: 'Sitter gjerne på berg og stein med sammenslåtte vinger, og forsvinner nesten mot underlaget.',
    photo: {
      file: 'kystringvinge.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517876512',
    },
  },
  {
    id: 'humlesvermer',
    name: 'Bredkantet humlesvermer',
    latinName: 'Hemaris fuciformis',
    group: 'Sommerfugl',
    season: 'Juni–juli',
    places: 'Stuevika og Nedgården',
    note: 'Flyr om dagen og står stille i lufta foran blomstene, nesten som en liten kolibri.',
    photo: {
      file: 'humlesvermer.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517904503',
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
  {
    id: 'harbasse',
    name: 'Hårgullbasse',
    latinName: 'Cetonia aurata',
    group: 'Småkryp',
    season: 'Mai–juli',
    places: 'Stuevika og Gjølertangen',
    note: 'En metallgrønn bille som ofte sitter på blomster.',
    photo: {
      file: 'hargullbasse.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517854702',
    },
  },
  {
    id: 'sankthansorm',
    name: 'Sankthansorm',
    latinName: 'Lampyris noctiluca',
    group: 'Småkryp',
    season: 'Juli',
    places: 'Stuevika, Salta og Gjøkvika',
    note: 'En bille som lyser. Se etter små grønne lys i graskanten på lune sommerkvelder.',
    photo: {
      file: 'sankthansorm.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4906542866',
    },
  },
  {
    id: 'vepseedderkopp',
    name: 'Vepseedderkopp',
    latinName: 'Argiope bruennichi',
    group: 'Småkryp',
    season: 'August',
    places: 'Rød og Gravningsund',
    note: 'En stor edderkopp med gule og svarte striper. Den er ufarlig.',
    photo: {
      file: 'vepseedderkopp.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/5287634720',
    },
  },
  {
    id: 'stalorm',
    name: 'Stålorm',
    latinName: 'Anguis fragilis',
    group: 'Krypdyr',
    season: 'Mai–august',
    places: 'Gravningsund og Stuevika',
    note: 'Ser ut som en liten slange, men er en øgle uten bein. Den er helt ufarlig.',
    photo: {
      file: 'stalorm.jpg',
      photographer: 'Marte Jørgensen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/3866466455',
    },
  },
  {
    id: 'stillits',
    name: 'Stillits',
    latinName: 'Carduelis carduelis',
    group: 'Fugl',
    season: 'Mai–september',
    places: 'Veveriet og Nedgården',
    note: 'En fargerik liten fink med rødt ansikt og gule vingebånd.',
    photo: {
      file: 'stillits.jpg',
      photographer: 'Peik Weidemann Wieland',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4517890302',
    },
  },
  {
    id: 'kompassmanet',
    name: 'Kompassmanet',
    latinName: 'Chrysaora hysoscella',
    group: 'I sjøen',
    season: 'Juli',
    places: 'Stuevika',
    note: 'Har brune striper som minner om en kompassrose. Ikke rør den, for den kan brenne.',
    photo: {
      file: 'kompassmanet.jpg',
      photographer: 'May-helen Karlsen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/5233735438',
    },
  },
  {
    id: 'nakensnegl',
    name: 'Nakensnegl',
    latinName: 'Facelina bostoniensis',
    group: 'I sjøen',
    season: 'Januar–april',
    places: 'Under vann sørøst for øya',
    note: 'Fargerike sjøsnegler uten hus. Dykkere har fotografert mange arter rundt øya.',
    photo: {
      file: 'nakensnegl.jpg',
      photographer: 'Heine Jensen',
      license: 'CC BY 4.0',
      licenseUrl: CC_BY,
      sourceUrl: 'https://www.gbif.org/occurrence/4039166617',
    },
  },
]
