export default function MetricsSection({ data }) {
  const metrics = data ?? {
    wordCount: 1482,
    headings: { h1: 1, h2: 8, h3: 14 },
    ctas: 12,
    links: { internal: 45, external: 12 },
    images: { total: 24, missingAltPct: 25 },
    pagespeed: 94,
    metaTitle: {
      text: '"The Ultimate Guide to Advanced SEO Strategies in 2024"',
      length: 54,
      max: 60,
    },
    metaDescription: {
      text: '"Unlock the secrets of search engine rankings with our deep dive into metadata, keyword research, and user intent. Learn how to outperform competitors and drive organic traffic consistently to your business platform today."',
      length: 182,
      max: 160,
    },
  }

  return (
    <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
      {/* Word Count */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Word Count</p>
        <h3 className="text-headline-md font-headline-md font-bold text-primary">{metrics.wordCount.toLocaleString()}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">Ideal range: 1k – 2k</p>
      </div>

      {/* Headings */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Headings</p>
        <div className="flex gap-4 items-end text-body-md font-body-md">
          <div><span className="text-primary font-bold">H1:</span> {metrics.headings.h1}</div>
          <div><span className="text-primary font-bold">H2:</span> {metrics.headings.h2}</div>
          <div><span className="text-primary font-bold">H3:</span> {metrics.headings.h3}</div>
        </div>
      </div>

      {/* CTAs */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Call to Actions</p>
        <h3 className="text-headline-md font-headline-md font-bold text-primary">{metrics.ctas}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">Conversion optimized</p>
      </div>

      {/* Links */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Links</p>
        <div className="flex flex-col text-body-md font-body-md">
          <span><strong className="text-primary">Internal:</strong> {metrics.links.internal}</span>
          <span><strong className="text-primary">External:</strong> {metrics.links.external}</span>
        </div>
      </div>

      {/* Images */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Images</p>
        <h3 className="text-headline-md font-headline-md font-bold text-primary">{metrics.images.total}</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-error h-full" style={{ width: `${metrics.images.missingAltPct}%` }} />
          </div>
          <span className="text-label-sm font-label-sm text-error font-bold whitespace-nowrap">
            {metrics.images.missingAltPct}% missing alt
          </span>
        </div>
      </div>

      {/* PageSpeed */}
      <div className="card-flat p-stack-md hover-lift">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-xs">Performance</p>
        <h3 className="text-headline-md font-headline-md font-bold text-primary">{metrics.pagespeed}</h3>
        <p className="text-body-md font-body-md text-on-surface-variant">PageSpeed Score</p>
      </div>

      {/* Meta Data — spans full width */}
      <div className="card-flat p-stack-md md:col-span-2 lg:col-span-3">
        <p className="text-label-sm font-label-sm text-on-surface-variant uppercase mb-stack-md">Meta Data Analysis</p>
        <div className="space-y-stack-md">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-body-md font-body-md font-bold">Meta Title</span>
              <span className="text-label-sm font-label-sm text-primary">
                {metrics.metaTitle.length} / {metrics.metaTitle.max}
              </span>
            </div>
            <div className="p-3 bg-surface-container-low border border-outline-variant text-body-md font-body-md italic">
              {metrics.metaTitle.text}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-body-md font-body-md font-bold">Meta Description</span>
              <span className="text-label-sm font-label-sm text-error">
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
