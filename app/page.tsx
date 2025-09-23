import Link from 'next/link'
export default function HomePage() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">AI Image Gallery</h1>
      <p>Welcome! Browse artworks on the Explore page.</p>
      <Link href="/explore" className="inline-flex px-4 py-2 rounded-md bg-black text-white">
        Go to Explore →
      </Link>
    </main>
  )
}
