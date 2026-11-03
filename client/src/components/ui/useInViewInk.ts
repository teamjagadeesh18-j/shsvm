import React from "react"

export function useInView(threshold = 0.2) {
  const ref = React.useRef(null as HTMLElement | null)
  const [inView, setInView] = React.useState(
    () => typeof window !== "undefined" && typeof IntersectionObserver !== "function"
  )

  React.useEffect(() => {
    const el = ref.current
    if (!el || inView || typeof IntersectionObserver !== "function") return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, threshold])

  return [ref, inView] as const
}

