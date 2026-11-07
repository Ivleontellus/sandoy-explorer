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
  group: 'Sommerfugl' | 'Snegl'
  /** Når arten er registrert på øya. */
  season: string
  /** Hvor på øya den er funnet flest ganger. */
  places: string
  note: string
  photo: SpeciesPhoto
}

const CC_BY = 'https://creativecommons.org/licenses/by/4.0/deed.no'
const CC_BY_NC = 'https://creativecommons.org/licenses/by-nc/4.0/deed.no'

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
