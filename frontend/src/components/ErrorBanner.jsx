export default function ErrorBanner({ error, reason, onDismiss }) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-stack-md p-stack-md rounded-xl bg-error-container text-on-error-container"
    >
      <div className="flex items-start gap-stack-sm">
        <span className="material-symbols-outlined text-error mt-0.5 shrink-0">
          error
        </span>
        <div>
          <p className="text-body-md font-body-md font-semibold">{reason}</p>
          {error && (
            <p className="text-label-sm font-label-sm opacity-70 mt-stack-xs">
              Code: {error}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-on-error-container opacity-70 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}
