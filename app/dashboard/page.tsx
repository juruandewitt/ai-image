'use client'
import { useState } from 'react'

export default function DashboardPage() {
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    setPending(false)
    if (res.ok) {
      const j = await res.json()
      setMsg(`Saved! Artwork ID: ${j.id}`)
      e.currentTarget.reset()
    } else {
      const j = await res.json().catch(() => ({}))
      setMsg(`Error: ${j.error || 'Upload failed'}`)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard — Add Artwork</h1>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-xl border border-white/10">
        <input name="title" placeholder="Title" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />
        <input name="artist" placeholder="Artist" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" defaultValue="AI Studio" required />
        <input name="price" type="number" placeholder="Price (cents)" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />

        <select name="style" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
          <option value="VAN_GOGH">Vincent van Gogh</option>
          <option value="REMBRANDT">Rembrandt van Rijn</option>
          <option value="PICASSO">Pablo Picasso</option>
          <option value="VERMEER">Johannes Vermeer</option>
          <option value="MONET">Claude Monet</option>
          <option value="MICHELANGELO">Michelangelo</option>
          <option value="DALI">Salvador Dalí</option>
          <option value="CARAVAGGIO">Caravaggio</option>
          <option value="DA_VINCI">Leonardo da Vinci</option>
          <option value="POLLOCK">Jackson Pollock</option>
        </select>

        <select name="category" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
          <option value="ABSTRACT">Abstract</option>
          <option value="LANDSCAPE">Landscape</option>
          <option value="PORTRAIT">Portrait</option>
          <option value="SURREAL">Surreal</option>
          <option value="SCI_FI">Sci-Fi</option>
          <option value="MINIMAL">Minimal</option>
        </select>

        <input name="tags" placeholder="tags (comma separated)" className="rounded-md border border-white/10 bg-black/30 px-3 py-2 md:col-span-2" />

        <div className="md:col-span-2 space-y-2">
          <label className="text-sm opacity-80">Artwork image (PNG/JPG/WebP)</label>
          <input name="file" type="file" accept="image/*" className="rounded-md border border-white/10 bg-black/30 px-3 py-2 w-full" required />
        </div>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input type="checkbox" name="featured" className="accent-indigo-600" />
          Mark as featured (eligible for homepage carousel)
        </label>

        <button disabled={pending} className="mt-2 md:mt-0 px-4 py-2 rounded-md bg-indigo-600 text-white">
          {pending ? 'Uploading…' : 'Save'}
        </button>
      </form>

      {msg && <p className="text-sm text-amber-300">{msg}</p>}
    </section>
  )
}
