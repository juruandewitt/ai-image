import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 text-sm text-neutral-400">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} AI Image
        </p>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/contact"
            className="transition hover:text-amber-400"
          >
            Contact Us
          </Link>

          <Link
            href="/terms"
            className="transition hover:text-amber-400"
          >
            Terms of Service
          </Link>

          <Link
            href="/privacy"
            className="transition hover:text-amber-400"
          >
            Privacy Policy
          </Link>

          <Link
            href="/refund-policy"
            className="transition hover:text-amber-400"
          >
            Refund Policy
          </Link>

          <Link
            href="/licensing"
            className="transition hover:text-amber-400"
          >
            Licensing
          </Link>
        </nav>
      </div>
    </footer>
  )
}
