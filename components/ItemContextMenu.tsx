'use client'

import { useState, useRef, useEffect } from 'react'
import { Family, Item } from '@/types'

interface ItemContextMenuProps {
  item: Item
  families: Family[]
  onAssign: (familyId: string | null) => void
  onRemove: (id: string) => void
}

export default function ItemContextMenu({
  item,
  families,
  onAssign,
  onRemove,
}: ItemContextMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPosition(null)
      }
    }

    if (position) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [position])

  const openMenu = (e: React.PointerEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPosition({
      x: rect.left,
      y: rect.top + rect.height,
    })
  }

  const handleAssign = (familyId: string) => {
    onAssign(familyId)
    setPosition(null)
  }

  const handleRemove = () => {
    onRemove(item.id)
    setPosition(null)
  }

  return (
    <>
      <div
        onContextMenu={openMenu}
        onPointerDown={openMenu}
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        {/* This is a marker element, the actual content is rendered by ItemCard */}
      </div>

      {position && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 truncate">{item.name}</p>
          </div>

          {item.assigned_family_id ? (
            <button
              onClick={() => handleAssign(null)}
              className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2"
            >
              <span>⬅️</span> החזר לנותר להביא
            </button>
          ) : null}

          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => handleAssign(family.id)}
              className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              style={{
                backgroundColor:
                  item.assigned_family_id === family.id ? `${family.color}15` : undefined,
                color: item.assigned_family_id === family.id ? family.color : 'rgb(55, 65, 81)',
              }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: family.color }}
              />
              {family.name}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={handleRemove}
              className="w-full text-right px-3 py-2 text-sm hover:bg-rose-50 text-rose-600 flex items-center gap-2"
            >
              <span>🗑️</span> הסר
            </button>
          </div>
        </div>
      )}
    </>
  )
}
