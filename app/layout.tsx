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
      <body className="min-h-screen text-slate-900 bg-gradient-to-br from-indigo-50 via-white to-amber-50">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 opacity-50 [background:
              radial-gradient(800px_500px_at_10%_-10%,rgba(99,102,241,0.15),transparent),
              radial-gradient(700px_400px_at_90%_0%,rgba(245,158,11,0.12),transparent)
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
