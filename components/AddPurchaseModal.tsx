'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'

interface AddPurchaseModalProps {
  eventId: string
  onClose: () => void
}

export default function AddPurchaseModal({ eventId, onClose }: AddPurchaseModalProps) {
  const { families, addPurchase } = useBBQStore()
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(families[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!selectedFamilyId || isNaN(parsed) || parsed <= 0) return
    setLoading(true)
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        event_id: eventId,
        family_id: selectedFamilyId,
        amount: parsed,
        description: description.trim(),
      })
      .select()
      .single()
    if (!error && data) addPurchase(data)
    setLoading(false)
    onClose()
  }

  const selectedFamily = families.find((f) => f.id === selectedFamilyId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">הוסף קנייה</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">מי שילם?</label>
            <div className="flex flex-wrap gap-2">
              {families.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFamilyId(f.id)}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150"
                  style={{
                    borderColor: selectedFamilyId === f.id ? f.color : 'transparent',
                    backgroundColor: selectedFamilyId === f.id ? f.color + '20' : '#f9fafb',
                    color: selectedFamilyId === f.id ? f.color : '#6b7280',
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">סכום (&#8362;)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="form-input"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              תיאור <span className="text-gray-400 font-normal">(אופציונלי)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="למשל: בשר, שתייה..."
              className="form-input"
            />
          </div>

          {selectedFamily && amount && parseFloat(amount) > 0 && (
            <div
              className="rounded-xl p-3 flex items-center gap-2 border-2 transition-all"
              style={{ borderColor: selectedFamily.color, backgroundColor: selectedFamily.color + '15' }}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: selectedFamily.color }} />
              <span className="font-semibold text-gray-700 flex-1">{selectedFamily.name}</span>
              <span className="font-bold text-gray-800">
                &#8362;{parseFloat(amount).toLocaleString('he-IL')}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">ביטול</button>
            <button
              type="submit"
              disabled={loading || !selectedFamilyId || !amount || parseFloat(amount) <= 0}
              className="btn-primary flex-1"
            >
              {loading ? 'שומר...' : 'הוסף'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
