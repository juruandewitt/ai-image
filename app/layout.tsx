// app/layout.tsx
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'AI Image',
  description: 'Discover & collect AI-generated artworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Dark global gradient + soft neon glows */}
      <body className="min-h-screen text-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 opacity-60 [background:
            radial-gradient(900px_600px_at_12%_-10%,rgba(99,102,241,0.25),transparent),
            radial-gradient(700px_450px_at_90%_0%,rgba(245,158,11,0.18),transparent)
          ]" />
        </div>

        <Navbar />

        <main className="container mx-auto px-4 py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
