export default function Footer() {
  return (
    <footer className="border-t border-white/10 text-sm text-neutral-400">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <p>© {new Date().getFullYear()} AI Image</p>
        <p>Built with Next.js & Prisma</p>
      </div>
    </footer>
  )
}
