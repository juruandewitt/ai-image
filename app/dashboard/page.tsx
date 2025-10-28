'use client'
import { useState } from 'react'

export default function DashboardPage() {
  const [pending, setPending] = useState(false)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    const res = await fetch('/api/artworks', { method: 'POST', body: new FormData(e.currentTarget) })
    setPending(false)
    if (res.redirected) window.location.href = res.url
    else alert('Saved')
  }
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard — Add Artwork</h1>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-xl border border-white/10">
        <input name="title" placeholder="Title" className="rounded-md border bg-black/30 px-3 py-2" required />
        <input name="artist" placeholder="Artist" className="rounded-md border bg-black/30 px-3 py-2" required />
        <input name="price" type="number" placeholder="Price (cents)" className="rounded-md border bg-black/30 px-3 py-2" required />
        <input name="thumbnail" placeholder="Image URL" className="rounded-md border bg-black/30 px-3 py-2" required />
        <input name="tags" placeholder="tags (comma separated)" className="rounded-md border bg-black/30 px-3 py-2" />
        <select name="category" className="rounded-md border bg-black/30 px-3 py-2">
          <option value="ABSTRACT">Abstract</option>
          <option value="LANDSCAPE">Landscape</option>
          <option value="PORTRAIT">Portrait</option>
          <option value="SURREAL">Surreal</option>
          <option value="SCI_FI">Sci‑Fi</option>
          <option value="MINIMAL">Minimal</option>
        </select>
        <button disabled={pending} className="mt-2 md:mt-0 px-4 py-2 rounded-md bg-indigo-600 text-white">{pending?'Saving…':'Save'}</button>
      </form>
      <p className="text-sm opacity-70">Note: this basic dashboard has no auth yet; we’ll add it later.</p>
    </section>
  )
}
