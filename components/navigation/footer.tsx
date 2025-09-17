import Image from "next/image"
import Link from "next/link"

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Compliance", href: "/compliance" },
]

const mainLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/api-docs" },
  { label: "Contact", href: "/contact" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950 py-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <Image 
                src="/images/symbolwhite.png" 
                alt="Obscura Labs" 
                width={24} 
                height={24} 
                className="group-hover:scale-110 transition-transform duration-300" 
              />
              <span className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
                OBSCURA LABS
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Identity exposure intelligence platform providing real-time threat data to security teams and researchers.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {mainLinks.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {mainLinks.slice(3, 6).map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-400">
              © {new Date().getFullYear()} Obscura Labs LLC. Identity threat intelligence platform.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="mailto:contact@obscuralabs.io"
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200"
              >
                contact@obscuralabs.io
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
