const PRIORITY_STYLES = {
  CRITICAL: 'bg-error-container text-on-error-container',
  HIGH: 'bg-surface-container-highest text-primary',
  MEDIUM: 'bg-surface-container-highest text-primary',
  LOW: 'bg-surface-container-highest text-on-secondary-fixed-variant',
}


const SKELETON_KEYS = ['sk-a', 'sk-b', 'sk-c', 'sk-d']

export default function Recommendations({ items = null, loading = false }) {
  if (loading) {
    return (
      <section className="mt-stack-lg">
        <h2 className="text-headline-lg font-headline-lg mb-stack-md">Prioritized Recommendations</h2>
        <div className="card-flat overflow-hidden bg-white divide-y divide-outline-variant animate-pulse">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-surface-container rounded-full" />
                <div className="h-4 w-1/3 bg-surface-container rounded" />
              </div>
              <div className="h-3 bg-surface-container rounded w-4/5" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (!items) return null

  return (
    <section className="mt-stack-lg">
      <h2 className="text-headline-lg font-headline-lg mb-stack-md">Prioritized Recommendations</h2>

      <div className="card-flat overflow-hidden bg-white">
        {/* Mobile: stacked cards */}
        <div className="md:hidden divide-y divide-outline-variant">
          {items.map(({ priority, title, reasoning }) => (
            <div key={title} className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${PRIORITY_STYLES[priority]} px-3 py-1 rounded-full text-label-sm font-label-sm font-bold`}>
                  {priority}
                </span>
                <span className="font-bold text-body-md font-body-md">{title}</span>
              </div>
              <p className="text-body-md font-body-md text-on-surface-variant">{reasoning}</p>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="p-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Priority</th>
              <th className="p-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Recommendation</th>
              <th className="p-4 text-label-sm font-label-sm text-on-surface-variant uppercase">Reasoning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
            {items.map(({ priority, title, reasoning }) => (
              <tr key={title} className="hover:bg-background transition-colors">
                <td className="p-4">
                  <span className={`${PRIORITY_STYLES[priority]} px-3 py-1 rounded-full text-label-sm font-label-sm font-bold`}>
                    {priority}
                  </span>
                </td>
                <td className="p-4 font-bold">{title}</td>
                <td className="p-4 text-on-surface-variant">{reasoning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
