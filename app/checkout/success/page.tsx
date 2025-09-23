import Link from 'next/link'
export default function SuccessPage() {
  return (
    <section className="text-center py-20 space-y-4">
      <h1 className="text-3xl font-bold">🎉 Purchase Successful</h1>
      <p className="text-neutral-600">Thank you for your purchase.</p>
      <Link className="underline" href="/explore">Continue browsing</Link>
    </section>
  )
}
