import Link from 'next/link'
import BackButton from '@/components/back-button'
import ContactForm from '@/components/contact-form'

export const metadata = {
  title: 'Contact Us | AI Image',
  description:
    'Contact AI Image support for payment, download, account, artwork, recommendation and general support enquiries.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-10 py-10">
      <div>
        <BackButton />
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Customer Support
          </div>

          <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
            Contact Us
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-400 md:text-lg">
            Need help with an order, payment, download or artwork?
            Send us a message and the AI Image support team will
            assist you.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-9">
          <h2 className="text-2xl font-semibold text-white">
            Send us a message
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Complete the form below. Fields marked with an asterisk
            are required.
          </p>

          <div className="mt-7">
            <ContactForm />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-white/[0.03] p-7">
            <h2 className="text-xl font-semibold text-white">
              Prefer email?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              You can contact AI Image support directly at:
            </p>

            <a
              href="mailto:aiimagesupport@gmail.com"
              className="mt-5 block break-all text-lg font-semibold text-amber-300 hover:underline"
            >
              aiimagesupport@gmail.com
            </a>

            <a
              href="mailto:aiimagesupport@gmail.com?subject=AI%20Image%20Support%20Request"
              className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
            >
              Email Support
            </a>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <h2 className="text-xl font-semibold text-white">
              We can help with
            </h2>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div>
                <div className="font-semibold text-white">
                  Payment issues
                </div>
                <p className="mt-1 text-slate-400">
                  Questions about checkout, charges or payment
                  confirmation.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white">
                  Download problems
                </div>
                <p className="mt-1 text-slate-400">
                  Purchased files that did not download or appear
                  correctly.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white">
                  Artwork enquiries
                </div>
                <p className="mt-1 text-slate-400">
                  Questions about images, resolutions, collections
                  or licensing.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white">
                  Complaints & feedback
                </div>
                <p className="mt-1 text-slate-400">
                  Tell us about a problem or suggest how AI Image
                  could be improved.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white">
                  Requests & recommendations
                </div>
                <p className="mt-1 text-slate-400">
                  Request artwork themes, collections or features
                  you would like to see.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
            <h2 className="text-lg font-semibold text-white">
              Order-related enquiry?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              If your message relates to a purchase, please include
              your checkout or payment reference where available.
              Never send your full card number, password or other
              sensitive payment information.
            </p>
          </div>

          <Link
            href="/"
            className="block text-center text-sm font-semibold text-amber-300 hover:underline"
          >
            Return to main page
          </Link>
        </aside>
      </section>
    </main>
  )
}
