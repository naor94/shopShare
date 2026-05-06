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
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<BBQEvent | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  async function handleDelete() {
    if (!confirmDeleteEvent) return
    setDeleting(true)
    const { error } = await supabase.from('events').delete().eq('id', confirmDeleteEvent.id)
    if (!error) {
      setEvents(events.filter((e) => e.id !== confirmDeleteEvent.id))
    } else {
      console.error('Delete error:', error)
    }
    setDeleting(false)
    setConfirmDeleteEvent(null)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <div className="text-5xl mb-2">🛒</div>
          <h1 className="text-3xl font-bold tracking-tight">
            shop<span className="font-light">Share</span>
          </h1>
          <p className="text-orange-100 mt-1">רשימת קניות שיתופית</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">הרשימות שלי</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <span>+</span> רשימה חדשה
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3 animate-bounce">🛒</div>
            <p>טוען...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">אין רשימות עדיין</h3>
            <p className="text-gray-500 mb-6">צור את הרשימה הראשונה שלך!</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">צור רשימה</button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div key={ev.id} className="card flex items-stretch hover:shadow-md hover:border-orange-200 transition-all duration-200 group overflow-hidden">
                <Link href={`/event/${ev.id}`} className="flex-1 p-5 flex items-center justify-between hover:bg-orange-50/50 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">{ev.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(ev.date)}</p>
                  </div>
                  <div className="text-2xl mx-3 group-hover:scale-110 transition-transform">🛒</div>
                </Link>
                <button
                  onClick={() => setConfirmDeleteEvent(ev)}
                  className="px-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 border-r border-orange-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="מחק רשימה"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {confirmDeleteEvent && (
        <div className="modal-overlay" onClick={() => setConfirmDeleteEvent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-2">מחיקת רשימה</h2>
            <p className="text-gray-600 mb-6">
              בטוח שרוצה למחוק את <span className="font-semibold text-gray-800">{confirmDeleteEvent.name}</span>?
              <br />
              <span className="text-sm text-rose-500">הפעולה לא ניתנת לביטול.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteEvent(null)} className="btn-ghost flex-1">ביטול</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-2 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 transition-all duration-150 shadow-sm"
              >
                {deleting ? 'מוחק...' : 'מחק'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">רשימה חדשה 🛍️</h2>
            {createError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                <strong>Error:</strong> {createError}
                <br />
                <span className="text-xs mt-1 block">Make sure you ran schema.sql in Supabase SQL Editor.</span>
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">שם הרשימה</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: קניות לפסח" className="form-input" autoFocus required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">תאריך</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="form-input" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">ביטול</button>
                <button type="submit" disabled={creating || !name.trim() || !date} className="btn-primary flex-1">
                  {creating ? 'יוצר...' : 'צור רשימה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
