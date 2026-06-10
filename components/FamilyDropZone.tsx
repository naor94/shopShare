'use client'

import { useDroppable } from '@dnd-kit/core'
import { Family, Item } from '@/types'
import ItemCard from './ItemCard'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'

interface FamilyDropZoneProps {
  family: Family
  items: Item[]
  onItemContextMenu?: (item: Item) => void
}

export default function FamilyDropZone({ family, items, onItemContextMenu }: FamilyDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: family.id,
    data: { type: 'family', familyId: family.id },
  })
  const removeFamily = useBBQStore((s) => s.removeFamily)

  async function handleRemoveFamily() {
    if (!confirm(`האם להסיר את ${family.name}?`)) return
    removeFamily(family.id)
    await supabase.from('families').delete().eq('id', family.id)
  }

  return (
    <div
      ref={setNodeRef}
      className="rounded-2xl border-2 p-4 transition-all duration-200"
      style={{
        borderColor: family.color,
        backgroundColor: isOver ? `${family.color}20` : `${family.color}0a`,
        boxShadow: isOver ? `0 0 0 3px ${family.color}40` : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: family.color }}
          />
          <h3 className="font-bold text-gray-800">{family.name}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: family.color + '25', color: family.color }}
          >
            {items.length}
          </span>
        </div>
        <button
          onClick={handleRemoveFamily}
          className="text-gray-300 hover:text-rose-500 hover:bg-rose-50
                     w-6 h-6 flex items-center justify-center rounded-lg
                     transition-colors text-xs"
          title="הסר משתתף"
        >
          ✕
        </button>
      </div>

      <div className="min-h-[80px] space-y-2">
        {items.length === 0 ? (
          <div
            className="flex items-center justify-center h-16 rounded-xl
                        border-2 border-dashed text-sm transition-colors"
            style={{
              borderColor: family.color + '60',
              color: family.color + 'aa',
              backgroundColor: isOver ? family.color + '10' : 'transparent',
            }}
          >
            {isOver ? '+ שחרר כאן' : 'גרור פריטים לכאן'}
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              familyColor={family.color}
              onContextMenu={() => onItemContextMenu?.(item)}
            />
          ))
        )}
      </div>
    </div>
  )
}
