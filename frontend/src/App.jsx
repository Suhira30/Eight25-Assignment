import { useState } from 'react'
import Header from './components/Header'
import URLInput from './components/URLInput'
import MetricsSection from './components/MetricsSection'
import ReadabilityGauge from './components/ReadabilityGauge'
import AIAnalysis from './components/AIAnalysis'
import Recommendations from './components/Recommendations'
import Footer from './components/Footer'
import LoadingState from './components/LoadingState'
import ErrorBanner from './components/ErrorBanner'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const CATEGORY_META = {
  seo_structure:     { icon: 'account_tree', title: 'SEO Structure' },
  messaging_clarity: { icon: 'auto_awesome', title: 'Messaging Clarity' },
  cta_usage:         { icon: 'touch_app',    title: 'CTA Usage' },
  content_depth:     { icon: 'article',      title: 'Content Depth' },
  ux_concerns:       { icon: 'warning',      title: 'UX Concerns' },
}

function normalizeMetrics(apiMetrics) {
  return {
    wordCount: apiMetrics.word_count,
    headings: apiMetrics.headings,
    ctas: apiMetrics.ctas,
    links: apiMetrics.links,
    images: {
      total: apiMetrics.images.total,
      missingAltPct: apiMetrics.images.missing_alt_pct,
    },
    pagespeed: null,
    metaTitle: apiMetrics.meta_title
      ? { text: apiMetrics.meta_title.text, length: apiMetrics.meta_title.length, max: 60 }
      : { text: '(not found)', length: 0, max: 60 },
    metaDescription: apiMetrics.meta_description
      ? { text: apiMetrics.meta_description.text, length: apiMetrics.meta_description.length, max: 160 }
      : { text: '(not found)', length: 0, max: 160 },
  }
}

function normalizeInsights(apiInsights) {
  const seen = new Set()
  return apiInsights
    .filter(({ category }) => {
      if (seen.has(category)) return false
      seen.add(category)
      return true
    })
    .map(({ category, finding }) => ({
      icon: CATEGORY_META[category]?.icon ?? 'info',
      title: CATEGORY_META[category]?.title ?? category,
      body: finding,
    }))
}

async function fetchAudit(url) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const json = await response.json()
  if (!response.ok) {
    throw json
  }
  return json
}

function App() {
  const [status, setStatus] = useState('idle')
  const [data,   setData]   = useState(null)
  const [error,  setError]  = useState(null)

  async function handleAnalyze(url) {
    setStatus('loading')
    setError(null)
    try {
      const result = await fetchAudit(url)
      setData(result)
      setStatus('success')
    } catch (err) {
      setError(
        err?.reason
          ? err
          : { error: 'NETWORK_ERROR', reason: 'Could not reach the server. Please check your connection and try again.' }
      )
      setStatus('error')
    }
  }

  const isSuccess = status === 'success'

  return (
    <div className="bg-background min-h-screen font-body-md flex flex-col">
      <Header />

      <main className="flex-1 max-w-container-max w-full mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <URLInput onAnalyze={handleAnalyze} />

        {status === 'error' && (
          <ErrorBanner
            error={error.error}
            reason={error.reason}
            onDismiss={() => setStatus('idle')}
          />
        )}

        {status === 'loading' && <LoadingState />}

        {isSuccess && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              <MetricsSection data={normalizeMetrics(data.metrics)} />
              <ReadabilityGauge score={data.metrics.readability_score ?? 0} label={data.metrics.readability_label} />
            </div>
            <AIAnalysis insights={normalizeInsights(data.ai_analysis.insights)} />
            <Recommendations items={data.ai_analysis.recommendations} />

            <section className="mt-stack-lg flex flex-col md:flex-row justify-between items-center gap-stack-md py-stack-lg border-t border-outline-variant">
              <div>
                <h3 className="text-headline-md font-headline-md">Audit Summary</h3>
                <p className="text-body-md font-body-md text-on-surface-variant">
                  {data.url} · Report generated on {new Date(data.scraped_at).toLocaleDateString()}
                </p>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
