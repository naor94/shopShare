import { create } from 'zustand'
import { BBQEvent, Family, Item, Purchase } from '@/types'

interface BBQStore {
  currentEvent: BBQEvent | null
  families: Family[]
  items: Item[]
  purchases: Purchase[]
  loading: boolean
  error: string | null

  setCurrentEvent: (event: BBQEvent | null) => void
  setFamilies: (families: Family[]) => void
  setItems: (items: Item[]) => void
  setPurchases: (purchases: Purchase[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  addItem: (item: Item) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  removeItem: (id: string) => void

  addFamily: (family: Family) => void
  removeFamily: (id: string) => void

  assignItem: (itemId: string, familyId: string | null) => void

  addPurchase: (purchase: Purchase) => void
  removePurchase: (id: string) => void
}

export const useBBQStore = create<BBQStore>((set) => ({
  currentEvent: null,
  families: [],
  items: [],
  purchases: [],
  loading: false,
  error: null,

  setCurrentEvent: (event) => set({ currentEvent: event }),
  setFamilies: (families) => set({ families }),
  setItems: (items) => set({ items }),
  setPurchases: (purchases) => set({ purchases }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addItem: (item) =>
    set((state) => {
      if (state.items.find((i) => i.id === item.id)) return state
      return { items: [...state.items, item] }
    }),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  addFamily: (family) =>
    set((state) => {
      if (state.families.find((f) => f.id === family.id)) return state
      return { families: [...state.families, family] }
    }),

  removeFamily: (id) =>
    set((state) => ({
      families: state.families.filter((f) => f.id !== id),
      items: state.items.map((item) =>
        item.assigned_family_id === id
          ? { ...item, assigned_family_id: null, status: 'open' as const }
          : item,
      ),
    })),

  assignItem: (itemId, familyId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assigned_family_id: familyId,
              status: (familyId ? 'assigned' : 'open') as 'open' | 'assigned',
            }
          : item,
      ),
    })),

  addPurchase: (purchase) =>
    set((state) => {
      if (state.purchases.find((p) => p.id === purchase.id)) return state
      return { purchases: [...state.purchases, purchase] }
    }),

  removePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),
}))
