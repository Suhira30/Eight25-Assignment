import { useEffect, useRef, useState } from 'react'

const RADIUS = 70
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getLabel(score) {
  if (score >= 80) return 'Very Easy'
  if (score >= 70) return 'Easy Read'
  if (score >= 60) return 'Standard'
  if (score >= 50) return 'Fairly Difficult'
  return 'Difficult'
}

export default function ReadabilityGauge({ score = 68 }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const dashOffset = animated
    ? CIRCUMFERENCE * (1 - score / 100)
    : CIRCUMFERENCE

  return (
    <aside className="lg:col-span-4 flex flex-col gap-stack-md">
      <div className="card-flat p-stack-lg flex flex-col items-center justify-center text-center h-full bg-white">
        <h2 className="text-headline-md font-headline-md mb-stack-md">Readability Score</h2>

        <div ref={ref} className="relative mb-stack-md" style={{ width: 180, height: 180 }}>
          <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
            <circle className="gauge-background" cx="80" cy="80" r={RADIUS} />
            <circle
              className="gauge-progress"
              cx="80"
              cy="80"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-bold text-primary" style={{ fontSize: '3rem', lineHeight: 1 }}>{score}</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">/ 100</span>
          </div>
        </div>

        <div className="bg-surface-container px-4 py-1 rounded-full">
          <span className="text-primary font-bold text-headline-md font-headline-md">{getLabel(score)}</span>
        </div>
        <p className="text-body-md font-body-md text-on-surface-variant mt-stack-md">
          Content is accessible to a high-school level reader. Minimal jargon used.
        </p>
      </div>
    </aside>
  )
}
