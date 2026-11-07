import { SPECIES, type Species, type SpeciesPhoto } from './species'

const PHOTO_BASE = `${import.meta.env.BASE_URL}arter/`

const SPECIES_GROUPS: { label: string; groups: Species['group'][] }[] = [
  { label: 'Sommerfugler', groups: ['Sommerfugl'] },
  { label: 'Småkryp og snegler', groups: ['Småkryp', 'Snegl'] },
  { label: 'Krypdyr og fugler', groups: ['Krypdyr', 'Fugl'] },
  { label: 'I sjøen', groups: ['I sjøen'] },
]

function PhotoCredit({ photo }: { photo: SpeciesPhoto }) {
  return (
    <p className="species-credit">
      Foto: <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{photo.photographer}</a>,{' '}
      <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>, nedskalert
    </p>
  )
}

/** Bilde av et sted, øverst i detaljvisningen. */
export function PlacePhoto({ photo, alt }: { photo: SpeciesPhoto; alt: string }) {
  return (
    <figure className="place-photo">
      <img src={PHOTO_BASE + photo.file} alt={alt} loading="lazy" />
      <PhotoCredit photo={photo} />
    </figure>
  )
}

export function SpeciesCard({ species: s }: { species: Species }) {
  return (
    <article className="species-card">
      <img src={PHOTO_BASE + s.photo.file} alt={s.name} loading="lazy" />
      <div className="species-body">
        <h4>{s.name}</h4>
        <p className="species-latin">{s.latinName}</p>
        <p>{s.note}</p>
        <dl>
          <dt>Når</dt>
          <dd>{s.season}</dd>
          <dt>Hvor</dt>
          <dd>{s.places}</dd>
          {s.redList && (
            <>
              <dt>Rødlista</dt>
              <dd>{s.redList}</dd>
            </>
          )}
        </dl>
        <PhotoCredit photo={s.photo} />
      </div>
    </article>
  )
}

/** Offentlig fane: naturområder med fast plass og arter som flytter på seg. */
export function NaturePanel({ onShowSpot }: { onShowSpot: (id: string) => void }) {
  return (
    <div className="panel-section">
      <h3>Spesielle naturområder</h3>
      <button className="nature-place" onClick={() => onShowSpot('n-sandoysalta')}>
        <span className="nature-place-name">Sandøysalta naturreservat</span>
        <span className="muted">Strandeng med sjeldne planter, se bilder av dem her</span>
      </button>
      <button className="nature-place" onClick={() => onShowSpot('n-gjolertangen')}>
        <span className="nature-place-name">Gjølertangen naturreservat</span>
        <span className="muted">Værhard sørspiss med furu og barlind</span>
      </button>

      <h3>Skogen på øya</h3>
      <p className="desc">
        Søndre Sandøy er den mest skogkledte av øyene på Hvaler. Noe av furuskogen er rundt 100 år gammel, og trærne har blitt svært store. Flere steder er den kartlagt som gammel furuskog med gamle trær, blant annet ved Svarteberget, Utsikten,
        Grøtvika og Gravningsund. Ellers kan du møte barlind, eik, lind, ask, alm og hassel.
      </p>
      <ul className="story-sources">
        <li>
          <a href="https://snl.no/Nordre_og_S%C3%B8ndre_Sand%C3%B8y" target="_blank" rel="noreferrer">Store norske leksikon ↗</a>
        </li>
        <li>
          <a href="https://www.miljodirektoratet.no/tjenester/naturbase/" target="_blank" rel="noreferrer">Naturtyper i Naturbase ↗</a>
        </li>
      </ul>

      <h3>Berggrunnen</h3>
      <p className="desc">
        Søndre Sandøy skiller seg ut. Mens Kirkøy, Nordre Sandøy og mye av resten av Hvaler består av granitt, er Søndre Sandøy, som Herføl, bygd av glimmergneis. Gneisen er rundt 1,5–1,7
        milliarder år gammel, langt eldre enn granitten, som er rundt 900–1000 millioner år.
      </p>
      <ul className="story-sources">
        <li>
          <a href="https://geo.ngu.no/kart/berggrunn_mobil/" target="_blank" rel="noreferrer">Berggrunnskart fra NGU ↗</a>
        </li>
      </ul>

      <h3>Dette kan du se på øya</h3>
      {SPECIES_GROUPS.map((g) => (
        <section key={g.label}>
          <h4 className="species-group">{g.label}</h4>
          <div className="species-list">
            {SPECIES.filter((s) => g.groups.includes(s.group)).map((s) => (
              <SpeciesCard key={s.id} species={s} />
            ))}
          </div>
        </section>
      ))}
      <p className="hint">Når og hvor bygger på registrerte funn i GBIF, så artene kan også dukke opp andre steder. Se gjerne, men la dyr og planter være i fred.</p>
    </div>
  )
}
