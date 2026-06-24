import { useEffect, useState } from 'react'

const MESSAGES = [
  'Fetching page...',
  'Extracting metrics...',
  'Generating insights...',
]

function SkeletonBlock({ className = '' }) {
  return (
    <div className={`bg-surface-container animate-pulse rounded-lg ${className}`} />
  )
}

function SkeletonCard() {
  return (
    <div className="card-flat p-stack-md">
      <SkeletonBlock className="h-3 w-1/2 mb-stack-sm" />
      <SkeletonBlock className="h-7 w-2/3 mb-stack-xs" />
      <SkeletonBlock className="h-3 w-3/4" />
    </div>
  )
}

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, MESSAGES.length - 1))
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      {/* Status message */}
      <div className="flex items-center gap-stack-sm mb-stack-lg">
        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-body-md font-body-md text-on-surface-variant">
          {MESSAGES[messageIndex]}
        </p>
      </div>

      {/* Skeleton grid matching MetricsSection layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md mb-stack-lg">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Skeleton for readability gauge + AI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack-md">
        <div className="card-flat p-stack-md flex flex-col items-center gap-stack-sm">
          <SkeletonBlock className="h-3 w-1/3" />
          <div className="w-40 h-40 rounded-full bg-surface-container animate-pulse" />
          <SkeletonBlock className="h-4 w-1/2" />
        </div>

        <div className="lg:col-span-2 card-flat p-stack-md">
          <SkeletonBlock className="h-4 w-1/4 mb-stack-md" />
          <div className="flex flex-col gap-stack-sm">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
