const DEFAULT_INSIGHTS = [
  {
    icon: 'account_tree',
    title: 'SEO Structure',
    body: 'Excellent H-tag nesting. The primary keyword "SEO Strategies" is well-distributed but missing in the third H2 sub-heading.',
  },
  {
    icon: 'auto_awesome',
    title: 'Messaging Clarity',
    body: 'Value proposition is stated in the hero but becomes diluted in the second section. Suggest tightening the "Benefits" list.',
  },
  {
    icon: 'touch_app',
    title: 'CTA Usage',
    body: 'CTA frequency is optimal, but the "Contact Us" buttons lack contrasting colors against the background sections.',
  },
  {
    icon: 'article',
    title: 'Content Depth',
    body: 'High semantic richness. Topics covered include technical, on-page, and off-page SEO in sufficient detail for authority building.',
  },
  {
    icon: 'warning',
    title: 'UX Concerns',
    body: 'Large image assets (2.4 MB+) are causing layout shifts on mobile. Consider WebP conversion for faster rendering.',
  },
]

export default function AIAnalysis({ insights = DEFAULT_INSIGHTS }) {
  return (
    <section className="mt-stack-lg">
      <div className="flex items-center gap-2 mb-stack-md">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
        <h2 className="text-headline-lg font-headline-lg">AI Structural Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {insights.map(({ icon, title, body }) => (
          <div key={title} className="card-flat p-stack-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary">{icon}</span>
              <h4 className="font-bold text-body-lg font-body-lg">{title}</h4>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">{body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
