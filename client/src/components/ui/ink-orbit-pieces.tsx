import React from "react"
import { parseTitle } from "./ink-orbit-utils"

export function Brackets() {
  return (
    <>
      <span className="ib-c ib-c-tl" aria-hidden="true" />
      <span className="ib-c ib-c-tr" aria-hidden="true" />
      <span className="ib-c ib-c-bl" aria-hidden="true" />
      <span className="ib-c ib-c-br" aria-hidden="true" />
    </>
  )
}

export function Title({ text, className = "ib-h2", as = "h2" }: { text: string; className?: string; as?: "h2" | "h3" }) {
  const Tag = as
  return (
    <Tag className={className}>
      {parseTitle(text).map((line, i) => (
        <span key={i}>
          {line.map((run, j) => (
            <React.Fragment key={j}>
              {run.muted ? <span className="ib-muted" style={{ display: "inline" }}>{run.text}</span> : run.text}
            </React.Fragment>
          ))}
        </span>
      ))}
    </Tag>
  )
}

export function Mark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const PORTRAITS = [
  { hair: "short", beard: false, glasses: false, skin: "#d9d0c5", hairC: "#1e1e1e", shirt: "#0000d8", bg: "#2a2a30" },
  { hair: "long", beard: false, glasses: false, skin: "#dfd6cb", hairC: "#3a2d24", shirt: "#333333", bg: "#222226" },
  { hair: "buzz", beard: false, glasses: true, skin: "#caa385", hairC: "#151515", shirt: "#1f1f1f", bg: "#2d2d35" },
  { hair: "bun", beard: false, glasses: true, skin: "#d2bca8", hairC: "#2a2118", shirt: "#0000d8", bg: "#24242a" },
  { hair: "curly", beard: false, glasses: false, skin: "#bb987b", hairC: "#111111", shirt: "#444444", bg: "#282830" },
  { hair: "side", beard: true, glasses: false, skin: "#caa385", hairC: "#2a221b", shirt: "#222222", bg: "#25252b" },
]

export function Portrait({ index, size = 38, uid }: { index: number; size?: number; uid: string }) {
  const p = PORTRAITS[((index % PORTRAITS.length) + PORTRAITS.length) % PORTRAITS.length]
  const id = uid + "pt" + index
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.bg} />
          <stop offset="1" stopColor="#151518" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={"url(#" + id + ")"} />
      <path d="M8 64c2-12 12-18 24-18s22 6 24 18z" fill={p.shirt} />
      <ellipse cx="32" cy="28" rx="11" ry="13" fill={p.skin} />
      <circle cx="27.5" cy="28" r="1.2" fill="#1a1a1a" />
      <circle cx="36.5" cy="28" r="1.2" fill="#1a1a1a" />
      {p.glasses && (
        <g fill="none" stroke="#1a1a1a" strokeWidth="1.1">
          <circle cx="27.5" cy="28" r="3.6" />
          <circle cx="36.5" cy="28" r="3.6" />
          <path d="M31.1 28h1.8" />
        </g>
      )}
      <path d="M29 34.5c1.8 1.2 4.2 1.2 6 0" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" opacity=".7" />
    </svg>
  )
}

export function ToolGlyph({ index }: { index: number }) {
  const k = index % 4
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {k === 0 && (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
      )}
      {k === 1 && (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </>
      )}
      {k === 2 && (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </>
      )}
      {k === 3 && (
        <>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </>
      )}
    </g>
  )
}

export type PointerSvgEv = React.PointerEvent<SVGSVGElement>
