"use client"

import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
            <div className="text-neutral-300 mb-8">
              <strong className="text-white">Obscura Labs LLC</strong><br />
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-neutral-200 leading-relaxed mb-6">
                By accessing or using Obscura Labs' services, you agree to these Terms of Service.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Authorized Use</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>Our services may only be used for defensive cybersecurity, fraud prevention, and investigative purposes.</li>
                <li>You may not use our data to gain unauthorized access to systems, accounts, or networks.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Access Restrictions</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>Access is limited to vetted organizations, accredited researchers, and verified law enforcement agencies.</li>
                <li>Obscura Labs reserves the right to refuse or revoke access if misuse is suspected.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Confidentiality</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>Data provided by Obscura Labs must be treated as confidential and may not be redistributed without explicit written consent.</li>
                <li>Customers must implement reasonable safeguards to protect any data received.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Free Access</h2>
              <p className="text-neutral-200">
                Law enforcement and accredited researchers may request free access for investigative and public-interest purposes. Approval is at Obscura Labs' discretion.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Liability</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>Obscura Labs provides data "as is" without warranty. While we strive for accuracy, we cannot guarantee completeness or correctness of the data.</li>
                <li>Obscura Labs shall not be liable for misuse of data by customers.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Termination</h2>
              <p className="text-neutral-200">
                We may suspend or terminate accounts that violate these Terms.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Contact Information</h2>
              <p className="text-neutral-200">
                For questions about these Terms of Service, please contact us at <a href="mailto:legal@obscuralabs.com" className="text-white hover:text-neutral-300 underline">legal@obscuralabs.com</a>.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">8. Changes to Terms</h2>
              <p className="text-neutral-200">
                We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date. Continued use of our services constitutes acceptance of any changes.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
