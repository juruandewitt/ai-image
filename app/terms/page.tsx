import BackButton from '@/components/back-button'

export const metadata = {
  title: 'Terms of Service | AI Image',
  description: 'Terms of Service for the AI Image digital art marketplace.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <BackButton fallbackHref="/" />

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-6 py-8 md:px-10">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Legal
          </div>

          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            Terms of Service
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
              Welcome to AI Image. These Terms of Service govern your access
              to and use of the AI Image website, marketplace, digital
              artworks, downloads and related services.
            </p>

            <p className="leading-7">
              By accessing AI Image or purchasing a digital artwork, you agree
              to these Terms of Service. If you do not agree to these terms,
              please do not use the service or make a purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. The AI Image Service
            </h2>

            <p className="leading-7">
              AI Image is a digital art marketplace offering downloadable
              digital artwork, including AI-generated and AI-assisted
              artworks, artistic reinterpretations, themed collections and
              other digital visual content.
            </p>

            <p className="leading-7">
              Products sold through AI Image are digital products. No physical
              artwork, print, frame or other physical item is supplied unless
              a product is expressly described as such.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. Artwork and Artistic References
            </h2>

            <p className="leading-7">
              Some artworks available through AI Image may reference artistic
              movements, historical artists, public-domain works, visual
              traditions or stylistic characteristics for descriptive and
              creative purposes.
            </p>

            <p className="leading-7">
              Reimagined or style-inspired artworks are creative
              interpretations and should not be understood as original works
              created by, endorsed by, or officially associated with the
              historical artist whose name or style may be referenced.
            </p>

            <p className="leading-7">
              Titles, descriptions and collection names are provided to help
              customers discover and understand the artwork and do not
              necessarily indicate authorship, endorsement or affiliation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. Digital Purchases
            </h2>

            <p className="leading-7">
              When purchasing an artwork, you are purchasing access to a
              digital file at the resolution or quality level selected during
              the purchase process, together with the usage rights described
              in the applicable AI Image licence.
            </p>

            <p className="leading-7">
              You are not purchasing ownership of the AI Image platform, its
              underlying systems, source files, databases, trademarks,
              branding or other proprietary material.
            </p>

            <p className="leading-7">
              Customers are responsible for reviewing the artwork, selected
              resolution, price and applicable licence before completing
              payment.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Pricing and Payment
            </h2>

            <p className="leading-7">
              Prices displayed on AI Image are shown before checkout and may
              vary according to the artwork, resolution, licence or other
              product options.
            </p>

            <p className="leading-7">
              Payments are processed using third-party payment providers,
              including Stripe where available. AI Image does not require
              customers to provide payment-card details directly to AI Image
              when those details are collected and processed by the payment
              provider.
            </p>

            <p className="leading-7">
              A purchase is considered complete only after payment has been
              successfully confirmed.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              6. Digital Delivery
            </h2>

            <p className="leading-7">
              Purchased artworks are delivered electronically after successful
              payment. Depending on the purchase, customers may be able to
              download individual files and/or a ZIP archive containing
              multiple purchased files.
            </p>

            <p className="leading-7">
              Customers should download and safely store purchased files after
              completing their order. AI Image does not guarantee that
              download links will remain available indefinitely.
            </p>

            <p className="leading-7">
              If a technical problem prevents delivery of a successfully paid
              order, please contact AI Image Customer Support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              7. Licence and Usage Rights
            </h2>

            <p className="leading-7">
              Purchasing an artwork does not automatically transfer copyright,
              trademark rights or other intellectual-property ownership to
              the purchaser.
            </p>

            <p className="leading-7">
              Your permitted use of a purchased artwork is determined by the
              licence applicable to that purchase. The AI Image Licensing
              page forms part of these Terms of Service and explains the
              permitted and prohibited uses of downloaded artwork.
            </p>

            <p className="leading-7">
              Unless expressly permitted by the applicable licence, you may
              not resell, redistribute, sublicense, share or make the
              purchased digital artwork available as a standalone downloadable
              file or as part of a competing digital-art library,
              marketplace or collection.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              8. Intellectual Property
            </h2>

            <p className="leading-7">
              The AI Image name, website design, branding, software, database,
              text, graphics and other platform materials are protected by
              applicable intellectual-property laws and may not be copied,
              reproduced or exploited without authorization, except where
              permitted by law.
            </p>

            <p className="leading-7">
              Rights relating to individual artworks may vary according to
              their source, creation process, underlying material and
              applicable law. Nothing in these Terms should be interpreted as
              granting rights that AI Image does not legally possess or have
              authority to license.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              9. Prohibited Use
            </h2>

            <p className="leading-7">
              You may not use AI Image to engage in unlawful activity,
              interfere with the operation or security of the service,
              circumvent access controls, obtain unauthorized access to paid
              digital files, or systematically copy, scrape or extract
              marketplace content.
            </p>

            <p className="leading-7">
              You may not remove or circumvent technical measures intended to
              protect previews or paid content, or falsely represent yourself
              as the creator, operator or official representative of AI Image.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              10. Refunds
            </h2>

            <p className="leading-7">
              Because AI Image supplies digital products that become available
              for download after purchase, sales are generally final once
              digital delivery has been made.
            </p>

            <p className="leading-7">
              This does not affect any rights that cannot lawfully be excluded.
              If you experience a genuine technical delivery problem, receive
              an incorrect file, receive a corrupted file, or believe that you
              have been charged incorrectly, please contact Customer Support.
            </p>

            <p className="leading-7">
              Further information is provided in the AI Image Refund Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              11. Availability and Changes
            </h2>

            <p className="leading-7">
              We aim to keep AI Image available and functioning reliably, but
              uninterrupted or error-free availability cannot be guaranteed.
              The service may occasionally be unavailable because of
              maintenance, technical problems, third-party services or other
              circumstances.
            </p>

            <p className="leading-7">
              AI Image may add, remove or modify artworks, collections,
              features, prices or other aspects of the service. Changes will
              not alter a completed purchase retrospectively except where
              necessary to comply with law, address security concerns or
              resolve technical issues.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              12. Third-Party Services
            </h2>

            <p className="leading-7">
              AI Image relies on third-party services for certain functions,
              which may include payment processing, hosting, infrastructure
              and other technology services. Those services may be subject to
              their own terms and privacy practices.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              13. Disclaimer and Limitation of Liability
            </h2>

            <p className="leading-7">
              To the maximum extent permitted by applicable law, AI Image is
              provided on an “as available” basis. We do not guarantee that
              every artwork or service will be suitable for every particular
              purpose or use.
            </p>

            <p className="leading-7">
              Customers are responsible for ensuring that their intended use
              of an artwork complies with the applicable licence and with any
              laws, regulations or third-party rights relevant to that use.
            </p>

            <p className="leading-7">
              To the maximum extent permitted by applicable law, AI Image will
              not be liable for indirect, incidental, special or consequential
              losses arising from use of the service or digital products.
              Nothing in these Terms excludes or limits liability where doing
              so would be prohibited by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              14. Suspension and Misuse
            </h2>

            <p className="leading-7">
              AI Image may restrict or suspend access where reasonably
              necessary to protect the service, customers, intellectual
              property or security, or where there is suspected fraud,
              unauthorized access, abuse or material violation of these Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              15. Changes to These Terms
            </h2>

            <p className="leading-7">
              These Terms may be updated as AI Image develops. The current
              version will be published on this page together with its
              “Last updated” date.
            </p>

            <p className="leading-7">
              Continued use of the service after updated Terms take effect
              constitutes acceptance of the updated Terms to the extent
              permitted by applicable law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              16. Governing Law
            </h2>

            <p className="leading-7">
              These Terms are governed by the laws applicable to the operator
              of AI Image, subject to any mandatory consumer-protection rights
              that apply to a customer in their jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              17. Contact
            </h2>

            <p className="leading-7">
              Questions about these Terms, purchases or the AI Image service
              can be directed to:
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
