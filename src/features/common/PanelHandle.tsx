import { useRef, type PointerEvent } from 'react'

/** Så langt (px) fingeren må dra før arket bytter tilstand; kortere drag spretter tilbake. */
const SWIPE_THRESHOLD = 50
/** Bevegelse under dette regnes som et vanlig trykk, ikke et drag. */
const TAP_SLOP = 6

interface Props {
  open: boolean
  onChange: (open: boolean) => void
}

/**
 * Toppen av bunnarket på mobil: hele flata er ett stort trykkefelt, og arket følger fingeren
 * når man drar. Trykk (og tastatur) går gjennom onClick, drag gjennom pointer-hendelsene.
 */
export function PanelHandle({ open, onChange }: Props) {
  const drag = useRef<{ startY: number; closedOffset: number; panel: HTMLElement } | null>(null)
  const dragged = useRef(false)

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    const panel = e.currentTarget.parentElement
    if (!panel) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragged.current = false
    drag.current = { startY: e.clientY, closedOffset: panel.offsetHeight - e.currentTarget.offsetHeight, panel }
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dy = e.clientY - d.startY
    if (!dragged.current && Math.abs(dy) < TAP_SLOP) return
    dragged.current = true
    d.panel.classList.add('dragging')
    const offset = Math.min(d.closedOffset, Math.max(0, (open ? 0 : d.closedOffset) + dy))
    d.panel.style.transform = `translateY(${offset}px)`
  }

  const finish = (e: PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    d.panel.classList.remove('dragging')
    d.panel.style.transform = ''
    if (cancelled || !dragged.current) return
    const dy = e.clientY - d.startY
    if (open && dy > SWIPE_THRESHOLD) onChange(false)
    else if (!open && dy < -SWIPE_THRESHOLD) onChange(true)
  }

  return (
    <button
      type="button"
      className="panel-handle"
      aria-expanded={open}
      aria-label={open ? 'Lukk panelet' : 'Åpne panelet'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
      onClick={() => {
        // Et drag etterfølges av et klikk; da er tilstanden allerede avgjort.
        if (dragged.current) dragged.current = false
        else onChange(!open)
      }}
    >
      <i className="panel-grip" />
      <span className="panel-handle-row">
        <span>{open ? '' : 'Kartvalg og info'}</span>
        <span className="panel-handle-action">{open ? 'Lukk ▼' : 'Åpne ▲'}</span>
      </span>
    </button>
  )
}
