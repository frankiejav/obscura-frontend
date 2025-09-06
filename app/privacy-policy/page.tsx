"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function PrivacyPolicyPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="bg-neutral-900/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={32} height={32} priority />
            <span className="text-lg font-semibold text-white">OBSCURA LABS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Button 
              variant="outline"
              size="sm"
              className="border border-white/20 hover:border-white/40 text-white hover:bg-white/5 transition-all duration-300"
              onClick={() => router.push('/login')}
            >
              Access Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-1 ring-white/10 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
            <div className="text-neutral-300 mb-8">
              <strong className="text-white">Obscura Labs LLC</strong><br />
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-neutral-200 leading-relaxed mb-6">
                Obscura Labs LLC ("Obscura Labs," "we," "us," or "our") is committed to protecting the security and privacy of the data we process. Our mission is to provide credential and breach intelligence to vetted organizations, security researchers, and law enforcement for the purpose of preventing account takeover, fraud, and other cybercrimes.
              </p>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Data We Collect</h2>
              <div className="space-y-4 text-neutral-200">
                <p><strong className="text-white">Leaked & Malware-Exfiltrated Data:</strong> We aggregate credential data (e.g., email addresses, usernames, and associated passwords) that has been exposed through data breaches, stealer malware infections, or other underground sources.</p>
                <p><strong className="text-white">Customer Data:</strong> When organizations use our services, we may collect limited account information (business name, contact details, payment information).</p>
              </div>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Purpose of Processing</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>To enable vetted organizations to identify compromised accounts belonging to their employees or customers.</li>
                <li>To support law enforcement and accredited researchers in analyzing cybercrime trends and protecting the public.</li>
                <li>To improve our services by analyzing breach trends and credential exposure.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Data Security & Encryption</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>All credential data is encrypted at rest using industry-standard AES-256 encryption.</li>
                <li>All communications with our platform are encrypted in transit via TLS 1.2+.</li>
                <li>Access to decrypted data is restricted to authorized customers and staff under strict role-based access control (RBAC) and logged for audit purposes.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Free Access for Researchers & Law Enforcement</h2>
              <div className="space-y-4 text-neutral-200">
                <p>We provide limited, no-cost access to accredited security researchers, academic institutions, and verified law enforcement agencies for defensive and investigative purposes.</p>
                <p>Such access requires verification and approval by Obscura Labs.</p>
              </div>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Data Sharing & Restrictions</h2>
              <ul className="space-y-2 text-neutral-200 list-disc list-inside">
                <li>Credential data is shared exclusively with vetted organizations and researchers.</li>
                <li>We do not sell or provide raw credential data to consumers or the general public.</li>
                <li>Customers are prohibited from misusing data for surveillance, unauthorized access, or any non-defensive purpose.</li>
              </ul>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Retention & Removal</h2>
              <div className="space-y-4 text-neutral-200">
                <p>Data is retained for as long as necessary to provide cybersecurity defense services.</p>
                <p>Individuals may request information about whether their data has appeared in our datasets by contacting us at <a href="mailto:privacy@obscuralabs.com" className="text-white hover:text-neutral-300 underline">privacy@obscuralabs.com</a>.</p>
              </div>

              <h2 className="text-2xl font-bold text-white mt-8 mb-4">7. Compliance</h2>
              <p className="text-neutral-200">
                We process data in alignment with GDPR, CCPA, and other applicable privacy frameworks. While Obscura Labs is not a consumer-facing platform, we respect individual rights to privacy and will cooperate with lawful takedown or erasure requests.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-neutral-950 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={20} height={20} />
            <span className="text-sm font-semibold text-white">OBSCURA LABS</span>
          </div>
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Obscura Labs LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
