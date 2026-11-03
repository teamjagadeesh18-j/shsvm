"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import {
  type InkFeatures,
  type InkFeatureCopy,
} from "./ink-orbit-utils"
import {
  Title,
} from "./ink-orbit-pieces"
import { useInView } from "./useInViewInk"
import { FlowCard } from "./ink-orbit-cards"
import { IntegrationsCard } from "./ink-orbit-integrations"
import { InsightsCard } from "./ink-orbit-insights"
import PanelSection from "../common/PanelSection/PanelSection"
import SectionPill from "../common/SectionPill/SectionPill"
import OutlineButton from "../common/OutlineButton/OutlineButton"
import "./ink-orbit-features.css"
import "./ink-orbit-animations.css"
import "./ink-orbit-responsive.css"

export type { InkFeatureCopy, InkFeatures }

export type InkOrbitFeaturesProps = {
  theme?: "light" | "dark" | "auto"
  brand?: string
  tag?: string
  title?: string
  collaboration?: { [K in keyof InkFeatureCopy]?: InkFeatureCopy[K] }
  reports?: { [K in keyof InkFeatureCopy]?: InkFeatureCopy[K] }
  integrations?: { [K in keyof InkFeatures["integrations"]]?: InkFeatures["integrations"][K] }
  insights?: { [K in keyof InkFeatures["insights"]]?: InkFeatures["insights"][K] }
  className?: string
  style?: React.CSSProperties
}

const D_FEATURES: InkFeatures = {
  tag: "ACADEMIC CONTINUUM",
  title: "Holistic *Education* & Classroom Mentorship",
  collaboration: {
    title: "Classroom Mentorship & Guidance",
    description: "Students learn through dedicated State Board faculty guidance, hands-on classroom activities, and peer collaboration from primary to secondary grades.",
  },
  reports: {
    title: "Structured Progress Tracking",
    description: "Comprehensive term evaluations, individual student feedback, and continuous progress reporting across academic subjects and arts.",
  },
  integrations: {
    title: "Core Curriculum Pillars",
    description: "Harmonizing State Board syllabus, academic book bank study resources, recreation playground, and cultural arts into one balanced continuum.",
    tools: ["State Board", "Book Bank", "Sports", "Arts"],
  },
  insights: {
    title: "Academic Growth & Performance",
    description: "Continuous mentorship and supportive evaluations that help every child build a lifelong love of learning.",
    values: [74, 78, 77, 83, 82, 88, 86, 92, 91, 96, 98, 100],
    forecastFrom: 8,
  },
}

export default function InkOrbitFeatures({
  theme = "dark",
  brand = "SHSVM School",
  tag,
  title,
  collaboration,
  reports,
  integrations,
  insights,
  className = "",
  style,
}: InkOrbitFeaturesProps) {
  const { t } = useTranslation()
  const uid = "ib" + React.useId().replace(/[^a-zA-Z0-9]/g, "")

  const F: InkFeatures = {
    tag: tag || t("holistic.tag", D_FEATURES.tag),
    title: title || t("holistic.title", D_FEATURES.title),
    collaboration: {
      title: collaboration?.title || t("holistic.collaborationTitle", D_FEATURES.collaboration.title),
      description: collaboration?.description || t("holistic.collaborationDesc", D_FEATURES.collaboration.description),
    },
    reports: {
      title: reports?.title || t("holistic.reportsTitle", D_FEATURES.reports.title),
      description: reports?.description || t("holistic.reportsDesc", D_FEATURES.reports.description),
    },
    integrations: {
      title: integrations?.title || t("holistic.integrationsTitle", D_FEATURES.integrations.title),
      description: integrations?.description || t("holistic.integrationsDesc", D_FEATURES.integrations.description),
      tools: integrations?.tools || D_FEATURES.integrations.tools,
    },
    insights: {
      title: insights?.title || t("holistic.insightsTitle", D_FEATURES.insights.title),
      description: insights?.description || t("holistic.insightsDesc", D_FEATURES.insights.description),
      values: insights?.values || D_FEATURES.insights.values,
      forecastFrom: insights?.forecastFrom || D_FEATURES.insights.forecastFrom,
    },
  }

  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(motion.matches)
    motion.addEventListener?.("change", sync)
    return () => motion.removeEventListener?.("change", sync)
  }, [])

  const [featRef, featIn] = useInView(0.12)

  return (
    <PanelSection
      id="holistic"
      ariaLabel={t("holistic.title", "Holistic Education & Classroom Mentorship").replace(/\*/g, "")}
      className="holistic-panel-section"
    >
      <div className={"ib-root " + className} data-theme={theme} style={style}>
        <div className="ib-shell">
          <div className="ib-reveal" ref={featRef as never} data-in={featIn}>
            {/* Top Bar: Pill on Left, Outlined Button on Right */}
            <div className="ib-top-bar">
              {F.tag && <SectionPill variant="dark">{F.tag}</SectionPill>}
              <OutlineButton to="/academics" arrow={true}>
                {t("holistic.btnAcademics", "Explore Academics")}
              </OutlineButton>
            </div>
            <div className="ib-head" id={uid + "feat"}>
              <Title text={F.title} />
            </div>
            <div className="ib-bento">
              <FlowCard brand={brand} features={F} uid={uid} reduced={reduced} inView={featIn} />
              <IntegrationsCard copy={F.integrations} reduced={reduced} />
              <InsightsCard copy={F.insights} uid={uid} reduced={reduced} />
            </div>
          </div>
        </div>
      </div>
    </PanelSection>
  )
}
