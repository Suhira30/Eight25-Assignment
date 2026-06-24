export default function Header() {
  return (
    <header className="bg-surface border-b border-outline-variant flex justify-between items-center px-margin-desktop w-full max-w-container-max mx-auto h-16 sticky top-0 z-50">
      <div className="text-headline-lg font-headline-lg font-bold text-primary">SEO Insight</div>
      <div className="flex items-center gap-stack-md">
        <button
          onClick={() => globalThis.print()}
          className="print:hidden px-4 py-2 bg-primary-container text-on-primary font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 text-label-sm font-label-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          Export
        </button>
      </div>
    </header>
  )
}
