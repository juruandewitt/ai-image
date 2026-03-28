import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <h1 className="text-3xl font-semibold">Checkout canceled</h1>
      <p className="text-slate-400">
        Your payment was not completed. You can return to the artwork and try again.
      </p>
      <Link href="/" className="text-amber-400 hover:underline">
        Return home
      </Link>
    </main>
  )
}
