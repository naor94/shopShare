'use client'

import { useState } from 'react'
import { BBQEvent } from '@/types'

interface HeaderProps {
  event: BBQEvent
  eventId: string
}

export default function Header({ event, eventId }: HeaderProps) {
  const [copied, setCopied] = useState(false)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
      prompt('העתק את הלינק:', window.location.href)
    }
  }

  return (
    <header className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-violet-200 hover:text-white text-sm transition-colors
                         hidden sm:inline-flex items-center gap-1"
            >
              ← כל הרשימות
            </a>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                🛒 {event.name}
              </h1>
              <p className="text-violet-200 text-sm mt-0.5">{formatDate(event.date)}</p>
            </div>
          </div>

          <button
            onClick={copyLink}
            className="flex-shrink-0 flex items-center gap-2
                       bg-white/15 hover:bg-white/25 active:bg-white/35
                       border border-white/20 hover:border-white/40
                       px-4 py-2 rounded-xl transition-all text-sm font-medium"
          >
            {copied ? '✅ הועתק!' : '🔗 שתף'}
          </button>
        </div>
      </div>
    </header>
  )
}
