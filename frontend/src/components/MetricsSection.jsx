function borderAccent(condition) {
  return condition ? 'border-l-4 border-l-error' : 'border-l-4 border-l-primary'
}

export default function MetricsSection({ data }) {
  const metrics = data ?? {
    wordCount: 1482,
    headings: { h1: 1, h2: 8, h3: 14 },
    ctas: 12,
    links: { internal: 45, external: 12 },
    images: { total: 24, missingAltPct: 25 },
    pagespeed: null,
    metaTitle: { text: '"The Ultimate Guide to Advanced SEO Strategies in 2024"', length: 54, max: 60 },
    metaDescription: {
      text: '"Unlock the secrets of search engine rankings…"',
      length: 182,
      max: 160,
    },
  }

  const wordCountWarn = metrics.wordCount < 300 || metrics.wordCount > 3000
  const imagesWarn    = metrics.images.missingAltPct > 0
  const titleWarn     = metrics.metaTitle.length === 0 || metrics.metaTitle.length > 60
  const descWarn      = metrics.metaDescription.length === 0 || metrics.metaDescription.length > 160

  return (
    <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">

      {/* Word Count */}
      <div className={`card-flat p-stack-md hover-lift ${borderAccent(wordCountWarn)}`}>
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Word Count</p>
        <h3 className="font-metric text-headline-md font-bold text-primary">{metrics.wordCount.toLocaleString()}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">Ideal range: 1k – 2k</p>
      </div>

      {/* Headings */}
      <div className="card-flat p-stack-md hover-lift border-l-4 border-l-primary">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Headings</p>
        <div className="flex gap-4 items-end text-body-md font-body-md">
          <div><span className="text-primary font-bold">H1:</span> <span className="font-metric font-bold">{metrics.headings.h1}</span></div>
          <div><span className="text-primary font-bold">H2:</span> <span className="font-metric font-bold">{metrics.headings.h2}</span></div>
          <div><span className="text-primary font-bold">H3:</span> <span className="font-metric font-bold">{metrics.headings.h3}</span></div>
        </div>
      </div>

      {/* CTAs */}
      <div className="card-flat p-stack-md hover-lift border-l-4 border-l-primary">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Call to Actions</p>
        <h3 className="font-metric text-headline-md font-bold text-primary">{metrics.ctas}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">Conversion signals</p>
      </div>

      {/* Links */}
      <div className="card-flat p-stack-md hover-lift border-l-4 border-l-primary">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Links</p>
        <div className="flex flex-col text-body-md font-body-md">
          <span><strong className="text-primary">Internal:</strong> <span className="font-metric font-bold">{metrics.links.internal}</span></span>
          <span><strong className="text-primary">External:</strong> <span className="font-metric font-bold">{metrics.links.external}</span></span>
        </div>
      </div>

      {/* Images */}
      <div className={`card-flat p-stack-md hover-lift ${borderAccent(imagesWarn)}`}>
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Images</p>
        <h3 className="font-metric text-headline-md font-bold text-primary">{metrics.images.total}</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: `${metrics.images.missingAltPct}%` }} />
          </div>
          <span className="text-label-sm font-label-sm text-error font-bold whitespace-nowrap">
            {metrics.images.missingAltPct}% missing alt
          </span>
        </div>
      </div>

      {/* PageSpeed — only render if data is available */}
      {metrics.pagespeed !== null && (
        <div className="card-flat p-stack-md hover-lift border-l-4 border-l-primary">
          <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Performance</p>
          <h3 className="font-metric text-headline-md font-bold text-primary">{metrics.pagespeed}</h3>
          <p className="text-body-md font-body-md text-on-surface-variant">PageSpeed Score</p>
        </div>
      )}

      {/* Meta Data — spans full width */}
      <div className="card-flat p-stack-md md:col-span-2 lg:col-span-3">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-md">Meta Data Analysis</p>
        <div className="space-y-stack-md">
          <div className={`pl-3 border-l-4 ${titleWarn ? 'border-l-error' : 'border-l-primary'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-body-md font-body-md font-bold">Meta Title</span>
              <span className={`text-label-sm font-label-sm font-metric font-bold ${titleWarn ? 'text-error' : 'text-primary'}`}>
                {metrics.metaTitle.length} / {metrics.metaTitle.max}
              </span>
            </div>
            <div className="p-3 bg-surface-container-low border border-outline-variant text-body-md font-body-md italic">
              {metrics.metaTitle.text}
            </div>
          </div>
          <div className={`pl-3 border-l-4 ${descWarn ? 'border-l-error' : 'border-l-primary'}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-body-md font-body-md font-bold">Meta Description</span>
              <span className={`text-label-sm font-label-sm font-metric font-bold ${descWarn ? 'text-error' : 'text-primary'}`}>
                {metrics.metaDescription.length} / {metrics.metaDescription.max}
              </span>
            </div>
            <div className="p-3 bg-surface-container-low border border-outline-variant text-body-md font-body-md italic text-on-surface-variant">
              {metrics.metaDescription.text}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
