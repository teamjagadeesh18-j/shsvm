import React from "react"
import { type InkFeatures } from "./ink-orbit-utils"
import { Brackets } from "./ink-orbit-pieces"
import { FlowDiagramDesktop } from "./ink-orbit-flow-desktop"
import { FlowDiagramTablet } from "./ink-orbit-flow-tablet"
import { FlowDiagramMobile } from "./ink-orbit-flow-mobile"

export function FlowCard({
  brand,
  features,
  uid,
  reduced,
  inView,
}: {
  brand: string
  features: InkFeatures
  uid: string
  reduced: boolean
  inView: boolean
}) {
  const [reports, setReports] = React.useState(128)
  const [side, setSide] = React.useState("" as "" | "left" | "right")

  React.useEffect(() => {
    if (reduced || !inView) return
    const t = setInterval(() => setReports((n) => n + 1), 2800)
    return () => clearInterval(t)
  }, [reduced, inView])

  const team = [
    { x: 58, y: 38, name: "Primary · Foundational Math" },
    { x: 104, y: 22, name: "Upper Primary · Science & Math" },
    { x: 150, y: 40, name: "Secondary · Board Curriculum" },
    { x: 46, y: 92, name: "Book Bank · Literature Study" },
    { x: 146, y: 114, name: "Athletics · Physical Fitness" },
  ]

  const L1 = "M117,67 C196,67 210,100 262,100"
  const L2 = "M117,73 C186,73 206,120 262,120"
  const R1 = "M378,100 C412,100 418,86 450,86"
  const R2 = "M378,120 C412,120 418,134 450,134"

  const chip = (brand || "SHSVM").split(" ")[0].toUpperCase()
  const chipLong = chip.length * 6.7 > 58
  const rays = uid + "rays"
  const glow = uid + "glow"

  return (
    <div className="ib-frame ib-frame-hover ib-wide">
      <Brackets />
      <div className="ib-card ib-flow-card">
        <div className="ib-diagram-container">
          <FlowDiagramDesktop
            brand={brand}
            uid={uid}
            reduced={reduced}
            team={team}
            L1={L1}
            L2={L2}
            R1={R1}
            R2={R2}
            chip={chip}
            chipLong={chipLong}
            rays={rays}
            glow={glow}
            reports={reports}
            setSide={setSide}
            side={side}
          />
          <FlowDiagramTablet
            brand={brand}
            uid={uid}
            reduced={reduced}
            chip={chip}
            glow={glow}
            reports={reports}
            setSide={setSide}
            side={side}
          />
          <FlowDiagramMobile
            brand={brand}
            uid={uid}
            reduced={reduced}
            chip={chip}
            glow={glow}
            reports={reports}
            setSide={setSide}
            side={side}
          />
        </div>
        <div className="ib-wide-copy">
          <div className="ib-flow-col">
            <h3>{features.collaboration.title}</h3>
            <p>{features.collaboration.description}</p>
          </div>
          <div className="ib-flow-divider" />
          <div className="ib-flow-col">
            <h3>{features.reports.title}</h3>
            <p>{features.reports.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
