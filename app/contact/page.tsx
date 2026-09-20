import BackButton from '@/components/back-button'
import CopyEmail from '@/components/copy-email'

export const metadata = {
  title: 'Contact Us | AI Image',
  description:
    'Contact AI Image support for payment, download, artwork and general enquiries.',
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 py-10">
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
            If you need assistance with an order, payment, download,
            artwork, request, recommendation or any other issue,
            please contact AI Image Support directly by email.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-white/[0.03] p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-white">
            Email AI Image Support
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            Please contact us at:
          </p>

          <CopyEmail />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-white">
            Please use the subject line
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-400">
            To help us identify and respond to your enquiry as quickly
            as possible, please clearly describe the type of issue in
            the subject line of your email.
          </p>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                Payment issue:
              </span>{' '}
              Payment issue — Order reference
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                Download problem:
              </span>{' '}
              Download issue — Artwork title
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                Complaint:
              </span>{' '}
              Complaint — Brief description
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                Recommendation:
              </span>{' '}
              Recommendation — Suggested improvement
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                Artwork request:
              </span>{' '}
              Artwork request — Subject or collection
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <span className="font-semibold text-white">
                General enquiry:
              </span>{' '}
              General enquiry — Short description
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <h2 className="text-xl font-semibold text-white">
          For order-related enquiries
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          If your message relates to a purchase, please include your
          order, checkout or payment reference where available, as well
          as the artwork title and the resolution purchased.
        </p>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Please do not send passwords, full credit card numbers or
          other sensitive financial information by email.
        </p>
      </section>
    </main>
  )
}
