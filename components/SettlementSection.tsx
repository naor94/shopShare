'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBBQStore } from '@/lib/store'
import { Purchase } from '@/types'

interface Transfer {
  from: string
  fromColor: string
  to: string
  toColor: string
  amount: number
}

function calcSettlement(
  families: { id: string; name: string; color: string }[],
  purchases: Purchase[],
): { totals: Record<string, number>; transfers: Transfer[]; grandTotal: number; fairShare: number } {
  const totals: Record<string, number> = {}
  families.forEach((f) => (totals[f.id] = 0))
  purchases.forEach((p) => {
    if (totals[p.family_id] !== undefined) totals[p.family_id] += p.amount
  })

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)
  const fairShare = families.length > 0 ? grandTotal / families.length : 0

  // balance = paid - fair_share. positive = owed money, negative = owes money
  const balances = families.map((f) => ({ ...f, balance: totals[f.id] - fairShare }))

  const creditors = balances.filter((b) => b.balance > 0.005).sort((a, b) => b.balance - a.balance)
  const debtors = balances.filter((b) => b.balance < -0.005).sort((a, b) => a.balance - b.balance)

  const transfers: Transfer[] = []
  const cred = creditors.map((c) => ({ ...c }))
  const debt = debtors.map((d) => ({ ...d }))
  let ci = 0
  let di = 0

  while (ci < cred.length && di < debt.length) {
    const amount = Math.min(cred[ci].balance, -debt[di].balance)
    transfers.push({
      from: debt[di].name,
      fromColor: debt[di].color,
      to: cred[ci].name,
      toColor: cred[ci].color,
      amount: Math.round(amount * 100) / 100,
    })
    cred[ci].balance -= amount
    debt[di].balance += amount
    if (cred[ci].balance < 0.005) ci++
    if (debt[di].balance > -0.005) di++
  }

  return { totals, transfers, grandTotal, fairShare }
}

interface SettlementSectionProps {
  eventId: string
  onAddPurchase: () => void
}

export default function SettlementSection({ eventId, onAddPurchase }: SettlementSectionProps) {
  const { families, purchases, removePurchase } = useBBQStore()
  const [expanded, setExpanded] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { totals, transfers, grandTotal, fairShare } = calcSettlement(families, purchases)

  async function handleDelete(purchase: Purchase) {
    setDeletingId(purchase.id)
    await supabase.from('purchases').delete().eq('id', purchase.id)
    removePurchase(purchase.id)
    setDeletingId(null)
  }

  const hasPurchases = purchases.length > 0

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">💰 הוצאות וחישוב</h2>
          {hasPurchases && (
            <span className="text-sm text-gray-400">({purchases.length} קניות)</span>
          )}
        </div>
        <button
          onClick={onAddPurchase}
          className="px-4 py-2 bg-white border border-orange-200 text-orange-700
                     rounded-xl font-semibold hover:bg-orange-50 active:bg-orange-100
                     transition-all duration-150 shadow-sm flex items-center gap-2 text-sm"
        >
          <span>+</span> הוסף קנייה
        </button>
      </div>

      {!hasPurchases ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-gray-500 mb-4">עדיין לא נרשמו קניות. הוסף קנייה כדי לחשב מי צריך להחזיר כסף.</p>
          <button onClick={onAddPurchase} className="btn-primary">הוסף קנייה ראשונה</button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Per-family totals */}
          <div className="card p-4">
            <div className="space-y-3">
              {families.map((f) => {
                const paid = totals[f.id] ?? 0
                const balance = paid - fairShare
                return (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="font-semibold text-gray-700 flex-1">{f.name}</span>
                    <span className="text-gray-800 font-bold">
                      &#8362;{paid.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    {Math.abs(balance) > 0.5 && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          color: balance > 0 ? '#16a34a' : '#dc2626',
                          backgroundColor: balance > 0 ? '#dcfce7' : '#fee2e2',
                        }}
                      >
                        {balance > 0
                          ? '+\u20AA' + Math.round(balance)
                          : '-\u20AA' + Math.round(-balance)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="border-t border-orange-100 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">סה&quot;כ</span>
              <span className="font-bold text-gray-800 text-lg">
                &#8362;{grandTotal.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
            {families.length > 1 && fairShare > 0 && (
              <div className="text-xs text-gray-400 text-left mt-1">
                חלק שווה: &#8362;{fairShare.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} לכל אחד
              </div>
            )}
          </div>

          {/* Settlement transfers */}
          {transfers.length > 0 && (
            <div className="card p-4 bg-green-50/30" style={{ borderColor: '#bbf7d0' }}>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>💸</span> מי צריך להעביר למי
              </h3>
              <div className="space-y-2">
                {transfers.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-semibold text-sm px-2 py-0.5 rounded-lg"
                      style={{ backgroundColor: t.fromColor + '25', color: t.fromColor }}
                    >
                      {t.from}
                    </span>
                    <span className="text-gray-500 text-sm">מעביר/ת</span>
                    <span className="font-bold text-gray-800">
                      &#8362;{t.amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-500 text-sm">ל</span>
                    <span
                      className="font-semibold text-sm px-2 py-0.5 rounded-lg"
                      style={{ backgroundColor: t.toColor + '25', color: t.toColor }}
                    >
                      {t.to}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {transfers.length === 0 && grandTotal > 0 && (
            <div className="card p-4 bg-green-50/50 text-center" style={{ borderColor: '#bbf7d0' }}>
              <span className="text-green-700 font-semibold">✅ כולם שילמו שווה בשווה!</span>
            </div>
          )}

          {/* Purchase list (expandable) */}
          <div className="card overflow-hidden">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-600 hover:bg-orange-50 transition-colors"
            >
              <span>רשימת קניות</span>
              <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
            </button>
            {expanded && (
              <div className="border-t border-orange-100 divide-y divide-orange-50">
                {purchases.map((p) => {
                  const family = families.find((f) => f.id === p.family_id)
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                      {family && (
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: family.color }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-gray-700">{family?.name ?? '—'}</span>
                        {p.description && (
                          <span className="text-xs text-gray-400 mr-2">{p.description}</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-800 text-sm">
                        &#8362;{p.amount.toLocaleString('he-IL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
                        title="מחק"
                      >
                        🗑
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
