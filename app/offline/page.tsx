'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">📶</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">אין חיבור לאינטרנט</h1>
        <p className="text-gray-500 mb-6">
          אתה במצב אופליין. חלק מהתכונות לא יהיו זמינות.
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          נסה שוב
        </button>
      </div>
    </div>
  )
}
