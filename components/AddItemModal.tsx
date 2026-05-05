'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'

interface AddItemModalProps {
  eventId: string
  onClose: () => void
}

interface PendingItem {
  name: string
  quantity: number
}

const QUICK_ITEMS = [
  'סלט ירקות', 'פיתות', 'קטשופ', 'חרדל', 'קולה', 'מים',
  'נקניקיות', 'המבורגר', "צ'יפס", 'עוגות', 'גלידה', 'מפיות',
]

export default function AddItemModal({ eventId, onClose }: AddItemModalProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [pending, setPending] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(false)
  const addItem = useBBQStore((s) => s.addItem)

  function addToPending(itemName: string, qty: number = 1) {
    const trimmed = itemName.trim()
    if (!trimmed) return
    setPending((prev) => {
      const existing = prev.findIndex((p) => p.name === trimmed)
      if (existing !== -1) {
        const updated = [...prev]
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + qty }
        return updated
      }
      return [...prev, { name: trimmed, quantity: qty }]
    })
  }

  function handleAddCurrent() {
    if (!name.trim()) return
    addToPending(name.trim(), quantity)
    setName('')
    setQuantity(1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCurrent()
    }
  }

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleQuick(itemName: string) {
    const exists = pending.findIndex((p) => p.name === itemName)
    if (exists !== -1) {
      removePending(exists)
    } else {
      addToPending(itemName, 1)
    }
  }

  async function handleSubmitAll() {
    const toSubmit = pending.length > 0 ? pending : name.trim() ? [{ name: name.trim(), quantity }] : []
    if (toSubmit.length === 0) return
    setLoading(true)
    const rows = toSubmit.map((item) => ({
      event_id: eventId,
      name: item.name,
      quantity: item.quantity,
      assigned_family_id: null,
      status: 'open',
    }))
    const { data, error } = await supabase.from('items').insert(rows).select()
    if (!error && data) data.forEach((d) => addItem(d))
    setLoading(false)
    onClose()
  }

  const totalItems = pending.length + (name.trim() ? 1 : 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">הוסף פריטים לרשימה 🛒</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שם הפריט..."
            className="form-input flex-1"
            autoFocus
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg hover:bg-gray-200 font-bold transition-colors">−</button>
            <span className="text-sm font-bold w-5 text-center">{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg hover:bg-gray-200 font-bold transition-colors">+</button>
          </div>
          <button
            type="button"
            onClick={handleAddCurrent}
            disabled={!name.trim()}
            className="px-3 py-2 rounded-xl bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold text-lg disabled:opacity-30 transition-colors"
            title="הוסף לרשימה"
          >
            +
          </button>
        </div>

        {pending.length > 0 && (
          <div className="mb-4 space-y-1.5 max-h-36 overflow-y-auto">
            {pending.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-600 font-bold">×{item.quantity}</span>
                  <button
                    onClick={() => removePending(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">הצעות מהירות — לחץ לסמן</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ITEMS.map((qi) => {
              const selected = pending.some((p) => p.name === qi)
              return (
                <button
                  key={qi}
                  onClick={() => toggleQuick(qi)}
                  className={selected
                    ? 'text-sm px-3 py-1.5 rounded-xl transition-colors border bg-orange-500 text-white border-orange-500'
                    : 'text-sm px-3 py-1.5 rounded-xl transition-colors border bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200'}
                >
                  {selected ? '✓ ' : ''}{qi}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">ביטול</button>
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={loading || totalItems === 0}
            className="btn-primary flex-1"
          >
            {loading ? 'מוסיף...' : totalItems > 1 ? 'הוסף ' + totalItems + ' פריטים' : 'הוסף פריט'}
          </button>
        </div>
      </div>
    </div>
  )
}
