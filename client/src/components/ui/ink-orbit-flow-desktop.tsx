import React from "react"
import { Mark, Portrait } from "./ink-orbit-pieces"

export function FlowDiagramDesktop({
  brand,
  uid,
  reduced,
  team,
  L1,
  L2,
  R1,
  R2,
  chip,
  chipLong,
  rays,
  glow,
  reports,
  setSide,
  side,
}: {
  brand: string
  uid: string
  reduced: boolean
  team: { x: number; y: number; name: string }[]
  L1: string
  L2: string
  R1: string
  R2: string
  chip: string
  chipLong: boolean
  rays: string
  glow: string
  reports: number
  setSide: (s: "" | "left" | "right") => void
  side: "" | "left" | "right"
}) {
  return (
    <svg
      className="ib-diagram ib-flow-svg ib-flow-desktop"
      viewBox="0 0 640 178"
      role="img"
      aria-label={"Students learning through " + brand + " academic continuum"}
    >
      <defs>
        <radialGradient id={glow} cx="320" cy="110" r="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--ib-raise)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--ib-raise)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={rays} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ib-line-strong)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--ib-line-strong)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="640" height="178" fill={"url(#" + glow + ")"} />
      {[-62, -38, -14, 14, 38, 62].map((a, i) => (
        <path
          key={i}
          d={
            "M320,110 L" +
            (320 + Math.sin((a * Math.PI) / 180) * 260) +
            "," +
            (110 - Math.cos((a * Math.PI) / 180) * 260) +
            " L" +
            (320 + Math.sin(((a + 7) * Math.PI) / 180) * 260) +
            "," +
            (110 - Math.cos(((a + 7) * Math.PI) / 180) * 260) +
            "Z"
          }
          fill={"url(#" + rays + ")"}
          opacity=".5"
        />
      ))}

      {/* Classroom / Mentor Cluster */}
      <g onMouseEnter={() => setSide("left")} onMouseLeave={() => setSide("")}>
        <rect x="20" y="8" width="170" height="130" fill="transparent" />
        {team.map((m, i) => (
          <line key={"l" + i} x1={m.x} y1={m.y} x2="104" y2="70" stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
        ))}
        <g transform="translate(91,57)">
          <rect width="26" height="26" rx="5" className="ib-node" />
          <g transform="translate(5,5)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
            <Mark size={16} />
          </g>
        </g>
        {team.map((m, i) => {
          const tipW = m.name.length * 4.9 + 12
          const tipX = Math.max(tipW / 2 + 4, Math.min(636 - tipW / 2, m.x))
          return (
            <g key={i} className="ib-av" tabIndex={0} role="img" aria-label={m.name}>
              <svg x={m.x - 11} y={m.y - 11} width="22" height="22" viewBox="0 0 22 22" overflow="visible">
                <clipPath id={uid + "avc" + i}>
                  <circle cx="11" cy="11" r="11" />
                </clipPath>
                <g clipPath={"url(#" + uid + "avc" + i + ")"}>
                  <Portrait index={i} size={22} uid={uid + "f"} />
                </g>
                <circle cx="11" cy="11" r="10.5" fill="none" stroke="var(--ib-paper)" strokeWidth="1.5" />
              </svg>
              <circle cx={m.x + 8} cy={m.y + 8} r="2.6" fill={i === 4 ? "var(--ib-faint)" : "#22c55e"} stroke="var(--ib-paper)" className={i === 4 ? undefined : "ib-presence"} />
              <g className="ib-av-tip" transform={"translate(" + tipX + "," + (m.y - 18) + ")"}>
                <rect x={-tipW / 2} y="-9" width={tipW} height="14" rx="2" fill="var(--ib-inv)" />
                <text x="0" y="1" textAnchor="middle" fontSize="7.5" fill="var(--ib-inv-ink)" fontFamily="var(--ib-sans)">
                  {m.name}
                </text>
              </g>
            </g>
          )
        })}
      </g>

      {/* Connectors */}
      {[L1, L2].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "left" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {[R1, R2].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "right" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {!reduced &&
        [L1, L2, R1, R2].map((d, i) => (
          <circle key={"p" + i} r="2.2" className="ib-pkt">
            <animateMotion dur={2.2 + (i % 2) * 0.6 + "s"} begin={i * 0.35 + "s"} repeatCount="indefinite" path={d} />
          </circle>
        ))}

      {/* Hub Chip */}
      <g transform="translate(262,88)">
        <rect x="-4" y="-4" width="124" height="52" rx="8" fill="none" stroke="var(--ib-line)" className={reduced ? undefined : "ib-glow"} />
        <rect width="116" height="44" rx="6" className="ib-node" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.08))" }} />
        <g transform="translate(13,14)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
          <Mark size={16} />
        </g>
        <text x="36" y="26" fontSize="8.5" letterSpacing="1.4" fontWeight="700" fill="var(--ib-soft)" fontFamily="var(--ib-sans)" textLength={chipLong ? 58 : undefined} lengthAdjust={chipLong ? "spacingAndGlyphs" : undefined}>
          {chip}
        </text>
        <path d="M100 18l4 4-4 4" fill="none" stroke="var(--ib-muted)" strokeWidth="1.3" />
      </g>

      {/* Progress / Report Stack */}
      <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")}>
        {[2, 1, 0].map((k) => (
          <g key={reports - k} transform={"translate(" + (450 + k * 12) + "," + (40 - k * 10) + ")"} opacity={1 - k * 0.25}>
            <g className={"ib-sheet" + (k === 0 ? " ib-sheet-new" : "")}>
              <rect width="138" height="102" rx="3" fill="var(--ib-raise)" stroke="var(--ib-line-strong)" />
              {k === 0 && (
                <>
                  <text x="10" y="16" fontSize="7" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
                    {"PROGRESS RECORD #" + reports}
                  </text>
                  <rect x="10" y="24" width="64" height="5" rx="1" fill="var(--color-accent, #0000d8)" opacity=".85" />
                  <rect x="10" y="33" width="92" height="3" rx="1" fill="var(--ib-line-strong)" />
                  <rect x="10" y="39" width="80" height="3" rx="1" fill="var(--ib-line-strong)" />
                  {[18, 26, 14, 30, 22, 34].map((h, j) => (
                    <rect key={j} x={12 + j * 13} y={92 - h} width="8" height={h} fill="var(--color-accent-on-dark, #8fa8ff)" opacity={0.35 + j * 0.12} />
                  ))}
                  <path d="M92 64h34M92 72h28M92 80h32" stroke="var(--ib-line-strong)" strokeWidth="2.5" />
                </>
              )}
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}

