"use client"

import Image from "next/image"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
    </svg>
  )
}

const footerSections = {
  platform: {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/login" },
      { label: "API Documentation", href: "/api-docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Status", href: "/status" },
    ]
  },
  solutions: {
    title: "Solutions",
    links: [
      { label: "Enterprise Security", href: "/enterprise" },
      { label: "Threat Intelligence", href: "/threat-intelligence" },
      { label: "Identity Monitoring", href: "/monitoring" },
      { label: "Compliance", href: "/compliance" },
    ]
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ]
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie Policy", href: "/cookies" },
    ]
  }
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[#f7f6f3] border-t border-[#e9ecef]/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <Image 
                src="/images/symbol.svg" 
                alt="Obscura Labs" 
                width={26} 
                height={26}
                className="opacity-80"
              />
              <span className="text-[15px] font-medium text-[#1c1c1c] tracking-tight">
                Obscura Labs
              </span>
            </Link>
            
            <p className="text-[#868e96] text-sm leading-relaxed max-w-xs mb-6">
              Identity threat intelligence platform for security teams, researchers, and law enforcement.
            </p>

            <div className="flex items-center gap-3">
              <a 
                href="https://github.com/obscuralabs"
                target="_blank"
                rel="noopener noreferrer"
                className="pltr-btn-secondary !px-4 !py-2 text-xs"
              >
                GITHUB
              </a>
              <a 
                href="https://linkedin.com/company/obscuralabs"
                target="_blank"
                rel="noopener noreferrer"
                className="pltr-btn-secondary !px-4 !py-2 text-xs"
              >
                LINKEDIN
              </a>
            </div>
          </div>

          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-[#adb5bd] text-[10px] uppercase tracking-wider mb-4 font-medium">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="text-sm text-[#5a5a5a] hover:text-[#e07a4a] transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <BlueprintIcon icon="arrow-top-right" size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-[#e9ecef]/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#adb5bd]">
            {currentYear} Obscura Labs LLC
          </p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="text-xs text-[#adb5bd] hover:text-[#5a5a5a] transition-colors duration-200">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-[#adb5bd] hover:text-[#5a5a5a] transition-colors duration-200">
              Terms
            </Link>
            <Link href="/cookies" className="text-xs text-[#adb5bd] hover:text-[#5a5a5a] transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
