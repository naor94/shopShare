'use client'

import { useDroppable } from '@dnd-kit/core'
import { Family, Item } from '@/types'
import ItemCard from './ItemCard'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'
import { useState } from 'react'

interface FamilyDropZoneProps {
  family: Family
  items: Item[]
  allItems: Item[]
  onItemContextMenu?: (item: Item) => void
}

export default function FamilyDropZone({
  family,
  items,
  allItems,
  onItemContextMenu,
}: FamilyDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: family.id,
    data: { type: 'family', familyId: family.id },
  })
  const removeFamily = useBBQStore((s) => s.removeFamily)
  const assignItem = useBBQStore((s) => s.assignItem)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  async function handleRemoveFamily() {
    if (!confirm(`האם להסיר את ${family.name}?`)) return
    removeFamily(family.id)
    await supabase.from('families').delete().eq('id', family.id)
  }

  const unassignedItems = allItems.filter((i) => !i.assigned_family_id)

  const handleToggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleAddItems = async () => {
    for (const itemId of selectedItems) {
      assignItem(itemId, family.id)
      await supabase
        .from('items')
        .update({ assigned_family_id: family.id, status: 'assigned' })
        .eq('id', itemId)
    }
    setSelectedItems([])
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

      <div className="min-h-[80px] space-y-2 mb-3">
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
            {isOver ? '+ שחרר כאן' : 'אין פריטים עדיין'}
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

      {unassignedItems.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">הוסף פריטים:</p>
          <div className="space-y-1 max-h-40 overflow-y-auto mb-2">
            {unassignedItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleToggleItem(item.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.quantity > 1 && <span className="text-xs text-gray-500">x{item.quantity}</span>}
              </label>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <button
              onClick={handleAddItems}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg font-semibold transition-colors"
            >
              הוסף {selectedItems.length} פריט{selectedItems.length > 1 ? 'ים' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
