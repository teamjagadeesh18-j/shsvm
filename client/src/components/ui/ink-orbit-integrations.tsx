import React from "react"
import {
  type InkFeatures,
  Brackets,
  Mark,
  ToolGlyph,
} from "./ink-orbit-pieces"

export function IntegrationsCard({ copy, reduced }: { copy: InkFeatures["integrations"]; reduced: boolean }) {
  const [hover, setHover] = React.useState(-1)
  const [auto, setAuto] = React.useState(0)

  React.useEffect(() => {
    if (reduced || hover >= 0) return
    const t = setInterval(() => setAuto((a) => (a + 1) % 4), 1700)
    return () => clearInterval(t)
  }, [reduced, hover])

  const on = hover >= 0 ? hover : reduced ? -1 : auto
  const tilesDesktop = [
    { x: 66, y: 34 },
    { x: 66, y: 116 },
    { x: 234, y: 34 },
    { x: 234, y: 116 },
  ]

  const pathDesktop = (i: number) => {
    const t = tilesDesktop[i]
    const dir = t.x < 150 ? -1 : 1
    return "M" + (150 + dir * 17) + ",75 H" + (150 + dir * 42) + " V" + t.y + " H" + (t.x - dir * 15)
  }

  const tilesMobile = [
    { x: 64, y: 52 },
    { x: 64, y: 224 },
    { x: 256, y: 52 },
    { x: 256, y: 224 },
  ]

  const pathMobile = (i: number) => {
    const t = tilesMobile[i]
    const isLeft = t.x < 160
    const startX = isLeft ? 139 : 181
    const cornerX = isLeft ? 96 : 224
    const startY = t.y < 140 ? 122 : 154
    const targetY = t.y < 140 ? 74 : 202
    return "M" + startX + "," + startY + " H" + cornerX + " V" + targetY
  }

  return (
    <div className="ib-frame ib-frame-hover">
      <Brackets />
      <div className="ib-card ib-integrations-card">
        {/* Desktop / Tablet SVG */}
        <svg className="ib-diagram ib-integrations-svg ib-pillars-desktop" viewBox="0 0 300 150" role="group" aria-label="Curriculum Pillars">
          {tilesDesktop.map((_, i) => (
            <path key={i} d={pathDesktop(i)} className={"ib-flow" + (on === i ? " ib-flow-on" : "")} />
          ))}
          {!reduced && on >= 0 && (
            <circle key={on} r="2.2" className="ib-pkt">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={pathDesktop(on)} />
            </circle>
          )}
          <g transform="translate(133,58)">
            <rect width="34" height="34" rx="7" className="ib-node" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,.08))" }} />
            <g transform="translate(8,8)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
              <Mark size={18} />
            </g>
          </g>
          {tilesDesktop.map((t, i) => (
            <g
              key={i}
              className={"ib-tool" + (on === i ? " ib-tool-on" : "")}
              tabIndex={0}
              role="img"
              aria-label={copy.tools[i] ?? "Curriculum"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(-1)}
            >
              <rect x={t.x - 15} y={t.y - 15} width="30" height="30" rx="6" className="ib-node" />
              <g transform={"translate(" + t.x + "," + t.y + ")"} style={{ color: "var(--ib-ink)" }}>
                <ToolGlyph index={i} />
              </g>
              <text x={t.x} y={t.y + (t.y < 75 ? -21 : 28)} textAnchor="middle" fontSize="8" fontWeight="600" fill="var(--color-accent-on-dark, #8fa8ff)" fontFamily="var(--ib-sans)" opacity={on === i ? 1 : 0} style={{ transition: "opacity .25s" }}>
                {copy.tools[i] ?? ""}
              </text>
            </g>
          ))}
          <text x="150" y="112" textAnchor="middle" fontSize="7" fill="var(--ib-faint)" fontFamily="var(--ib-mono)">
            {on >= 0 ? "learning · " + (copy.tools[on] ?? "").toLowerCase() : "4 balanced pillars"}
          </text>
        </svg>

        {/* Mobile Vertical 2-Column SVG */}
        <svg className="ib-diagram ib-integrations-svg ib-pillars-mobile" viewBox="0 0 320 280" role="group" aria-label="Curriculum Pillars">
          {tilesMobile.map((_, i) => (
            <path key={"pm" + i} d={pathMobile(i)} className={"ib-flow" + (on === i ? " ib-flow-on" : "")} />
          ))}
          {!reduced && on >= 0 && (
            <circle key={"pktm" + on} r="2.8" className="ib-pkt">
              <animateMotion dur="1.1s" repeatCount="indefinite" path={pathMobile(on)} />
            </circle>
          )}
          <g transform="translate(138,116)">
            <rect width="44" height="44" rx="9" className="ib-node" style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,.15))" }} />
            <g transform="translate(11,11)" style={{ color: "var(--color-accent-on-dark, #8fa8ff)" }}>
              <Mark size={22} />
            </g>
          </g>
          {tilesMobile.map((t, i) => (
            <g
              key={"tm" + i}
              className={"ib-tool" + (on === i ? " ib-tool-on" : "")}
              tabIndex={0}
              role="img"
              aria-label={copy.tools[i] ?? "Curriculum"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(-1)}
            >
              <rect x={t.x - 22} y={t.y - 22} width="44" height="44" rx="9" className="ib-node" />
              <g transform={"translate(" + t.x + "," + t.y + ") scale(1.2)"} style={{ color: "var(--ib-ink)" }}>
                <ToolGlyph index={i} />
              </g>
              <text x={t.x} y={t.y + (t.y < 140 ? 36 : 36)} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--color-accent-on-dark, #8fa8ff)" fontFamily="var(--ib-sans)" opacity={on === i ? 1 : 0.85} style={{ transition: "opacity .25s" }}>
                {copy.tools[i] ?? ""}
              </text>
            </g>
          ))}
          <text x="160" y="176" textAnchor="middle" fontSize="9" fill="var(--ib-faint)" fontFamily="var(--ib-mono)">
            {on >= 0 ? "learning · " + (copy.tools[on] ?? "").toLowerCase() : "4 balanced pillars"}
          </text>
        </svg>

        <div className="ib-integrations-copy" style={{ marginTop: "auto" }}>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>
    </div>
  )
}
