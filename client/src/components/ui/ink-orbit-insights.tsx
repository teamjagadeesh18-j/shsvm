import React, { useRef, useEffect, useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
import { type InkFeatures, chartPaths, clamp } from "./ink-orbit-utils"
import { Brackets } from "./ink-orbit-pieces"
import { addScrollListener } from "../../services/scrollController"

const noopSubscribe = () => () => {}
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false)

const START_RATIO = 0.90
const END_RATIO = 0.40
const W = 300
const H = 130
const Y_BASE = 116

const HM = 210
const Y_BASE_M = 194

export function InsightsCard({
  copy,
  uid,
  reduced,
}: {
  copy: InkFeatures["insights"]
  uid: string
  reduced: boolean
}) {
  const { t } = useTranslation()
  const cardRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const pathMRef = useRef<SVGPathElement>(null)
  const pathLengthRef = useRef<number>(0)
  const pathMLengthRef = useRef<number>(0)
  const isClient = useIsClient()

  const vals = copy.values && copy.values.length > 1 ? copy.values : [74, 78, 83, 88, 92, 98]
  const { line, area, points } = chartPaths(vals, W, H, 14)
  const { line: lineM, area: areaM, points: pointsM } = chartPaths(vals, W, HM, 16)

  const fill = uid + "area"
  const fillM = uid + "aream"
  const clipId = uid + "clip"
  const clipIdM = uid + "clipm"
  const split = clamp(copy.forecastFrom || 4, 1, vals.length - 1)

  useEffect(() => {
    const cardEl = cardRef.current
    const pathEl = pathRef.current
    const pathMEl = pathMRef.current
    if (!cardEl) return

    try { pathLengthRef.current = pathEl?.getTotalLength() || 320 } catch { pathLengthRef.current = 320 }
    try { pathMLengthRef.current = pathMEl?.getTotalLength() || 340 } catch { pathMLengthRef.current = 340 }

    if (reduced) {
      cardEl.style.setProperty("--chart-progress", "1")
      cardEl.style.setProperty("--curve-scale-y", "1")
      cardEl.style.setProperty("--dot-x", `${points[points.length - 1][0]}px`)
      cardEl.style.setProperty("--dot-y", `${points[points.length - 1][1]}px`)
      cardEl.style.setProperty("--dot-y-m", `${pointsM[pointsM.length - 1][1]}px`)
      cardEl.style.setProperty("--tag-x", `${Math.max(40, Math.min(W - 40, points[points.length - 1][0]))}px`)
      cardEl.style.setProperty("--tag-x-m", `${Math.max(44, Math.min(W - 44, pointsM[pointsM.length - 1][0]))}px`)
      cardEl.style.setProperty("--dot-opacity", "1")
      cardEl.style.setProperty("--tag-opacity", "1")
      return
    }

    let cachedCardPageTop = 0
    let lastP = -1
    const measure = () => {
      const r = cardEl.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset || 0
      cachedCardPageTop = r.top + scrollY
      try { if (pathRef.current) pathLengthRef.current = pathRef.current.getTotalLength() } catch {}
      try { if (pathMRef.current) pathMLengthRef.current = pathMRef.current.getTotalLength() } catch {}
    }

    const updateChart = (scrollY = (window.scrollY || 0), winH = (window.innerHeight || 900)) => {
      const rTop = cachedCardPageTop - scrollY
      const startY = winH * START_RATIO
      const endY = winH * END_RATIO
      const rawP = (startY - rTop) / (startY - endY)
      const clampedP = Math.min(1, Math.max(0, rawP))
      const p = 1 - Math.pow(1 - clampedP, 1.8)

      if (Math.abs(p - lastP) < 0.002) return
      lastP = p

      const scaleY = 0.15 + 0.85 * p
      const totalLen = pathLengthRef.current || 320
      const totalLenM = pathMLengthRef.current || 340

      let pt = { x: points[0][0], y: points[0][1] }
      let ptM = { x: pointsM[0][0], y: pointsM[0][1] }
      if (p <= 0.001) {
        pt = { x: points[0][0], y: points[0][1] }
        ptM = { x: pointsM[0][0], y: pointsM[0][1] }
      } else if (p >= 0.999) {
        pt = { x: points[points.length - 1][0], y: points[points.length - 1][1] }
        ptM = { x: pointsM[pointsM.length - 1][0], y: pointsM[pointsM.length - 1][1] }
      } else {
        try { if (pathEl) pt = pathEl.getPointAtLength(p * totalLen) } catch {
          const idx = Math.min(points.length - 1, Math.floor(p * (points.length - 1)))
          pt = { x: points[idx][0], y: points[idx][1] }
        }
        try { if (pathMEl) ptM = pathMEl.getPointAtLength(p * totalLenM) } catch {
          const idx = Math.min(pointsM.length - 1, Math.floor(p * (pointsM.length - 1)))
          ptM = { x: pointsM[idx][0], y: pointsM[idx][1] }
        }
      }

      const dotX = pt.x
      const dotY = Y_BASE + (pt.y - Y_BASE) * scaleY
      const dotYM = Y_BASE_M + (ptM.y - Y_BASE_M) * scaleY
      const tagX = Math.max(45, Math.min(W - 45, dotX))
      const tagXM = Math.max(56, Math.min(W - 56, ptM.x))

      cardEl.style.setProperty("--chart-progress", p.toFixed(4))
      cardEl.style.setProperty("--curve-scale-y", scaleY.toFixed(4))
      cardEl.style.setProperty("--dot-x", `${dotX.toFixed(1)}px`)
      cardEl.style.setProperty("--dot-y", `${dotY.toFixed(1)}px`)
      cardEl.style.setProperty("--dot-y-m", `${dotYM.toFixed(1)}px`)
      cardEl.style.setProperty("--tag-x", `${tagX.toFixed(1)}px`)
      cardEl.style.setProperty("--tag-x-m", `${tagXM.toFixed(1)}px`)
      cardEl.style.setProperty("--dot-opacity", p > 0.05 ? "1" : "0")
      cardEl.style.setProperty("--tag-opacity", p > 0.9 ? `${((p - 0.9) / 0.1).toFixed(3)}` : "0")
    }

    measure()
    updateChart()

    const unsubscribeScroll = addScrollListener((scrollY, winH) => {
      updateChart(scrollY, winH)
    })

    const onResize = () => {
      measure()
      updateChart()
    }

    window.addEventListener("resize", onResize, { passive: true })
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measure()
        updateChart()
      })
      ro.observe(cardEl)
    }
    return () => {
      unsubscribeScroll()
      window.removeEventListener("resize", onResize)
      if (ro) ro.disconnect()
    }
  }, [reduced, points, pointsM])

  const chartTagText = t("holistic.chartTag", "Growing steadily")
  const distinctionText = t("holistic.distinctionLabel", "DISTINCTION")

  return (
    <div
      ref={cardRef}
      className="ib-frame ib-frame-hover ib-insights-frame"
      style={{
        ["--chart-progress" as string]: isClient && !reduced ? "0" : "1",
        ["--curve-scale-y" as string]: isClient && !reduced ? "0.15" : "1",
        ["--dot-opacity" as string]: isClient && !reduced ? "0" : "1",
        ["--tag-opacity" as string]: isClient && !reduced ? "0" : "1",
        ["--dot-x" as string]: `${points[points.length - 1][0]}px`,
        ["--dot-y" as string]: `${points[points.length - 1][1]}px`,
        ["--dot-y-m" as string]: `${pointsM[pointsM.length - 1][1]}px`,
        ["--tag-x" as string]: `${Math.max(45, Math.min(W - 45, points[points.length - 1][0]))}px`,
        ["--tag-x-m" as string]: `${Math.max(56, Math.min(W - 56, pointsM[pointsM.length - 1][0]))}px`,
      }}
    >
      <Brackets />
      <div className="ib-card ib-chart-card">
        {/* Desktop / Tablet Chart (Aspect Ratio ~2.2:1) */}
        <svg className="ib-diagram ib-chart ib-chart-desktop" viewBox={"0 0 " + W + " " + (H + 6)} role="img" aria-label={copy.title + " chart"}>
          <defs>
            <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--color-accent, #0000d8)" stopOpacity=".28" />
              <stop offset="1" stopColor="var(--color-accent, #0000d8)" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={W} height={H + 6} className="ib-chart-clip-rect" style={{ transform: "scaleX(var(--chart-progress, 1))", transformOrigin: "0 0" }} />
            </clipPath>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="14" x2={W - 14} y1={H * g} y2={H * g} stroke="var(--ib-line)" />
          ))}
          <text x={points[split][0] - 4} y={H - 18} textAnchor="end" fontSize="7" fill="var(--ib-faint)" fontFamily="var(--ib-mono)">
            {distinctionText}
          </text>
          <path d={area} fill={"url(#" + fill + ")"} clipPath={"url(#" + clipId + ")"} className="ib-chart-area" />
          <g className="ib-chart-curve-group" style={{ transformOrigin: `0 ${Y_BASE}px`, transform: "scaleY(var(--curve-scale-y, 1))" }}>
            <path ref={pathRef} d={line} fill="none" stroke="var(--color-accent-on-dark, #8fa8ff)" strokeWidth="1.6" pathLength={1} className="ib-line-draw ib-scroll-curve" style={{ strokeDasharray: "1", strokeDashoffset: "calc(1 - var(--chart-progress, 1))", vectorEffect: "non-scaling-stroke" }} opacity=".95" />
          </g>
          <line x1="0" x2="0" y1="10" y2={Y_BASE} stroke="var(--ib-line-strong)" strokeDasharray="2 3" className="ib-chart-marker-line" style={{ transform: "translateX(var(--dot-x, 286px))", opacity: "var(--dot-opacity, 1)" }} />
          {!reduced && <circle cx="0" cy="0" r="7" fill="var(--color-accent, #0000d8)" className="ib-glow ib-chart-dot-halo" style={{ transform: "translate(var(--dot-x, 286px), var(--dot-y, 22px))", opacity: "calc(var(--dot-opacity, 1) * 0.25)" }} />}
          <circle cx="0" cy="0" r="3.2" fill="var(--ib-raise)" stroke="var(--color-accent, #0000d8)" strokeWidth="1.8" className="ib-chart-end-dot" style={{ transform: "translate(var(--dot-x, 286px), var(--dot-y, 22px))", opacity: "var(--dot-opacity, 1)" }} />
          <g className="ib-chart-tag" style={{ transform: "translate(var(--tag-x, 246px), calc(var(--dot-y, 22px) - 13px))", opacity: "var(--tag-opacity, 1)" }}>
            <rect x="-38" y="-11" width="76" height="15" rx="2" fill="var(--ib-inv)" />
            <text x="0" y="-1" textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--ib-inv-ink)" fontFamily="var(--ib-mono)">{chartTagText}</text>
          </g>
        </svg>

        {/* Mobile Chart (Aspect Ratio 4:3 = 300x225) */}
        <svg className="ib-diagram ib-chart ib-chart-mobile" viewBox={"0 0 " + W + " " + (HM + 15)} role="img" aria-label={copy.title + " chart"}>
          <defs>
            <linearGradient id={fillM} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--color-accent, #0000d8)" stopOpacity=".32" />
              <stop offset="1" stopColor="var(--color-accent, #0000d8)" stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipIdM}>
              <rect x="0" y="0" width={W} height={HM + 15} className="ib-chart-clip-rect" style={{ transform: "scaleX(var(--chart-progress, 1))", transformOrigin: "0 0" }} />
            </clipPath>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={"gm" + g} x1="14" x2={W - 14} y1={HM * g} y2={HM * g} stroke="var(--ib-line)" />
          ))}
          <text x={pointsM[split][0] - 6} y={HM - 22} textAnchor="end" fontSize="10" fontWeight="600" fill="var(--ib-muted)" fontFamily="var(--ib-mono)">
            {distinctionText}
          </text>
          <path d={areaM} fill={"url(#" + fillM + ")"} clipPath={"url(#" + clipIdM + ")"} className="ib-chart-area" />
          <g className="ib-chart-curve-group" style={{ transformOrigin: `0 ${Y_BASE_M}px`, transform: "scaleY(var(--curve-scale-y, 1))" }}>
            <path ref={pathMRef} d={lineM} fill="none" stroke="var(--color-accent-on-dark, #8fa8ff)" strokeWidth="2.2" pathLength={1} className="ib-line-draw ib-scroll-curve" style={{ strokeDasharray: "1", strokeDashoffset: "calc(1 - var(--chart-progress, 1))", vectorEffect: "non-scaling-stroke" }} opacity=".95" />
          </g>
          <line x1="0" x2="0" y1="12" y2={Y_BASE_M} stroke="var(--ib-line-strong)" strokeDasharray="2 3" strokeWidth="1.4" className="ib-chart-marker-line" style={{ transform: "translateX(var(--dot-x, 286px))", opacity: "var(--dot-opacity, 1)" }} />
          {!reduced && <circle cx="0" cy="0" r="9" fill="var(--color-accent, #0000d8)" className="ib-glow ib-chart-dot-halo" style={{ transform: "translate(var(--dot-x, 286px), var(--dot-y-m, 28px))", opacity: "calc(var(--dot-opacity, 1) * 0.28)" }} />}
          <circle cx="0" cy="0" r="4.2" fill="var(--ib-raise)" stroke="var(--color-accent, #0000d8)" strokeWidth="2" className="ib-chart-end-dot" style={{ transform: "translate(var(--dot-x, 286px), var(--dot-y-m, 28px))", opacity: "var(--dot-opacity, 1)" }} />
          <g className="ib-chart-tag" style={{ transform: "translate(var(--tag-x-m, 246px), calc(var(--dot-y-m, 28px) - 15px))", opacity: "var(--tag-opacity, 1)" }}>
            <rect x="-52" y="-13" width="104" height="18" rx="4" fill="var(--ib-inv)" />
            <text x="0" y="-1" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--ib-inv-ink)" fontFamily="var(--ib-mono)">{chartTagText}</text>
          </g>
        </svg>

        <div className="ib-chart-copy" style={{ marginTop: "auto" }}>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>
    </div>
  )
}
