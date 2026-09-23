import BackButton from '@/components/back-button'

export const metadata = {
  title: 'Refund Policy | AI Image',
  description: 'Refund Policy for digital artwork purchased from AI Image.',
}

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <BackButton fallbackHref="/" />

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-6 py-8 md:px-10">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Purchases
          </div>

          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            Refund Policy
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            Last updated: 23 September 2026
          </p>
        </div>

        <div className="space-y-10 px-6 py-8 text-slate-300 md:px-10 md:py-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. Digital Products
            </h2>

            <p className="leading-7">
              AI Image sells downloadable digital artwork. Purchased digital
              files become available electronically after successful payment.
              No physical product is shipped unless a product is expressly
              described otherwise.
            </p>

            <p className="leading-7">
              Because access to the purchased digital product is provided
              promptly after payment, completed digital purchases are
              generally final once digital delivery has been made.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. Change-of-Mind Purchases
            </h2>

            <p className="leading-7">
              Please review the artwork, selected resolution or quality,
              price and other purchase details carefully before completing
              checkout.
            </p>

            <p className="leading-7">
              AI Image generally does not provide refunds simply because a
              customer changes their mind after purchasing and receiving
              access to a digital artwork.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. Technical or Delivery Problems
            </h2>

            <p className="leading-7">
              We want customers who have successfully paid for an artwork to
              receive the digital product they purchased. Please contact
              Customer Support if you experience a genuine problem such as:
            </p>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <ul className="list-disc space-y-3 pl-6 leading-7">
                <li>
                  the purchased file cannot be downloaded;
                </li>

                <li>
                  the downloaded file is corrupted or unusable;
                </li>

                <li>
                  the file delivered is different from the artwork purchased;
                </li>

                <li>
                  the delivered resolution or quality does not match the
                  option purchased;
                </li>

                <li>
                  you were charged more than once for the same intended
                  transaction; or
                </li>

                <li>
                  payment was successfully completed but access to the
                  purchased artwork was not provided.
                </li>
              </ul>
            </div>

            <p className="leading-7">
              Where reasonably possible, AI Image may first attempt to resolve
              the problem by restoring access, providing the correct file or
              supplying a replacement download.
            </p>

            <p className="leading-7">
              If a genuine purchase or delivery problem cannot reasonably be
              corrected, an appropriate refund or other remedy may be
              considered.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Incorrect Purchase Selection
            </h2>

            <p className="leading-7">
              Customers are responsible for checking the artwork and
              resolution or quality selected before completing payment.
            </p>

            <p className="leading-7">
              Accidentally selecting the wrong artwork or resolution does not
              automatically qualify a completed digital purchase for a
              refund once access to the purchased file has been provided.
              However, you may contact Customer Support if you believe an
              error occurred during the purchase process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Duplicate or Incorrect Charges
            </h2>

            <p className="leading-7">
              If you believe you have been charged incorrectly or charged
              more than once for the same intended purchase, please contact
              Customer Support so that the transaction can be reviewed.
            </p>

            <p className="leading-7">
              Providing relevant payment or order information will help us
              identify and investigate the transaction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              6. Refund Abuse and Fraud
            </h2>

            <p className="leading-7">
              AI Image reserves the right to investigate refund requests
              where there is evidence of fraud, misuse, repeated abusive
              refund activity, unauthorized access or attempts to obtain
              digital products without legitimate payment.
            </p>

            <p className="leading-7">
              Nothing in this section limits any rights or remedies that
              cannot lawfully be excluded.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              7. Payment Provider
            </h2>

            <p className="leading-7">
              Payments are processed using third-party payment providers,
              including Stripe where available. If a refund is approved, the
              refund may be processed through the original payment provider
              and payment method.
            </p>

            <p className="leading-7">
              The time required for an approved refund to appear may depend
              on the payment provider, card issuer or financial institution
              and may be outside AI Image's direct control.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              8. Consumer Rights
            </h2>

            <p className="leading-7">
              This Refund Policy does not exclude, restrict or override any
              consumer rights or remedies that cannot lawfully be excluded
              under applicable law.
            </p>

            <p className="leading-7">
              Where mandatory consumer-protection law gives you rights that
              are more favourable than this policy, those mandatory rights
              will apply.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              9. Requesting Assistance
            </h2>

            <p className="leading-7">
              If you experience a problem with a purchase, please contact AI
              Image Customer Support and provide enough information for us to
              identify the transaction and understand the problem.
            </p>

            <p className="leading-7">
              Where available, please include the artwork title, approximate
              purchase date, amount paid and any relevant payment or order
              reference. Please do not send full payment-card details by
              email.
            </p>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="font-semibold text-white">
                AI Image Customer Support
              </div>

              <div className="mt-2 text-amber-300">
                aiimagesupport@gmail.com
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
