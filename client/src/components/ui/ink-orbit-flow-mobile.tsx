import React from "react"
import { Mark, Portrait } from "./ink-orbit-pieces"

export function FlowDiagramMobile({
  brand,
  uid,
  reduced,
  chip,
  glow,
  reports,
  setSide,
  side,
}: {
  brand: string
  uid: string
  reduced: boolean
  chip: string
  glow: string
  reports: number
  setSide: (s: "" | "left" | "right") => void
  side: "" | "left" | "right"
}) {
  const teamMobile = [
    { x: 66, y: 36, name: "Primary · Math" },
    { x: 170, y: 22, name: "Upper Primary · Science" },
    { x: 274, y: 36, name: "Secondary · Curriculum" },
    { x: 82, y: 96, name: "Book Bank · Study" },
    { x: 258, y: 96, name: "Athletics · Fitness" },
  ]

  const L1_m = "M155,116 C155,148 160,158 160,186"
  const L2_m = "M185,116 C185,148 180,158 180,186"
  const R1_m = "M160,244 C160,270 155,278 155,300"
  const R2_m = "M180,244 C180,270 185,278 185,300"

  return (
    <svg
      className="ib-diagram ib-flow-svg ib-flow-mobile"
      viewBox="0 0 340 425"
      role="img"
      aria-label={"Students learning through " + brand + " academic continuum"}
    >
      <defs>
        <radialGradient id={glow + "m"} cx="170" cy="210" r="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--ib-raise)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--ib-raise)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="340" height="425" fill={"url(#" + glow + "m)"} rx="12" />

      {/* Top Section: Avatar Cluster */}
      <g onMouseEnter={() => setSide("left")} onMouseLeave={() => setSide("")}>
        {teamMobile.map((m, i) => (
          <line key={"lm" + i} x1={m.x} y1={m.y} x2="170" y2="66" stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
        ))}
        <g transform="translate(156,52)">
          <rect width="28" height="28" rx="6" className="ib-node" />
          <g transform="translate(6,6)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
            <Mark size={16} />
          </g>
        </g>
        {teamMobile.map((m, i) => {
          const tipW = m.name.length * 5.2 + 12
          const tipX = Math.max(tipW / 2 + 6, Math.min(334 - tipW / 2, m.x))
          return (
            <g key={i} className="ib-av" tabIndex={0} role="img" aria-label={m.name}>
              <svg x={m.x - 16} y={m.y - 16} width="32" height="32" viewBox="0 0 22 22" overflow="visible">
                <clipPath id={uid + "avcm" + i}>
                  <circle cx="11" cy="11" r="11" />
                </clipPath>
                <g clipPath={"url(#" + uid + "avcm" + i + ")"}>
                  <Portrait index={i} size={22} uid={uid + "fm"} />
                </g>
                <circle cx="11" cy="11" r="10.5" fill="none" stroke="var(--ib-paper)" strokeWidth="1.5" />
              </svg>
              <circle cx={m.x + 11} cy={m.y + 11} r="3.2" fill={i === 4 ? "var(--ib-faint)" : "#22c55e"} stroke="var(--ib-paper)" className={i === 4 ? undefined : "ib-presence"} />
              <g className="ib-av-tip" transform={"translate(" + tipX + "," + (m.y - 20) + ")"}>
                <rect x={-tipW / 2} y="-9" width={tipW} height="15" rx="2" fill="var(--ib-inv)" />
                <text x="0" y="1.5" textAnchor="middle" fontSize="8" fill="var(--ib-inv-ink)" fontFamily="var(--ib-sans)">
                  {m.name}
                </text>
              </g>
            </g>
          )
        })}
      </g>

      {/* Middle Connectors: Top cluster to SHSVM */}
      {[L1_m, L2_m].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "left" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {!reduced &&
        [L1_m, L2_m].map((d, i) => (
          <circle key={"pm" + i} r="2.8" className="ib-pkt">
            <animateMotion dur={2.2 + i * 0.4 + "s"} begin={i * 0.35 + "s"} repeatCount="indefinite" path={d} />
          </circle>
        ))}

      {/* Middle: SHSVM Node (Full-Width Card) */}
      <g transform="translate(36,186)">
        <rect x="-4" y="-4" width="276" height="66" rx="12" fill="none" stroke="var(--ib-line)" className={reduced ? undefined : "ib-glow"} />
        <rect width="268" height="58" rx="10" className="ib-node" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,.12))" }} />
        <g transform="translate(18,17)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
          <Mark size={24} />
        </g>
        <text x="56" y="32" fontSize="13.5" letterSpacing="1.8" fontWeight="700" fill="var(--ib-soft)" fontFamily="var(--ib-sans)">
          {chip}
        </text>
        <text x="56" y="47" fontSize="8.5" letterSpacing="1" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
          ACADEMIC CONTINUUM
        </text>
        <path d="M246 25l5 5-5 5" fill="none" stroke="var(--ib-muted)" strokeWidth="1.6" />
      </g>

      {/* Lower Connectors: SHSVM to Progress Stack */}
      {[R1_m, R2_m].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "right" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {!reduced &&
        [R1_m, R2_m].map((d, i) => (
          <circle key={"prm" + i} r="2.8" className="ib-pkt">
            <animateMotion dur={2.2 + i * 0.4 + "s"} begin={0.7 + i * 0.35 + "s"} repeatCount="indefinite" path={d} />
          </circle>
        ))}

      {/* Bottom Section: Progress-Record Card */}
      <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")} transform="translate(36,298)">
        <rect x="6" y="6" width="256" height="106" rx="8" fill="var(--ib-raise)" stroke="var(--ib-line-strong)" opacity="0.6" />
        <g className="ib-sheet ib-sheet-new">
          <rect width="268" height="114" rx="8" fill="var(--ib-raise)" stroke="var(--ib-line-strong)" />
          <text x="14" y="20" fontSize="10.5" fontWeight="600" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
            {"PROGRESS RECORD #" + reports}
          </text>
          <rect x="14" y="28" width="116" height="6" rx="2" fill="var(--color-accent, #0000d8)" opacity=".85" />
          <rect x="14" y="38" width="168" height="3" rx="1" fill="var(--ib-line-strong)" />
          <rect x="14" y="44" width="144" height="3" rx="1" fill="var(--ib-line-strong)" />
          {[22, 34, 18, 42, 30, 48].map((h, j) => (
            <rect key={j} x={16 + j * 24} y={104 - h} width="14" height={h} rx="2" fill="var(--color-accent-on-dark, #8fa8ff)" opacity={0.35 + j * 0.12} />
          ))}
          <path d="M190 68h60M190 78h48M190 88h54" stroke="var(--ib-line-strong)" strokeWidth="2.5" />
        </g>
      </g>
    </svg>
  )
}

