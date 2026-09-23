import BackButton from '@/components/back-button'

export const metadata = {
  title: 'Licensing | AI Image',
  description:
    'Licensing terms for digital artwork purchased from AI Image.',
}

export default function LicensingPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <BackButton fallbackHref="/" />

      <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
        <div className="border-b border-white/10 px-6 py-8 md:px-10">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Artwork Licence
          </div>

          <h1 className="mt-5 text-4xl font-semibold text-white md:text-5xl">
            Licensing
          </h1>

          <p className="mt-4 text-sm text-slate-400">
            Last updated: 23 September 2026
          </p>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Your purchase gives you a licence to use the downloaded artwork.
            It does not transfer ownership of AI Image or automatically
            transfer copyright or other intellectual-property ownership.
          </p>
        </div>

        <div className="space-y-10 px-6 py-8 text-slate-300 md:px-10 md:py-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              1. Your AI Image Licence
            </h2>

            <p className="leading-7">
              When you successfully purchase and download an artwork from AI
              Image, you receive a non-exclusive licence to use that digital
              artwork in accordance with this Licensing Policy.
            </p>

            <p className="leading-7">
              Unless a particular artwork or purchase is expressly offered
              under different licence terms, this licence applies regardless
              of the image resolution or quality level you purchase.
            </p>

            <p className="leading-7">
              Purchasing a higher-resolution version provides a
              higher-resolution digital file. It does not, by itself, provide
              broader intellectual-property rights than a lower-resolution
              purchase.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              2. Personal Use
            </h2>

            <p className="leading-7">
              You may use purchased artwork for ordinary personal and
              non-commercial purposes.
            </p>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
              <div className="font-semibold text-emerald-300">
                Examples of permitted personal use
              </div>

              <ul className="mt-4 list-disc space-y-3 pl-6 leading-7">
                <li>
                  desktop, phone and tablet wallpapers;
                </li>

                <li>
                  displaying the artwork on your own digital devices;
                </li>

                <li>
                  making prints for your own personal display;
                </li>

                <li>
                  using the artwork in personal creative projects;
                </li>

                <li>
                  using the artwork in personal presentations or documents;
                </li>

                <li>
                  sharing a finished personal project that incorporates the
                  artwork, provided you do not distribute the original
                  downloadable artwork file itself.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              3. Commercial Use
            </h2>

            <p className="leading-7">
              Unless a particular artwork is expressly marked with different
              licence terms, a purchased AI Image artwork may also be used in
              commercial creative projects, subject to the restrictions in
              this Licensing Policy.
            </p>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-5">
              <div className="font-semibold text-emerald-300">
                Examples of permitted commercial use
              </div>

              <ul className="mt-4 list-disc space-y-3 pl-6 leading-7">
                <li>
                  websites and digital publications;
                </li>

                <li>
                  social-media content;
                </li>

                <li>
                  advertisements and marketing materials;
                </li>

                <li>
                  presentations and business communications;
                </li>

                <li>
                  editorial layouts and publications;
                </li>

                <li>
                  videos, films and other audiovisual projects;
                </li>

                <li>
                  posters, brochures and promotional materials;
                </li>

                <li>
                  client projects where the artwork forms part of a larger
                  finished design or creative work; and
                </li>

                <li>
                  physical products where the artwork is incorporated into a
                  broader finished product, subject to applicable law and
                  third-party rights.
                </li>
              </ul>
            </div>

            <p className="leading-7">
              Commercial use does not give you exclusive rights to the
              artwork. AI Image may continue to offer the same artwork to
              other customers, and other customers may receive licences to
              use it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              4. What You May Not Do
            </h2>

            <p className="leading-7">
              Your licence does not permit you to redistribute the purchased
              artwork as a competing digital asset or make the original
              digital file available to others.
            </p>

            <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-5">
              <div className="font-semibold text-red-300">
                Prohibited uses
              </div>

              <ul className="mt-4 list-disc space-y-3 pl-6 leading-7">
                <li>
                  reselling the downloaded artwork itself as a standalone
                  digital image;
                </li>

                <li>
                  uploading the artwork to another stock-image, digital-art,
                  wallpaper, asset or download marketplace for redistribution;
                </li>

                <li>
                  giving, sharing or distributing the original purchased file
                  to other people;
                </li>

                <li>
                  making the original or substantially equivalent artwork
                  available for free download;
                </li>

                <li>
                  sublicensing the standalone artwork to another person or
                  business as though you were the owner of the underlying
                  rights;
                </li>

                <li>
                  creating a competing collection, image library or download
                  service primarily from AI Image artworks;
                </li>

                <li>
                  falsely claiming that AI Image endorses you, your company or
                  your product;
                </li>

                <li>
                  falsely representing an AI Image artwork as an original
                  historical artwork created by a referenced Master; or
                </li>

                <li>
                  using the artwork in a way that violates applicable law or
                  third-party rights.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              5. Products for Sale
            </h2>

            <p className="leading-7">
              You may incorporate purchased artwork into a physical product
              for sale where the artwork forms part of the finished product,
              subject to this licence and applicable law.
            </p>

            <p className="leading-7">
              However, you may not use a purchased artwork to create a product
              whose primary purpose is to redistribute the artwork as a
              standalone or easily extractable digital asset.
            </p>

            <p className="leading-7">
              For example, incorporating an artwork into a printed poster,
              publication, package, presentation or other finished physical
              product may be permitted. Selling or distributing the original
              image file, or a substantially equivalent standalone digital
              copy, is not.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              6. Client Work
            </h2>

            <p className="leading-7">
              You may use purchased artwork in work created for a client,
              provided the artwork is incorporated into the completed project
              and is not supplied to the client as a separately reusable
              stock or digital-art asset.
            </p>

            <p className="leading-7">
              If a client requires the standalone source artwork for separate
              future use, the client should obtain an appropriate licence for
              that use.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              7. No Exclusivity
            </h2>

            <p className="leading-7">
              Standard purchases from AI Image are non-exclusive. Purchasing
              an artwork does not prevent AI Image from continuing to display,
              license or sell access to the same artwork to other customers.
            </p>

            <p className="leading-7">
              A standard purchase should therefore not be interpreted as an
              exclusive acquisition of the artwork.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              8. Copyright and Ownership
            </h2>

            <p className="leading-7">
              Purchasing an artwork does not automatically transfer copyright,
              trademark rights or other intellectual-property ownership to
              you.
            </p>

            <p className="leading-7">
              Rights relating to AI-generated material can differ between
              jurisdictions and may depend on factors such as the creation
              process, human contribution and underlying source material.
              Some AI Image works may also incorporate, reference or be
              inspired by public-domain material.
            </p>

            <p className="leading-7">
              This licence grants permission only to the extent that AI Image
              has the legal right or authority to grant that permission.
              Nothing in this policy should be interpreted as transferring or
              guaranteeing rights that AI Image does not legally possess.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              9. Masters and Reimagined Artwork
            </h2>

            <p className="leading-7">
              AI Image includes collections inspired by historical artists,
              artistic movements and well-known works. References to a Master,
              artist, style or historical artwork are used for descriptive,
              organizational and creative purposes.
            </p>

            <p className="leading-7">
              Unless expressly stated otherwise, reimagined or style-inspired
              artworks are not original works created by, endorsed by or
              officially associated with the historical artist whose name or
              style is referenced.
            </p>

            <p className="leading-7">
              Customers remain responsible for ensuring that their particular
              intended use complies with any laws or third-party rights that
              may apply in the jurisdiction where the artwork will be used.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              10. Trademarks, Logos and Endorsement
            </h2>

            <p className="leading-7">
              This licence does not grant rights in third-party trademarks,
              logos, brand names, personality rights or other independently
              protected material that may appear in or be associated with an
              artwork.
            </p>

            <p className="leading-7">
              You should not use an artwork in a way that falsely suggests
              sponsorship, endorsement or official association with a person,
              artist, company, brand or organization.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              11. Resolution and Licence Rights
            </h2>

            <p className="leading-7">
              AI Image may offer an artwork at multiple resolution or quality
              levels, including High, Very High and Ultra.
            </p>

            <p className="leading-7">
              The selected level determines the digital file delivered to you.
              Unless expressly stated otherwise during checkout, all standard
              resolution levels are governed by the same usage licence.
            </p>

            <p className="leading-7">
              A higher price for a higher-resolution file reflects the digital
              product supplied and does not create exclusive ownership or
              additional intellectual-property rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              12. Licence Duration
            </h2>

            <p className="leading-7">
              Subject to these terms and applicable law, the licence for a
              legitimately purchased artwork does not require a recurring
              subscription or renewal fee.
            </p>

            <p className="leading-7">
              The licence may cease to apply if the artwork was obtained
              fraudulently, without valid payment, or if use materially
              violates the applicable licence terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              13. Responsibility for Your Use
            </h2>

            <p className="leading-7">
              You are responsible for determining whether your particular use
              of an artwork is appropriate and lawful, especially for
              commercial, advertising, trademark, merchandising or other
              public-facing uses.
            </p>

            <p className="leading-7">
              AI Image cannot guarantee that every possible use of every
              artwork will be legally permissible in every country or
              jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              14. Questions About Licensing
            </h2>

            <p className="leading-7">
              If you are unsure whether your intended use is permitted, or if
              you require rights beyond the standard AI Image licence, please
              contact Customer Support before using the artwork for that
              purpose.
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
