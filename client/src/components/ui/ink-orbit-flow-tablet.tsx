import React from "react"
import { Mark, Portrait } from "./ink-orbit-pieces"

export function FlowDiagramTablet({
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
  const teamTablet = [
    { x: 58, y: 76, name: "Primary · Math" },
    { x: 114, y: 46, name: "Upper Primary · Science" },
    { x: 170, y: 80, name: "Secondary · Board" },
    { x: 52, y: 178, name: "Book Bank · Study" },
    { x: 164, y: 220, name: "Athletics · Sports" },
  ]

  const L1_t = "M130,136 C190,136 210,190 262,190"
  const L2_t = "M130,146 C180,146 204,210 262,210"
  const R1_t = "M378,190 C412,190 424,150 450,150"
  const R2_t = "M378,210 C412,210 424,240 450,240"

  return (
    <svg
      className="ib-diagram ib-flow-svg ib-flow-tablet"
      viewBox="0 0 640 380"
      role="img"
      aria-label={"Students learning through " + brand + " academic continuum"}
    >
      <defs>
        <radialGradient id={glow + "t"} cx="320" cy="190" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--ib-raise)" stopOpacity="1" />
          <stop offset="1" stopColor="var(--ib-raise)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="640" height="380" fill={"url(#" + glow + "t)"} rx="12" />

      {/* Classroom / Mentor Cluster */}
      <g onMouseEnter={() => setSide("left")} onMouseLeave={() => setSide("")}>
        {teamTablet.map((m, i) => (
          <line key={"lt" + i} x1={m.x} y1={m.y} x2="114" y2="140" stroke="var(--ib-line-strong)" strokeDasharray="2 3" />
        ))}
        <g transform="translate(98,124)">
          <rect width="32" height="32" rx="7" className="ib-node" />
          <g transform="translate(7,7)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
            <Mark size={18} />
          </g>
        </g>
        {teamTablet.map((m, i) => {
          const tipW = m.name.length * 5.6 + 14
          const tipX = Math.max(tipW / 2 + 6, Math.min(634 - tipW / 2, m.x))
          return (
            <g key={i} className="ib-av" tabIndex={0} role="img" aria-label={m.name}>
              <svg x={m.x - 14} y={m.y - 14} width="28" height="28" viewBox="0 0 22 22" overflow="visible">
                <clipPath id={uid + "avct" + i}>
                  <circle cx="11" cy="11" r="11" />
                </clipPath>
                <g clipPath={"url(#" + uid + "avct" + i + ")"}>
                  <Portrait index={i} size={22} uid={uid + "ft"} />
                </g>
                <circle cx="11" cy="11" r="10.5" fill="none" stroke="var(--ib-paper)" strokeWidth="1.5" />
              </svg>
              <circle cx={m.x + 10} cy={m.y + 10} r="3" fill={i === 4 ? "var(--ib-faint)" : "#22c55e"} stroke="var(--ib-paper)" className={i === 4 ? undefined : "ib-presence"} />
              <g className="ib-av-tip" transform={"translate(" + tipX + "," + (m.y - 20) + ")"}>
                <rect x={-tipW / 2} y="-10" width={tipW} height="16" rx="2" fill="var(--ib-inv)" />
                <text x="0" y="2" textAnchor="middle" fontSize="8.5" fill="var(--ib-inv-ink)" fontFamily="var(--ib-sans)">
                  {m.name}
                </text>
              </g>
            </g>
          )
        })}
      </g>

      {/* Connectors */}
      {[L1_t, L2_t].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "left" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {[R1_t, R2_t].map((d, i) => (
        <path key={d} d={d} className={"ib-flow" + (side === "right" ? " ib-flow-on" : "") + (i ? " ib-dash" : "")} />
      ))}
      {!reduced &&
        [L1_t, L2_t, R1_t, R2_t].map((d, i) => (
          <circle key={"pt" + i} r="2.8" className="ib-pkt">
            <animateMotion dur={2.2 + (i % 2) * 0.6 + "s"} begin={i * 0.35 + "s"} repeatCount="indefinite" path={d} />
          </circle>
        ))}

      {/* Hub Chip */}
      <g transform="translate(262,168)">
        <rect x="-4" y="-4" width="124" height="64" rx="10" fill="none" stroke="var(--ib-line)" className={reduced ? undefined : "ib-glow"} />
        <rect width="116" height="56" rx="8" className="ib-node" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,.15))" }} />
        <g transform="translate(14,18)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
          <Mark size={20} />
        </g>
        <text x="40" y="34" fontSize="11" letterSpacing="1.5" fontWeight="700" fill="var(--ib-soft)" fontFamily="var(--ib-sans)">
          {chip}
        </text>
        <path d="M100 24l5 5-5 5" fill="none" stroke="var(--ib-muted)" strokeWidth="1.5" />
      </g>

      {/* Progress / Report Stack */}
      <g onMouseEnter={() => setSide("right")} onMouseLeave={() => setSide("")}>
        {[1, 0].map((k) => (
          <g key={reports - k} transform={"translate(" + (450 + k * 14) + "," + (110 - k * 12) + ")"} opacity={1 - k * 0.3}>
            <g className={"ib-sheet" + (k === 0 ? " ib-sheet-new" : "")}>
              <rect width="154" height="160" rx="6" fill="var(--ib-raise)" stroke="var(--ib-line-strong)" />
              {k === 0 && (
                <>
                  <text x="12" y="24" fontSize="9.5" fontWeight="600" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
                    {"PROGRESS RECORD #" + reports}
                  </text>
                  <rect x="12" y="34" width="76" height="7" rx="2" fill="var(--color-accent, #0000d8)" opacity=".85" />
                  <rect x="12" y="48" width="108" height="4" rx="1" fill="var(--ib-line-strong)" />
                  <rect x="12" y="56" width="90" height="4" rx="1" fill="var(--ib-line-strong)" />
                  {[24, 38, 20, 48, 34, 56].map((h, j) => (
                    <rect key={j} x={14 + j * 16} y={146 - h} width="10" height={h} rx="2" fill="var(--color-accent-on-dark, #8fa8ff)" opacity={0.35 + j * 0.12} />
                  ))}
                  <path d="M104 102h38M104 114h30M104 126h36" stroke="var(--ib-line-strong)" strokeWidth="2.5" />
                </>
              )}
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}

