'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const goto = (p: number) => {
    const params = new URLSearchParams(sp.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button disabled={page<=1} onClick={()=>goto(page-1)} className="px-3 py-1.5 rounded-md border border-white/10 disabled:opacity-40">← Prev</button>
      <span className="text-sm opacity-80">Page {page} / {totalPages}</span>
      <button disabled={page>=totalPages} onClick={()=>goto(page+1)} className="px-3 py-1.5 rounded-md border border-white/10 disabled:opacity-40">Next →</button>
    </div>
  )
}
