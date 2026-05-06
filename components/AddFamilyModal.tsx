'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'
import { FAMILY_COLORS } from '@/types'

interface AddFamilyModalProps {
  eventId: string
  onClose: () => void
}

type ParticipantType = 'family' | 'person'

export default function AddFamilyModal({ eventId, onClose }: AddFamilyModalProps) {
  const [type, setType] = useState<ParticipantType>('family')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { addFamily, families } = useBBQStore()

  const usedColors = families.map((f) => f.color)
  const [selectedColor, setSelectedColor] = useState(
    FAMILY_COLORS.find((c) => !usedColors.includes(c)) ?? FAMILY_COLORS[0]
  )

  const isFamily = type === 'family'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('families')
      .insert({ event_id: eventId, name: name.trim(), color: selectedColor })
      .select()
      .single()
    if (!error && data) addFamily(data)
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">הוסף משתתף</h2>

        {/* Type toggle */}
        <div className="flex gap-2 mb-5 bg-orange-50 p-1 rounded-xl border border-orange-100">
          <button
            type="button"
            onClick={() => setType('family')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              isFamily
                ? 'bg-white text-gray-800 shadow-sm border border-orange-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>👨‍👩‍👧‍👦</span> משפחה
          </button>
          <button
            type="button"
            onClick={() => setType('person')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              !isFamily
                ? 'bg-white text-gray-800 shadow-sm border border-orange-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>👤</span> אדם
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {isFamily ? 'שם המשפחה' : 'שם'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isFamily ? 'למשל: משפחת כהן' : 'למשל: דני'}
              className="form-input"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">צבע</label>
            <div className="flex gap-2 flex-wrap">
              {FAMILY_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setSelectedColor(c)}
                  className="w-9 h-9 rounded-full transition-all duration-150 flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    transform: selectedColor === c ? 'scale(1.25)' : 'scale(1)',
                    outline: selectedColor === c ? `3px solid ${c}` : undefined,
                    outlineOffset: selectedColor === c ? '2px' : undefined,
                  }}>
                  {selectedColor === c && <span className="text-white text-sm font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-3 flex items-center gap-2 border-2 transition-all"
            style={{ borderColor: selectedColor, backgroundColor: selectedColor + '15' }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor }} />
            <span className="font-semibold text-gray-700">
              {name || (isFamily ? 'שם המשפחה' : 'שם האדם')}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">ביטול</button>
            <button type="submit" disabled={loading || !name.trim()} className="btn-primary flex-1">
              {loading ? 'מוסיף...' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
