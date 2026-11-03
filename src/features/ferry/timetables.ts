/**
 * Rutetabeller for Hvalerferga (rute D 801), lagt inn som data fra Østfold kollektivtrafikks PDF-er.
 * Ny sesongtabell = nytt Timetable-objekt i TIMETABLES. Ingen kodeendring nødvendig.
 *
 * Kilde høst 2026: https://ostfold-kollektiv.no/a4-rutetabell-hvaler_host-26.pdf
 */

export type StopId = 'skjaerhalden' | 'lauer' | 'herfol' | 'nedgarden' | 'sanne' | 'gravningsund' | 'mako'

export interface Stop {
  id: StopId
  name: string
  /** [lat, lon] for fergeleiet. */
  position: [number, number]
  /** Ligger stoppet på Søndre Sandøy? */
  onSandoy: boolean
  /** «**» i tabellen: plass til kjøretøy må bestilles på alle avganger. */
  vehicleBookingRequired?: boolean
  /** Stoppested-ID (Nasjonalt stoppestedsregister) brukt av bestillingssiden til Østfold kollektivtrafikk. */
  quayId: string
}

// Posisjoner: Nedgården, Herføl, Gravningsund og Sanne fra OpenStreetMap (ferjekai). Skjærhalden, Lauer og Makø er omtrentlige.
export const STOPS: Record<StopId, Stop> = {
  skjaerhalden: { id: 'skjaerhalden', name: 'Skjærhalden', position: [59.0247, 11.0395], onSandoy: false, vehicleBookingRequired: true, quayId: 'NSR:Quay:3173' },
  lauer: { id: 'lauer', name: 'Lauer', position: [59.0111, 11.0145], onSandoy: false, quayId: 'NSR:Quay:3194' },
  herfol: { id: 'herfol', name: 'Herføl', position: [59.002, 11.0568], onSandoy: false, vehicleBookingRequired: true, quayId: 'NSR:Quay:3187' },
  nedgarden: { id: 'nedgarden', name: 'Nedgården', position: [59.0168, 11.0639], onSandoy: true, vehicleBookingRequired: true, quayId: 'NSR:Quay:3183' },
  sanne: { id: 'sanne', name: 'Sanne', position: [59.028, 11.0946], onSandoy: false, quayId: 'NSR:Quay:3211' },
  gravningsund: { id: 'gravningsund', name: 'Gravningsund', position: [59.0242, 11.0999], onSandoy: true, quayId: 'NSR:Quay:3206' },
  mako: { id: 'mako', name: 'Makø', position: [59.036, 11.105], onSandoy: false, quayId: 'NSR:Quay:3217' },
}

export const BOOKING_URL = 'https://ostfold-kollektiv.no/bestilling-hvalerferga'
export const BOOKING_PHONE = '69 11 71 10'

/** Ferdig utfylt søk på bestillingssiden (fra, til, dato). Selve bestillingen krever innlogging der. */
export function bookingUrl(from: StopId, to: StopId, isoDate: string): string {
  const q = new URLSearchParams({ SearchDate: isoDate, QuayFromId: STOPS[from].quayId, QuayToId: STOPS[to].quayId, WithReturnJourney: 'false' })
  return `${BOOKING_URL}?${q}`
}

export const STOP_ORDER: StopId[] = ['skjaerhalden', 'lauer', 'herfol', 'nedgarden', 'sanne', 'gravningsund', 'mako']

export type DayType = 'man-fre' | 'lor-son' | 'lor'

export interface TripStop {
  stop: StopId
  /** "HHMM" */
  time: string
  /** «b» i tabellen: kjøres kun etter bestilling. */
  onRequest?: boolean
}

export interface Trip {
  days: DayType
  stops: TripStop[]
  /** L = til/fra Lauer kun etter bestilling, LF = samme, kun fredag. */
  lauerFlag?: 'L' | 'LF'
}

export interface Timetable {
  id: string
  label: string
  /** ISO-dato, inklusiv. */
  validFrom: string
  /** ISO-dato, inklusiv. Udefinert = til ny tabell overtar. */
  validTo?: string
  sourceUrl: string
  bookingInfo: string
  notes: string[]
  trips: Trip[]
}

/**
 * Kompakt kolonneformat: én streng per rundtur, stoppene i rekkefølgen under.
 * "...." = stopper ikke, suffiks "b" = etter bestilling.
 */
const COLUMN_ORDER: StopId[] = [
  'skjaerhalden',
  'lauer',
  'herfol',
  'nedgarden',
  'sanne',
  'gravningsund',
  'mako',
  'gravningsund',
  'sanne',
  'nedgarden',
  'skjaerhalden',
]

function column(days: DayType, cells: string, lauerFlag?: Trip['lauerFlag']): Trip {
  const parts = cells.trim().split(/\s+/)
  if (parts.length !== COLUMN_ORDER.length) throw new Error(`Rutekolonne har ${parts.length} felt, forventet ${COLUMN_ORDER.length}: ${cells}`)
  const stops: TripStop[] = []
  parts.forEach((cell, i) => {
    if (cell === '....') return
    const onRequest = cell.endsWith('b')
    stops.push({ stop: COLUMN_ORDER[i], time: cell.replace(/b$/, ''), ...(onRequest ? { onRequest } : {}) })
  })
  // Rekkefølgen i PDF-kolonnen er ikke alltid kjøreruta (f.eks. Nedgården før Herføl på 11:30),
  // så stoppene sorteres etter klokkeslett. Ingen tur krysser midnatt.
  stops.sort((a, b) => a.time.localeCompare(b.time))
  return { days, stops, ...(lauerFlag ? { lauerFlag } : {}) }
}

const HOST_2026: Timetable = {
  id: 'host-2026',
  label: 'Høsttabell 2026',
  validFrom: '2026-08-17',
  sourceUrl: 'https://ostfold-kollektiv.no/a4-rutetabell-hvaler_host-26.pdf?pid=Native-ContentFile-File',
  bookingInfo: 'Bestilling senest 1 time før avgang fra Skjærhalden: hvalerferga.ostfold-kollektiv.no eller tlf. 69 11 71 10.',
  notes: [
    'Plass til kjøretøy må bestilles på alle avganger (Skjærhalden, Herføl, Nedgården).',
    'Avganger merket «bestilling» kjøres kun etter bestilling.',
    'Lauer anløpes kun etter bestilling (fredag for 19:15-avgangen).',
  ],
  trips: [
    // Mandag–fredag. Kolonner: Skj, Lauer, Herføl, Nedg, Sanne, Grav, Makø, Grav, Sanne, Nedg, Skj
    column('man-fre', '0515 .... 0530b 0540 .... .... .... .... .... .... 0555'),
    column('man-fre', '0600 .... 0615b 0625 .... .... .... .... .... .... 0640'),
    column('man-fre', '0650 .... .... 0705 .... .... .... .... .... .... 0720'),
    column('man-fre', '0725 .... 0740b 0750 .... .... .... .... .... .... 0805'),
    column('man-fre', '0810 .... 0825b 0835 .... .... .... .... .... .... 0850'),
    column('man-fre', '0910 .... 0925b 0935 0945b 0950b 1000b .... .... 1020 1035'),
    column('man-fre', '1130 1210b 1155b 1145 .... .... .... .... .... .... 1220', 'L'),
    column('man-fre', '1250 .... 1305b 1315 1325b 1330b .... .... .... 1340 1355'),
    column('man-fre', '1410 .... 1425b 1435 1445b 1450b 1500b 1510b 1515b 1525 1540'),
    column('man-fre', '1610 1650b 1635b 1625 .... .... .... .... .... .... 1700', 'L'),
    column('man-fre', '1720 .... 1735b 1745b .... .... .... .... .... .... 1800'),
    column('man-fre', '1805 .... .... .... 1845b 1840b 1830b .... .... 1855b 1910'),
    column('man-fre', '1915 1955b 1940b 1930b .... .... .... .... .... .... 2005', 'LF'),
    column('man-fre', '2020 .... .... 2035b 2045b 2050b 2100b .... .... 2120b 2135'),
    column('man-fre', '2145 .... 2200b 2210b .... .... .... .... .... .... 2225'),
    // Lørdag og søndag. 08:10 er gulmerket i PDF-en = kjøres kun lørdag.
    column('lor', '0810 .... 0825b 0835 .... .... .... .... .... .... 0850'),
    column('lor-son', '0910 .... 0925b 0935 0945b 0950b 1000b .... .... 1020 1035'),
    column('lor-son', '1130 1210b 1155b 1145 .... .... .... .... .... .... 1220', 'L'),
    column('lor-son', '1250 .... 1305b 1315 1325b 1330b .... .... .... 1340 1355'),
    column('lor-son', '1410 .... 1425b 1435 1445b 1450b 1500b 1510b 1515b 1525 1540'),
    column('lor-son', '1610 1650b 1635b 1625 .... .... .... .... .... .... 1700', 'L'),
    column('lor-son', '1720 .... 1735b 1745b .... .... .... .... .... .... 1800'),
    column('lor-son', '1805 .... .... .... 1845b 1840b 1830b .... .... 1855b 1910'),
    column('lor-son', '1915 1955b 1940b 1930b .... .... .... .... .... .... 2005', 'L'),
    column('lor-son', '2020 .... .... 2035b 2045b 2050b 2100b .... .... 2120b 2135'),
    column('lor-son', '2145 .... 2200b 2210b .... .... .... .... .... .... 2225'),
  ],
}

export const TIMETABLES: Timetable[] = [HOST_2026]
