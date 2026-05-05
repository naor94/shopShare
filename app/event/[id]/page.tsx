'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'
import { Item, Family } from '@/types'
import Header from '@/components/Header'
import EventBoard from '@/components/EventBoard'

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const {
    setCurrentEvent,
    setFamilies,
    setItems,
    currentEvent,
    addItem,
    updateItem,
    removeItem,
    addFamily,
    removeFamily,
  } = useBBQStore()

  // Initial data load
  useEffect(() => {
    if (!eventId) return
    setLoading(true)

    const loadTimeout = setTimeout(() => {
      setLoading(false)
      setNotFound(true)
    }, 10000)

    async function load() {
      try {
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()

        if (error || !event) {
          setNotFound(true)
          return
        }
        setCurrentEvent(event)

        const [{ data: families }, { data: items }] = await Promise.all([
          supabase.from('families').select('*').eq('event_id', eventId).order('created_at'),
          supabase.from('items').select('*').eq('event_id', eventId).order('created_at'),
        ])

        setFamilies(families ?? [])
        setItems(items ?? [])
      } catch (e) {
        console.error('Load error:', e)
        setNotFound(true)
      } finally {
        clearTimeout(loadTimeout)
        setLoading(false)
      }
    }

    load()
  }, [eventId])

  // Realtime subscriptions
  useEffect(() => {
    if (!eventId) return

    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `event_id=eq.${eventId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') addItem(payload.new as Item)
          else if (payload.eventType === 'UPDATE') updateItem(payload.new.id, payload.new as Partial<Item>)
          else if (payload.eventType === 'DELETE') removeItem((payload.old as { id: string }).id)
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'families', filter: `event_id=eq.${eventId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') addFamily(payload.new as Family)
          else if (payload.eventType === 'DELETE') removeFamily((payload.old as { id: string }).id)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🍖</div>
          <p className="text-gray-500 text-lg">טוען את האירוע...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">אירוע לא נמצא</h1>
          <p className="text-gray-500 mb-6">הקישור שהגעת ממנו כבר לא בתוקף</p>
          <a href="/" className="btn-primary inline-block">חזרה לדף הראשי</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <Header event={currentEvent!} eventId={eventId} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <EventBoard eventId={eventId} />
      </main>
    </div>
  )
}
