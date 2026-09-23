import BackButton from '@/components/back-button'

export const metadata = {
  title: 'Privacy Policy | AI Image',
  description: 'Privacy Policy for the AI Image digital art marketplace.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <BackButton fallbackHref="/" />

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-6 py-8 md:px-10">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Privacy
          </div>

          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            Last updated: 23 September 2026
          </p>
        </div>

        <div className="space-y-10 px-6 py-8 text-slate-300 md:px-10 md:py-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. Introduction
            </h2>

            <p className="leading-7">
              AI Image respects your privacy. This Privacy Policy explains
              how information may be collected, used and handled when you
              browse the AI Image website, purchase digital artwork, contact
              Customer Support or otherwise use our services.
            </p>

            <p className="leading-7">
              By using AI Image, you acknowledge the practices described in
              this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. Information We May Collect
            </h2>

            <p className="leading-7">
              The information associated with your use of AI Image depends on
              how you interact with the service.
            </p>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div>
                <h3 className="font-semibold text-white">
                  Purchase information
                </h3>

                <p className="mt-2 leading-7">
                  When you make a purchase, information relating to the
                  transaction may be processed, including the products
                  purchased, selected resolution or quality, amount paid,
                  payment status and transaction identifiers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Payment information
                </h3>

                <p className="mt-2 leading-7">
                  Payments are processed by third-party payment providers such
                  as Stripe. Payment-card details are submitted to and
                  processed by the payment provider rather than being directly
                  stored by AI Image.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Communications
                </h3>

                <p className="mt-2 leading-7">
                  If you contact AI Image Customer Support, we may receive the
                  information you choose to provide, such as your email
                  address, order information and the contents of your message.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Technical information
                </h3>

                <p className="mt-2 leading-7">
                  When you use the website, certain technical information may
                  be processed automatically by AI Image or its service
                  providers. This may include information such as IP address,
                  browser or device information, request information, error
                  data and basic website usage information.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. How We Use Information
            </h2>

            <p className="leading-7">
              Information may be used where reasonably necessary to operate
              and protect AI Image, including to:
            </p>

            <ul className="list-disc space-y-3 pl-6 leading-7">
              <li>process and verify purchases;</li>
              <li>provide access to purchased digital files;</li>
              <li>provide Customer Support;</li>
              <li>respond to questions or technical problems;</li>
              <li>maintain and improve the reliability of the website;</li>
              <li>detect or prevent fraud, abuse and unauthorized access;</li>
              <li>maintain transaction and operational records; and</li>
              <li>comply with applicable legal obligations.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Payment Processing
            </h2>

            <p className="leading-7">
              AI Image uses third-party payment providers to process payments.
              Stripe is currently used for payment processing where available.
            </p>

            <p className="leading-7">
              When you enter payment-card or other payment information during
              checkout, that information is handled by the payment provider
              in accordance with its own privacy policy and security
              practices.
            </p>

            <p className="leading-7">
              AI Image may receive limited information from the payment
              provider that is necessary to confirm and administer a
              transaction, such as payment status, amount, transaction
              identifiers and information associated with the order.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Service Providers
            </h2>

            <p className="leading-7">
              AI Image relies on third-party providers to operate parts of the
              service. These may include providers of payment processing,
              website hosting, cloud infrastructure, file storage, database
              services and other technical services.
            </p>

            <p className="leading-7">
              These providers may process information as necessary to provide
              their services and are subject to their own legal, privacy and
              security obligations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              6. Cookies and Similar Technologies
            </h2>

            <p className="leading-7">
              AI Image and the services supporting the website may use
              cookies, browser storage or similar technologies where required
              for website functionality, security, checkout, preferences or
              related technical purposes.
            </p>

            <p className="leading-7">
              Third-party services used by AI Image, including payment and
              infrastructure providers, may also use cookies or similar
              technologies in accordance with their own policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              7. Cart Information
            </h2>

            <p className="leading-7">
              AI Image may use browser-based storage to preserve your shopping
              cart and related selections between pages or browsing sessions.
              This allows items you have selected to remain available while
              you continue shopping or proceed to checkout.
            </p>

            <p className="leading-7">
              Clearing browser data or using certain privacy settings may
              remove locally stored cart information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              8. Sharing of Information
            </h2>

            <p className="leading-7">
              AI Image does not sell your personal information to advertisers.
            </p>

            <p className="leading-7">
              Information may be shared with service providers where necessary
              to operate the service, process payments, deliver purchases,
              maintain infrastructure, prevent fraud, provide support or
              comply with legal requirements.
            </p>

            <p className="leading-7">
              Information may also be disclosed where reasonably necessary to
              comply with law, legal process or a valid governmental request,
              or to protect the rights, property, security or integrity of AI
              Image, its customers or others.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              9. Data Retention
            </h2>

            <p className="leading-7">
              Information is retained only for as long as reasonably necessary
              for the purposes described in this Privacy Policy, including
              providing the service, maintaining transaction records,
              resolving disputes, preventing fraud and complying with legal,
              accounting or operational requirements.
            </p>

            <p className="leading-7">
              Different categories of information may be retained for
              different periods depending on their purpose and applicable
              requirements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              10. Data Security
            </h2>

            <p className="leading-7">
              AI Image uses reasonable technical and organizational measures
              intended to protect information and the operation of the
              service.
            </p>

            <p className="leading-7">
              However, no internet service, transmission method or electronic
              storage system can be guaranteed to be completely secure. You
              should take appropriate care when using online services and
              protecting your own devices and information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              11. International Processing
            </h2>

            <p className="leading-7">
              AI Image uses online and cloud-based service providers. As a
              result, information may be processed or stored in countries
              other than the country in which you are located.
            </p>

            <p className="leading-7">
              Where required by applicable law, appropriate safeguards should
              be used for international transfers and processing of personal
              information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              12. Your Privacy Rights
            </h2>

            <p className="leading-7">
              Depending on the laws that apply to you, you may have rights
              relating to your personal information. These may include rights
              to request access, correction, deletion or restriction of
              certain information, or to object to certain processing.
            </p>

            <p className="leading-7">
              These rights are subject to applicable law and may be limited
              where information must be retained for legitimate business,
              transaction, security or legal purposes.
            </p>

            <p className="leading-7">
              To make a privacy-related request, contact AI Image Customer
              Support using the details below.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              13. Children's Privacy
            </h2>

            <p className="leading-7">
              AI Image is not specifically directed at children. We do not
              knowingly seek to collect personal information from children in
              circumstances where parental or guardian consent would be
              required by applicable law.
            </p>

            <p className="leading-7">
              If you believe that a child has provided personal information
              through AI Image inappropriately, please contact Customer
              Support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              14. Third-Party Links
            </h2>

            <p className="leading-7">
              AI Image may contain links to third-party websites or services.
              AI Image is not responsible for the privacy practices of
              independent third parties. You should review their privacy
              information when using those services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              15. Changes to This Privacy Policy
            </h2>

            <p className="leading-7">
              This Privacy Policy may be updated as AI Image develops, its
              services change or legal requirements evolve.
            </p>

            <p className="leading-7">
              The current version will be published on this page together with
              the date on which it was last updated.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              16. Contact
            </h2>

            <p className="leading-7">
              For questions about this Privacy Policy or requests relating to
              your personal information, please contact:
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
