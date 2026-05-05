'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BBQEvent } from '@/types'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()
  const [events, setEvents] = useState<BBQEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('Load error:', error)
      setEvents(data ?? [])
    } catch (e) {
      console.error('Network error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !date) return
    setCreating(true)
    setCreateError(null)
    const { data, error } = await supabase
      .from('events')
      .insert({ name: name.trim(), date })
      .select()
      .single()
    if (!error && data) {
      router.push(`/event/${data.id}`)
    } else {
      setCreating(false)
      setCreateError(error?.message ?? 'Unknown error')
      console.error('Create error:', error)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="bg-orange-500 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <div className="text-5xl mb-2">🔥</div>
          <h1 className="text-3xl font-bold">על האש</h1>
          <p className="text-orange-200 mt-1">תכנון BBQ משפחתי</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">האירועים שלי</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> אירוע חדש
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-bounce">🍖</div>
            <p>טוען...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🏕️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">אין אירועים עדיין</h3>
            <p className="text-gray-500 mb-6">צור את אירוע ה-BBQ הראשון שלך!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">צור אירוע</button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <Link key={ev.id} href={`/event/${ev.id}`}
                className="card p-5 flex items-center justify-between hover:shadow-md transition-all duration-200 group">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">{ev.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(ev.date)}</p>
                </div>
                <div className="text-2xl group-hover:translate-x-1 transition-transform">🔥</div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">אירוע חדש 🔥</h2>
            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <strong>Error:</strong> {createError}
                <br />
                <span className="text-xs mt-1 block">Make sure you ran schema.sql in Supabase SQL Editor.</span>
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">שם האירוע</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: על האש בפארק" className="form-input" autoFocus required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">תאריך</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="form-input" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">ביטול</button>
                <button type="submit" disabled={creating || !name.trim() || !date} className="btn-primary flex-1">
                  {creating ? 'יוצר...' : 'צור אירוע'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
