import { useState } from 'react'

export default function URLInput({ onAnalyze }) {
  const [url, setUrl] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (url.trim()) onAnalyze?.(url.trim())
  }

  return (
    <section className="card-flat p-stack-md flex flex-col md:flex-row gap-stack-md items-center bg-white shadow-sm">
      <form className="flex flex-col md:flex-row gap-stack-md items-center w-full" onSubmit={handleSubmit}>
        <div className="relative flex-grow w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">link</span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-3 bg-white border border-outline rounded-lg focus:ring-2 focus:ring-primary-container focus:border-primary outline-none text-body-md font-body-md transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto px-10 py-3 bg-primary-container text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-body-md font-body-md"
        >
          <span className="material-symbols-outlined">analytics</span>
          Analyze
        </button>
      </form>
    </section>
  )
}
