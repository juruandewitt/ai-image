// app/layout.tsx (dark global background version)
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
      {/* Dark global background with subtle neon glows */}
      <body className="min-h-screen text-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Ambient glows behind everything */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 opacity-40 [background:
              radial-gradient(800px_500px_at_10%_-10%,rgba(99,102,241,0.2),transparent),
              radial-gradient(700px_400px_at_90%_0%,rgba(245,158,11,0.15),transparent)
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
