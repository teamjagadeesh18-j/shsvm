import React from "react";
import "./community-testimonial.css";

/**
 * Deterministic color palette for avatar initials.
 * Generates an authoritative, accessible backdrop for each first letter.
 */
const AVATAR_COLORS = [
  "#0000d8", // Royal Blue brand
  "#1e40af", // Deep Indigo
  "#047857", // Forest Emerald
  "#b45309", // Warm Amber
  "#6d28d9", // Vibrant Purple
  "#0f766e", // Deep Teal
  "#c2410c", // Brick Orange
];

function getAvatarBg(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * TestimonialCard
 * Displays quote, character's initial avatar (no faces), name and title.
 */
export const TestimonialCard = ({ quote, authorName, authorTitle }) => {
  const firstLetter = authorName ? authorName.trim().charAt(0).toUpperCase() : "•";
  const avatarBg = getAvatarBg(authorName);

  return (
    <div className="testimonial-card flex flex-col items-start gap-4 p-6 bg-white rounded-lg shadow-lg w-96 flex-shrink-0">
      <p className="testimonial-quote text-gray-700 text-lg">"{quote}"</p>
      <div className="testimonial-author-row flex items-center gap-4 mt-4">
        {/* User requirement: No faces in DP; use character's name first letter */}
        <div
          className="testimonial-avatar-badge w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg select-none"
          style={{ backgroundColor: avatarBg }}
          aria-label={`${authorName || 'User'} initial`}
        >
          {firstLetter}
        </div>
        <div className="testimonial-author-info">
          <h4 className="testimonial-author-name text-lg font-bold">{authorName}</h4>
          <p className="testimonial-author-title text-gray-600">{authorTitle}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * HorizontalScroller
 * Smooth infinite horizontal scroller with left/right direction and speed controls.
 */
export const HorizontalScroller = ({ children, speed = "40s", direction = "left" }) => {
  const animationClass =
    direction === "right" ? "animate-scroll-horizontal-reverse" : "animate-scroll-horizontal";

  return (
    <div className="scroller-wrapper w-full overflow-hidden group relative mask-fade">
      <div
        className={`scroller-track flex ${animationClass}`}
        style={{ ["--scroll-duration"]: speed }}
      >
        <div className="scroller-inner-content flex items-stretch justify-center gap-8 px-4">
          {children}
        </div>
        <div
          className="scroller-inner-content flex items-stretch justify-center gap-8 px-4"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const DEFAULT_SCHOOL_DATA = {
  title: "Loved by Our School Community",
  subtitle:
    "Reflections from parents, alumni, and mentors on the values, discipline, and academic continuum at Sree Hari Saradha Vidhyalaya.",
  rows: [],
};

/**
 * TestimonialsSection
 * Props: data { title, subtitle, rows[] }
 */
export default function TestimonialsSection({ data }) {
  const sectionData = data || DEFAULT_SCHOOL_DATA;

  // Hidden until verified parent testimonials with written authorization exist
  if (!sectionData.rows || sectionData.rows.length === 0) {
    return null;
  }

  return (
    <div className="testimonials-section-root">
      <section className="testimonials-section relative flex flex-col items-center gap-12 p-10 w-full max-w-7xl">
        <div className="testimonials-header-block flex flex-col items-center gap-6 text-center z-10 max-w-2xl">
          <h2
            className="testimonials-main-title text-5xl font-extrabold text-black leading-tight"
            style={{ opacity: 0, animation: "fadeInUp 0.7s ease-out 0.2s forwards" }}
          >
            {sectionData.title}
          </h2>
          <p
            className="testimonials-main-subtitle text-lg text-gray-700"
            style={{ opacity: 0, animation: "fadeInUp 0.7s ease-out 0.4s forwards" }}
          >
            {sectionData.subtitle}
          </p>
        </div>

        <div className="testimonials-rows-container flex flex-col gap-8 z-10 w-full max-w-6xl">
          {sectionData.rows.map((row) => (
            <HorizontalScroller key={row.id} speed={row.speed} direction={row.direction}>
              {row.testimonials.map((t) => (
                <TestimonialCard
                  key={t.id}
                  quote={t.quote}
                  authorName={t.authorName}
                  authorTitle={t.authorTitle}
                  avatarUrl={t.avatarUrl}
                />
              ))}
            </HorizontalScroller>
          ))}
        </div>

        <div className="testimonials-glow-backdrop absolute inset-0 pointer-events-none" aria-hidden="true" />
      </section>
    </div>
  );
}

