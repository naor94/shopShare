'use client'

import { useDroppable } from '@dnd-kit/core'
import { Item } from '@/types'
import ItemCard from './ItemCard'

interface UnassignedZoneProps {
  items: Item[]
  onRemove: (id: string) => void
}

export default function UnassignedZone({ items, onRemove }: UnassignedZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-zone',
    data: { type: 'unassigned' },
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛒</span>
          <h2 className="font-bold text-gray-800">נותר להביא</h2>
        </div>
        <span
          className={`text-sm px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
            items.length === 0
              ? 'bg-green-100 text-green-600'
              : 'bg-orange-100 text-orange-600'
          }`}
        >
          {items.length === 0 ? '✅ הכל מכוסה!' : `${items.length} פריטים`}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`p-3 space-y-2 min-h-[120px] transition-colors duration-200 ${
          isOver ? 'bg-orange-50' : ''
        }`}
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm">כל הפריטים שויכו למשתתפים!</p>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  )
}
