'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

const CATEGORIES = [
  { key: 'ABSTRACT',  label: 'Abstract' },
  { key: 'LANDSCAPE', label: 'Landscape' },
  { key: 'PORTRAIT',  label: 'Portrait' },
  { key: 'SURREAL',   label: 'Surreal' },
  { key: 'SCI_FI',    label: 'Sci-Fi' },
  { key: 'MINIMAL',   label: 'Minimal' },
]
const SORTS = [
  { key: 'new',        label: 'Newest' },
  { key: 'featured',   label: 'Featured' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
]

export default function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [q, setQ] = useState(sp.get('q') || '')
  const activeSort = sp.get('sort') || 'new'
  const activeCats = sp.getAll('category')

  const apply = useCallback((patch: Record<string,string|string[]|null>) => {
    const params = new URLSearchParams(sp.toString())
    for (const [k,v] of Object.entries(patch)) {
      params.delete(k)
      if (v == null) continue
      if (Array.isArray(v)) v.forEach(val => params.append(k, val))
      else if (v !== '') params.set(k, v)
    }
    params.set('page','1')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, sp])

  const toggleCat = (key: string) => {
    const next = new Set(activeCats)
    next.has(key) ? next.delete(key) : next.add(key)
    apply({ category: Array.from(next) })
  }
  const setSort = (key: string) => apply({ sort: key })
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); apply({ q }) }
  const isActive = (key: string) => activeCats.includes(key)

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur px-4 py-3 text-sm text-neutral-200">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, artist or tag…" className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 outline-none" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={()=>toggleCat(c.key)} className={`px-3 py-1.5 rounded-full border ${isActive(c.key) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/30 border-white/10 text-neutral-200'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <label className="opacity-80">Sort</label>
          <select value={activeSort} onChange={e=>setSort(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5">
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white md:ml-2">Apply</button>
      </form>
    </div>
  )
}
