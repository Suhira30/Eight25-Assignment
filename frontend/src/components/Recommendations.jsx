const PRIORITY_STYLES = {
  CRITICAL: 'bg-error-container text-on-error-container',
  HIGH: 'bg-surface-container-highest text-primary',
  MEDIUM: 'bg-surface-container-highest text-primary',
  LOW: 'bg-surface-container-highest text-on-secondary-fixed-variant',
}

const DEFAULT_RECOMMENDATIONS = [
  {
    priority: 'CRITICAL',
    title: 'Shorten Meta Description',
    reasoning: 'Current length (182 chars) exceeds the 160-character display limit in Google, causing truncation.',
  },
  {
    priority: 'HIGH',
    title: 'Add Missing Alt Text',
    reasoning: '6 images (25% of total) lack alt tags, hindering accessibility and image search indexing.',
  },
  {
    priority: 'MEDIUM',
    title: 'Optimize Hero CTA Color',
    reasoning: 'Accessibility contrast check failed for primary buttons. Switch to #7a00df for higher visibility.',
  },
  {
    priority: 'LOW',
    title: 'Implement WebP Images',
    reasoning: 'Page speed is good (94), but total page size can be reduced by 40% with modern image formats.',
  },
]

export default function Recommendations({ items = DEFAULT_RECOMMENDATIONS }) {
  return (
    <section className="mt-stack-lg">
      <h2 className="text-headline-lg font-headline-lg mb-stack-md">Prioritized Recommendations</h2>
      <div className="card-flat overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
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
