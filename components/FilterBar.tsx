'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'

export default function FilterBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()
  const [q, setQ] = useState<string>(sp.get('q') ?? '')
  const sort = sp.get('sort') ?? 'NEW'

  function push(next: Record<string,string>) {
    const params = new URLSearchParams(sp.toString())
    Object.entries(next).forEach(([k,v]) => {
      if (!v) params.delete(k); else params.set(k, v)
    })
    params.set('page','1') // reset to page 1 on any filter change
    start(() => router.push(`/explore?${params.toString()}`))
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800">
      {/* search */}
      <div className="flex items-center gap-2 w-full md:max-w-md">
        <input
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search artworks, artists…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') push({ q }) }}
        />
        <button
          onClick={() => push({ q })}
          className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
          disabled={pending}
        >
          Search
        </button>
      </div>

      {/* sort */}
      <div className="flex items-center gap-2">
        <label className="text-slate-300 text-sm">Sort</label>
        <select
          className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100"
          value={sort}
          onChange={(e) => push({ sort: e.target.value })}
          disabled={pending}
        >
          <option value="NEW">Newest</option>
          <option value="PRICE_ASC">Price ↑</option>
          <option value="PRICE_DESC">Price ↓</option>
        </select>
      </div>
    </div>
  )
}
