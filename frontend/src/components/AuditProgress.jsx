import { Fragment, useEffect, useRef, useState } from 'react'

const STAGES = ['Fetch', 'Extract', 'Analyze', 'Done']

export default function AuditProgress({ metricsStatus, aiStatus }) {
  const [progress,    setProgress]    = useState(0)
  const [activeStage, setActiveStage] = useState(0)
  const [hidden,      setHidden]      = useState(false)
  const timers = useRef([])

  function clearAll() { timers.current.forEach(clearTimeout); timers.current = [] }
  function after(fn, ms) { timers.current.push(setTimeout(fn, ms)) }

  useEffect(() => {
    clearAll()
    setHidden(false)

    if (metricsStatus === 'loading') {
      setActiveStage(0); setProgress(5)
      after(() => setProgress(20), 400)
      after(() => { setActiveStage(1); setProgress(32) }, 1500)
      after(() => setProgress(45), 2500)
    } else if (metricsStatus === 'success' && aiStatus === 'loading') {
      setActiveStage(2); setProgress(50)
    } else if (aiStatus === 'success') {
      setActiveStage(3); setProgress(100)
      after(() => setHidden(true), 900)
    } else {
      setProgress(0); setActiveStage(0)
    }

    return clearAll
  }, [metricsStatus, aiStatus])

  if (metricsStatus === 'idle' || metricsStatus === 'error' || hidden) return null

  const isAnalyzing = metricsStatus === 'success' && aiStatus === 'loading'
  const done        = aiStatus === 'success'

  const stageStates = STAGES.map((_, i) => {
    if (done || i < activeStage) return 'complete'
    if (i === activeStage)       return 'active'
    return 'pending'
  })

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Stage dots + connectors */}
      <div className="flex items-start">
        {STAGES.map((label, i) => (
          <Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  stageStates[i] === 'complete'
                    ? 'bg-success'
                    : stageStates[i] === 'active'
                    ? 'bg-primary ring-2 ring-primary/20 animate-pulse'
                    : 'bg-surface-container-high'
                }`}
              />
              <span
                className={`text-label-sm font-label-sm transition-colors duration-300 ${
                  stageStates[i] === 'pending' ? 'text-outline' : 'text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            </div>

            {i < STAGES.length - 1 && (
              <div
                className={`flex-1 h-px mt-1.5 mx-2 transition-colors duration-500 ${
                  stageStates[i] === 'complete' ? 'bg-success' : 'bg-outline-variant'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>

      {/* Progress bar — real fill during Phase 1, pulse at 50% during Phase 2 */}
      <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full bg-primary rounded-full transition-all duration-700 ease-out ${
            isAnalyzing ? 'animate-pulse' : ''
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
