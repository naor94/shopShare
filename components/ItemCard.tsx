'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Item } from '@/types'

interface ItemCardProps {
  item: Item
  familyColor?: string
  onRemove?: (id: string) => void
  overlay?: boolean
}

export function ItemCardContent({
  item,
  familyColor,
  onRemove,
}: Omit<ItemCardProps, 'overlay'>) {
  return (
    <div
      className="item-card flex items-center justify-between gap-2 hover:shadow-md"
      style={familyColor ? { borderRightColor: familyColor, borderRightWidth: 3 } : {}}
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
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove(item.id)
          }}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center
                     text-gray-300 hover:text-red-400 hover:bg-red-50
                     rounded-lg transition-colors text-sm"
          aria-label="הסר פריט"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default function ItemCard({ item, familyColor, onRemove, overlay }: ItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'item', item },
    disabled: overlay,
  })

  const style = overlay ? {} : { transform: CSS.Translate.toString(transform) }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={`cursor-grab active:cursor-grabbing transition-opacity duration-150 ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      <ItemCardContent item={item} familyColor={familyColor} onRemove={onRemove} />
    </div>
  )
}
