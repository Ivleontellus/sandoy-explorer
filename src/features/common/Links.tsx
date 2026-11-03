import { Fragment } from 'react'

const URL_RE = /(https?:\/\/[^\s)]+|www\.[^\s)]+\.[a-z]{2,}[^\s)]*)/gi

function href(raw: string): string {
  return raw.startsWith('http') ? raw : `https://${raw}`
}

/** «https://www.ytre.vin/» → «ytre.vin» */
export function prettyHost(url: string): string {
  try {
    return new URL(href(url)).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Tekst der nettadresser blir klikkbare lenker som åpnes i ny fane. */
export function LinkedText({ text }: { text: string }) {
  const parts = text.split(URL_RE)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a key={i} href={href(p.replace(/[.,]$/, ''))} target="_blank" rel="noreferrer">
            {prettyHost(p.replace(/[.,]$/, ''))}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

/** Tydelig knapp til stedets egen nettside. */
export function WebsiteButton({ url }: { url: string }) {
  return (
    <a className="button website" href={href(url)} target="_blank" rel="noreferrer">
      🌐 Besøk {prettyHost(url)} ↗
    </a>
  )
}
