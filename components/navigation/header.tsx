"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navItems = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/api-docs" },
  { label: "Contact", href: "/contact" },
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-neutral-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <Image 
              src="/images/symbolwhite.png" 
              alt="Obscura Labs" 
              width={32} 
              height={32} 
              priority 
              className="group-hover:scale-110 transition-transform duration-300" 
            />
            <span className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">
              OBSCURA LABS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button 
              variant="outline"
              size="sm"
              className="border border-white/20 hover:border-white/40 text-white hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] group overflow-hidden"
              onClick={() => router.push('/login')}
            >
              <span className="relative z-10">Access Dashboard</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium py-2 px-3 rounded transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-white bg-white/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button 
                variant="outline"
                size="sm"
                className="border border-white/20 hover:border-white/40 text-white hover:bg-white/10 transition-all duration-500 mt-2"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  router.push('/login')
                }}
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
