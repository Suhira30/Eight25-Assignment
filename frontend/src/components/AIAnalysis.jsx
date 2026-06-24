function trimToTwoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  return sentences ? sentences.slice(0, 2).join(' ').trim() : text
}

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

export default function AIAnalysis({ insights = null, loading = false }) {
  return (
    <section className="border-t border-outline-variant pt-stack-lg">
      <div className="flex items-center gap-2 mb-stack-md">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          psychology
        </span>
        <h2 className="text-headline-lg font-headline-lg">AI Structural Analysis</h2>
        {loading && (
          <div className="flex items-center gap-2 ml-2">
            <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-label-sm font-label-sm text-on-surface-variant">Analyzing…</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter animate-pulse">
          {['seo', 'messaging', 'cta', 'content'].map((key) => (
            <div key={key} className="card-flat p-stack-md border-l-4 border-l-outline-variant">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-surface-container" />
                <div className="h-4 w-1/3 bg-surface-container rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-container rounded w-full" />
                <div className="h-3 bg-surface-container rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {insights.map(({ icon, title, body }, i) => {
            const isLastSolo = insights.length % 2 !== 0 && i === insights.length - 1
            return (
              <div
                key={title}
                className={`card-flat p-stack-md border-l-4 border-l-primary${isLastSolo ? ' md:col-span-2' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                  <h4 className="font-bold text-body-lg font-body-lg">{title}</h4>
                </div>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  {trimToTwoSentences(body)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
