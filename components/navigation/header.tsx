"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

const navItems = [
  { label: "Platform", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Documentation", href: "/api-docs" },
  { label: "Contact", href: "/contact" },
]

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "menu" && (
        <path d="M1 4h14v1H1V4zm0 4h14v1H1V8zm0 4h14v1H1v-1z" fillRule="evenodd" />
      )}
      {icon === "cross" && (
        <path d="M8.7 8l3.15-3.15-.7-.7L8 7.29 4.85 4.15l-.7.7L7.29 8l-3.14 3.15.7.7L8 8.71l3.15 3.14.7-.7L8.71 8z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
    </svg>
  )
}

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className={`mx-auto max-w-7xl rounded-xl transition-all duration-500 ${
            isScrolled 
              ? 'bg-[#f7f6f3]/80 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-[#e9ecef]/60' 
              : 'bg-transparent border border-transparent'
          }`}
        >
          <div className="px-4 sm:px-6">
            <nav className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-3 group">
                <Image 
                  src="/images/symbol.svg" 
                  alt="Obscura Labs" 
                  width={34} 
                  height={34} 
                  priority 
                  className="opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="text-[17px] font-medium text-[#1c1c1c] tracking-tight">
                  Obscura Labs
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`pltr-link ${
                      pathname === item.href ? 'text-[#e07a4a]' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className="pltr-btn-primary hidden sm:flex items-center gap-1.5"
                >
                  Get Started
                  <BlueprintIcon icon="arrow-top-right" size={14} />
                </button>
                
                <button
                  className={`pltr-btn-icon lg:hidden ${!isScrolled ? 'bg-white/40 border-[#dee2e6]/40' : ''}`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <BlueprintIcon icon="cross" size={16} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <BlueprintIcon icon="menu" size={16} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </nav>
          </div>
        </motion.header>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#f7f6f3]/98 backdrop-blur-2xl"
            />
            
            <div className="relative h-full overflow-y-auto pt-24">
              <div className="px-6 py-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="pltr-label mb-6">Navigation</h3>
                    <ul className="space-y-4">
                      {navItems.map((item, index) => (
                        <motion.li
                          key={item.href}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={`block text-2xl font-light transition-colors hover:text-[#e07a4a] ${
                              pathname === item.href ? 'text-[#e07a4a]' : 'text-[#1c1c1c]'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 border-t border-[#e9ecef]">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push('/login')
                      }}
                      className="pltr-btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                    >
                      Get Started
                      <BlueprintIcon icon="arrow-top-right" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
