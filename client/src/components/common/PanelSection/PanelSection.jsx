import React from 'react';
import './PanelSection.css';

/**
 * InsetPanel Component
 * Large rounded card with uniform inset, no box-shadow, and subtle CSS grid.
 * Supports 'dark' and 'light' surface variants.
 */
export function InsetPanel({
  children,
  className = '',
  style = {},
  variant = 'dark',
  withGrid = true
}) {
  return (
    <div
      className={`${variant}-panel ${withGrid ? 'with-grid' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Backward compatibility alias for DarkPanel
 */
export function DarkPanel(props) {
  return <InsetPanel variant="dark" {...props} />;
}

/**
 * PanelSection Component
 * Full-bleed white wrapper containing a centered rounded InsetPanel (dark or light).
 */
export default function PanelSection({
  children,
  className = '',
  panelClassName = '',
  id,
  style = {},
  panelStyle = {},
  variant = 'dark',
  withGrid = true,
  ariaLabel
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`panel-section ${className}`}
      style={style}
    >
      <InsetPanel
        variant={variant}
        className={panelClassName}
        style={panelStyle}
        withGrid={withGrid}
      >
        {children}
      </InsetPanel>
    </section>
  );
}
