function getStatus(body) {
  const l = body.toLowerCase()
  if (/\b(excellent|optimal|strong|clear|effective|comprehensive|solid|good|properly|adequate|rich|high|well)\b/.test(l))
    return 'good'
  if (/\b(no \w|none|zero|critical|major issue|failing|completely missing|not found)\b/.test(l))
    return 'critical'
  return 'warning'
}

function trimToTwoSentences(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  return sentences ? sentences.slice(0, 2).join(' ').trim() : text
}

const STATUS = {
  good:     { label: 'Good',     border: 'border-l-4 border-l-success', badge: 'bg-success-container text-success' },
  warning:  { label: 'Review',   border: 'border-l-4 border-l-warning', badge: 'bg-warning-container text-warning' },
  critical: { label: 'Critical', border: 'border-l-4 border-l-error',   badge: 'bg-error-container text-on-error-container' },
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

export default function AIAnalysis({ insights = DEFAULT_INSIGHTS }) {
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {insights.map(({ icon, title, body }, i) => {
          const status = getStatus(body)
          const cfg = STATUS[status]
          const isLastSolo = insights.length % 2 !== 0 && i === insights.length - 1
          return (
            <div
              key={title}
              className={`card-flat p-stack-md ${cfg.border}${isLastSolo ? ' md:col-span-2' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                  <h4 className="font-bold text-body-lg font-body-lg">{title}</h4>
                </div>
                <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-body-md font-body-md text-on-surface-variant">
                {trimToTwoSentences(body)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
