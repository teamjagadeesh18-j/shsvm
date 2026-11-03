import { useInView } from '../../../hooks/useInView';
import './Reveal.css';

/**
 * Reusable Reveal animation component.
 * Applies a GPU-accelerated fade-up reveal on scroll with optional stagger delay.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements
 * @param {number} [props.delay=0] - Delay in seconds (e.g. 0.15 for stagger)
 * @param {keyof JSX.IntrinsicElements | React.ComponentType} [props.as='div'] - Element tag
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style={}] - Additional inline styles
 */
export function Reveal({
  children,
  delay = 0,
  as: Component = 'div',
  className = '',
  style = {},
  ...rest
}) {
  const { ref, isVisible } = useInView();

  const transitionDelay = isVisible && delay > 0 ? `${delay}s` : undefined;

  const combinedStyle = {
    ...style,
    ...(transitionDelay ? { transitionDelay } : {}),
  };

  return (
    <Component
      ref={ref}
      className={`reveal-wrapper ${isVisible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={combinedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Reveal;

