'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Item } from '@/types'
import { useLongPress } from '@/hooks/useLongPress'
import { useState } from 'react'

interface ItemCardProps {
  item: Item
  familyColor?: string
  onRemove?: (id: string) => void
  onUnassign?: (id: string) => void
  onContextMenu?: () => void
  overlay?: boolean
}

export function ItemCardContent({
  item,
  familyColor,
  onRemove,
  onUnassign,
  onContextMenu,
}: Omit<ItemCardProps, 'overlay'>) {
  const handleUnassign = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (confirm(`האם להחזיר את ${item.name} ל"נותר להביא"?`)) {
      onUnassign?.(item.id)
    }
  }

  return (
    <div
      className="item-card flex items-center justify-between gap-2 hover:shadow-md cursor-pointer select-none"
      style={familyColor ? { borderRightColor: familyColor, borderRightWidth: 3 } : {}}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu?.()
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-gray-800 truncate">{item.name}</span>
        {item.quantity > 1 && (
          <span className="flex-shrink-0 bg-orange-100 text-orange-700 text-xs
                           px-2 py-0.5 rounded-full font-semibold">
            x{item.quantity}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onUnassign && familyColor && (
          <button
            onClick={handleUnassign}
            className="w-6 h-6 flex items-center justify-center
                       text-gray-300 hover:text-orange-500 hover:bg-orange-50
                       rounded-lg transition-colors text-sm"
            aria-label="הסר מהמשפחה"
            title="הסר מהמשפחה"
          >
            ↶
          </button>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onRemove(item.id)
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                       text-gray-300 hover:text-rose-500 hover:bg-rose-50
                       rounded-lg transition-colors text-sm"
            aria-label="הסר פריט"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default function ItemCard({ item, familyColor, onRemove, onUnassign, onContextMenu, overlay }: ItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'item', item },
    disabled: overlay,
  })

  const style = overlay ? {} : { transform: CSS.Translate.toString(transform) }
  const [menuOpen, setMenuOpen] = useState(false)

  const handleContextMenu = () => {
    setMenuOpen(true)
    onContextMenu?.()
  }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={`transition-opacity duration-150 ${
        isDragging ? 'opacity-30 cursor-grabbing' : 'opacity-100 cursor-grab'
      }`}
    >
      <ItemCardContent
        item={item}
        familyColor={familyColor}
        onRemove={onRemove}
        onUnassign={onUnassign}
        onContextMenu={handleContextMenu}
      />
    </div>
  )
}
