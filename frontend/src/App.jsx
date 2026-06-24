import Header from './components/Header'
import URLInput from './components/URLInput'
import MetricsSection from './components/MetricsSection'
import ReadabilityGauge from './components/ReadabilityGauge'
import AIAnalysis from './components/AIAnalysis'
import Recommendations from './components/Recommendations'
import Footer from './components/Footer'

function handleAnalyze(url) {
  console.log('Analyzing:', url)
}

function App() {
  return (
    <div className="bg-background min-h-screen font-body-md">
      <Header />

      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <URLInput onAnalyze={handleAnalyze} />

        {/* Metrics grid + readability gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <MetricsSection />
          <ReadabilityGauge score={68} />
        </div>

        <AIAnalysis />
        <Recommendations />

        {/* Audit summary bar */}
        <section className="mt-stack-lg flex flex-col md:flex-row justify-between items-center gap-stack-md py-stack-lg border-t border-outline-variant">
          <div>
            <h3 className="text-headline-md font-headline-md">Audit Summary</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Report generated on October 24, 2024 · Analysis ID: #SEO-9921
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
