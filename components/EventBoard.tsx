'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { useBBQStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { Item } from '@/types'
import { ItemCardContent } from './ItemCard'
import UnassignedZone from './UnassignedZone'
import FamilyDropZone from './FamilyDropZone'
import AddItemModal from './AddItemModal'
import AddFamilyModal from './AddFamilyModal'

interface EventBoardProps {
  eventId: string
}

export default function EventBoard({ eventId }: EventBoardProps) {
  const { items, families, assignItem, removeItem } = useBBQStore()
  const [activeItem, setActiveItem] = useState<Item | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [showAddFamily, setShowAddFamily] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart({ active }: DragStartEvent) {
    const item = items.find((i) => i.id === active.id)
    setActiveItem(item ?? null)
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveItem(null)
    if (!over) return

    const itemId = active.id as string
    const overId = over.id as string
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    if (overId === 'unassigned-zone') {
      if (item.assigned_family_id === null) return
      assignItem(itemId, null)
      await supabase.from('items').update({ assigned_family_id: null, status: 'open' }).eq('id', itemId)
    } else {
      const family = families.find((f) => f.id === overId)
      if (!family) return
      if (item.assigned_family_id === family.id) return
      assignItem(itemId, family.id)
      await supabase.from('items').update({ assigned_family_id: family.id, status: 'assigned' }).eq('id', itemId)
    }
  }

  async function handleRemoveItem(id: string) {
    removeItem(id)
    await supabase.from('items').delete().eq('id', id)
  }

  const unassigned = items.filter((i) => !i.assigned_family_id)
  const assigned = items.filter((i) => i.assigned_family_id)
  const progress = items.length > 0 ? Math.round((assigned.length / items.length) * 100) : 0

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {items.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-violet-500 mb-1.5">
            <span>{assigned.length} מתוך {items.length} פריטים שויכו</span>
            <span className="font-semibold text-violet-600">{progress}%</span>
          </div>
          <div className="w-full bg-violet-100 rounded-full h-2.5">
            <div
              className="bg-violet-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowAddItem(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg">+</span> הוסף פריט
        </button>
        <button
          onClick={() => setShowAddFamily(true)}
          className="px-5 py-2 bg-white border-2 border-violet-400 text-violet-600
                     rounded-xl font-semibold hover:bg-violet-50 active:bg-violet-100
                     transition-all duration-150 shadow-sm flex items-center gap-2"
        >
          <span>👨‍👩‍👧‍👦</span> הוסף משפחה
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 order-first lg:order-last">
          <UnassignedZone items={unassigned} onRemove={handleRemoveItem} />
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-violet-900">מי מביא מה</h2>
            <span className="text-sm text-violet-400">({families.length} משפחות)</span>
          </div>

          {families.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
              <p className="text-violet-500 mb-4">עדיין אין משפחות. הוסף משפחה כדי להתחיל לשייך פריטים!</p>
              <button onClick={() => setShowAddFamily(true)} className="btn-primary">
                הוסף משפחה ראשונה
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {families.map((family) => (
                <FamilyDropZone
                  key={family.id}
                  family={family}
                  items={items.filter((i) => i.assigned_family_id === family.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeItem ? (
          <div className="rotate-2 scale-105">
            <ItemCardContent item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>

      {showAddItem && <AddItemModal eventId={eventId} onClose={() => setShowAddItem(false)} />}
      {showAddFamily && <AddFamilyModal eventId={eventId} onClose={() => setShowAddFamily(false)} />}
    </DndContext>
  )
}
