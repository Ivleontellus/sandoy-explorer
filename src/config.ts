/**
 * Innstillinger som endres når appen publiseres eller deles med testere.
 * Alt annet konfigureres i de respektive modulene.
 */

declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string

/** Commit-id og byggedato, vist i menyen og lagt ved tilbakemeldinger. */
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'
export const BUILD_DATE = typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : ''

/**
 * Hvor testere sender tilbakemeldinger. Settes ved bygg med miljøvariabelen VITE_FEEDBACK_URL
 * (f.eks. https://github.com/<bruker>/<repo>/issues/new). Tom = knappen skjules.
 */
export const FEEDBACK_URL: string = import.meta.env.VITE_FEEDBACK_URL ?? ''

/** Lenke med versjon og skjermstørrelse ferdig utfylt, så tilbakemeldingen blir lettere å følge opp. */
export function feedbackLink(): string | null {
  if (!FEEDBACK_URL) return null
  if (!/github\.com\/.+\/issues\/new/.test(FEEDBACK_URL)) return FEEDBACK_URL
  const body = [
    '**Hva skjedde / hva savner du?**',
    '',
    '',
    '**Hvor i kartet / hvilken fane?**',
    '',
    '',
    '---',
    `Versjon: ${APP_VERSION} (${BUILD_DATE})`,
    `Skjerm: ${window.innerWidth}×${window.innerHeight}`,
    `Nettleser: ${navigator.userAgent}`,
  ].join('\n')
  const url = new URL(FEEDBACK_URL)
  url.searchParams.set('title', 'Tilbakemelding: ')
  url.searchParams.set('body', body)
  return url.toString()
}

/** Repoet appen publiserer til (eier/navn). Settes av byggejobben; standard er hovedrepoet. */
export const GITHUB_REPO: string = import.meta.env.VITE_GITHUB_REPO || 'Ivleontellus/sandoy-explorer'
export const GITHUB_BRANCH = 'main'

/** Bump når velkomstteksten endres vesentlig, så testere ser den på nytt. */
export const WELCOME_VERSION = 1
