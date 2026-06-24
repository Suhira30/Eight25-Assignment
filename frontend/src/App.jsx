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
import AuditProgress from './components/AuditProgress'

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

async function fetchAudit(url, metricsOnly = false) {
  const qs = metricsOnly ? '?metrics_only=true' : ''
  const response = await fetch(`${API_URL}/analyze${qs}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const json = await response.json()
  if (!response.ok) throw json
  return json
}

function App() {
  const [metricsStatus, setMetricsStatus] = useState('idle')
  const [aiStatus,      setAiStatus]      = useState('idle')
  const [metricsData,   setMetricsData]   = useState(null)
  const [aiData,        setAiData]        = useState(null)
  const [error,         setError]         = useState(null)

  async function handleAnalyze(url) {
    setMetricsStatus('loading')
    setAiStatus('idle')
    setError(null)
    setMetricsData(null)
    setAiData(null)

    // Phase 1: scrape + readability (~2–3 s)
    try {
      const partial = await fetchAudit(url, true)
      setMetricsData(partial)
      setMetricsStatus('success')

      // Cache hit returns the full result — skip Phase 2
      if (partial.ai_analysis) {
        setAiData(partial)
        setAiStatus('success')
        return
      }
    } catch (err) {
      setError(
        err?.reason
          ? err
          : { error: 'NETWORK_ERROR', reason: 'Could not reach the server. Please check your connection and try again.' }
      )
      setMetricsStatus('error')
      return
    }

    // Phase 2: AI analysis (~8–15 s)
    setAiStatus('loading')
    try {
      const full = await fetchAudit(url, false)
      setAiData(full)
      setAiStatus('success')
    } catch {
      setAiStatus('error')
    }
  }

  const showMetrics = metricsStatus === 'success'
  const loadingAI   = aiStatus === 'loading'
  const showAI      = aiStatus === 'success'

  return (
    <div className="bg-background min-h-screen font-body-md flex flex-col">
      <Header />

      <main className="flex-1 max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <div id="print-header" aria-hidden="true" className="hidden">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SEO Audit Report</h1>
          {showMetrics && (
            <p style={{ fontSize: '0.875rem', color: '#555', marginTop: '0.25rem' }}>
              {metricsData.url}
            </p>
          )}
        </div>

        <URLInput onAnalyze={handleAnalyze} />

        {metricsStatus === 'error' && (
          <ErrorBanner
            error={error.error}
            reason={error.reason}
            onDismiss={() => setMetricsStatus('idle')}
          />
        )}

        <AuditProgress metricsStatus={metricsStatus} aiStatus={aiStatus} />

        {metricsStatus === 'loading' && <LoadingState />}

        {showMetrics && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              <MetricsSection data={normalizeMetrics(metricsData.metrics)} />
              <ReadabilityGauge score={metricsData.metrics.readability_score ?? 0} label={metricsData.metrics.readability_label} />
            </div>
            <AIAnalysis
              insights={showAI ? normalizeInsights(aiData.ai_analysis.insights) : null}
              loading={loadingAI}
            />
            <Recommendations
              items={showAI ? aiData.ai_analysis.recommendations : null}
              loading={loadingAI}
            />

            {showAI && (
              <section className="mt-stack-lg flex flex-col md:flex-row justify-between items-center gap-stack-md py-stack-lg border-t border-outline-variant">
                <div>
                  <h3 className="text-headline-md font-headline-md">Audit Summary</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant break-all">
                    {aiData.url} · Report generated on {new Date(aiData.scraped_at).toLocaleDateString()}
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
