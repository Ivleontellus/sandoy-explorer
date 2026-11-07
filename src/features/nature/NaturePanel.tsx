import { SPECIES, type Species } from './species'

const PHOTO_BASE = `${import.meta.env.BASE_URL}arter/`

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
        <p className="species-credit">
          Foto: <a href={s.photo.sourceUrl} target="_blank" rel="noreferrer">{s.photo.photographer}</a>,{' '}
          <a href={s.photo.licenseUrl} target="_blank" rel="noreferrer">{s.photo.license}</a>, nedskalert
        </p>
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
        Søndre Sandøy er den mest skogkledte av øyene på Hvaler. Flere steder er skogen kartlagt som gammel furuskog med gamle trær, blant annet ved Svarteberget, Utsikten,
        Grøtvika og Gravningsund. Ellers kan du møte eik, lind, ask, alm og hassel.
      </p>
      <ul className="story-sources">
        <li>
          <a href="https://snl.no/Nordre_og_S%C3%B8ndre_Sand%C3%B8y" target="_blank" rel="noreferrer">Store norske leksikon ↗</a>
        </li>
        <li>
          <a href="https://www.miljodirektoratet.no/tjenester/naturbase/" target="_blank" rel="noreferrer">Naturtyper i Naturbase ↗</a>
        </li>
      </ul>

      <h3>Dette kan du se på øya</h3>
      <div className="species-list">
        {SPECIES.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
      </div>
      <p className="hint">Når og hvor bygger på registrerte funn i GBIF, så artene kan også dukke opp andre steder. Se gjerne, men la dyr og planter være i fred.</p>
    </div>
  )
}
