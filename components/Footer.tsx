export default function Footer() {
  const showDashboard = process.env.NEXT_PUBLIC_SHOW_DASHBOARD === '1'
  return (
    <footer className="border-t border-white/10 text-sm text-neutral-400">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <p>© {new Date().getFullYear()} AI Image</p>
        <div className="flex items-center gap-4">
          <a href="https://nextjs.org" className="hover:text-amber-400">Next.js</a>
          {showDashboard && <a href="/dashboard" className="hover:text-amber-400">Dashboard</a>}
        </div>
      </div>
    </footer>
  )
}
