'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-violet-900 mb-2">אין חיבור לאינטרנט</h1>
        <p className="text-violet-500 mb-6">
          אתה במצב אופליין. חלק מהתכונות לא יהיו זמינות.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          נסה שוב
        </button>
      </div>
    </div>
  )
}
