"use client"

import { useState } from "react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { motion } from "motion/react"
import Link from "next/link"

function BlueprintIcon({ icon, size = 16, className = "" }: { icon: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      {icon === "document" && (
        <path d="M9 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5L9 0zm3 14H4V2h4v4h4v8zM8 5V1l4 4H8z" fillRule="evenodd" />
      )}
      {icon === "book" && (
        <path d="M2 1v14h1V8h3V7H3V1H2zm5 0c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H7zm1 3h6V3H8v1zm6 2H8v1h6V6zm0 2H8v1h6V8zm-3 3H8v-1h3v1z" fillRule="evenodd" />
      )}
      {icon === "calendar" && (
        <path d="M11 3V1h-1v2H6V1H5v2H3c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1h-2zm2 10H3V7h10v6zm0-7H3V4h10v2z" fillRule="evenodd" />
      )}
      {icon === "time" && (
        <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-6.41V4H7v4c0 .28.11.53.29.71l2.5 2.5 1.41-1.41L9 7.59z" fillRule="evenodd" />
      )}
      {icon === "arrow-right" && (
        <path d="M10.71 7.29l-4-4-.71.71L9.59 7.5H1v1h8.59L6 12l.71.71 4-4a.5.5 0 0 0 0-.71z" fillRule="evenodd" />
      )}
      {icon === "trending" && (
        <path d="M10 4h5v5l-1.71-1.71-5 5L5 9l-4 4-.71-.71L5 7.59l3.29 3.29 5-5L10 4z" fillRule="evenodd" />
      )}
      {icon === "warning" && (
        <path d="M15.84 13.5l.01-.01-7-12-.01.01c-.17-.3-.48-.5-.84-.5s-.67.2-.84.5l-.01-.01-7 12 .01.01c-.1.15-.16.31-.16.5 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-.19-.06-.35-.16-.5zM8 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-3H7V6h2v4z" fillRule="evenodd" />
      )}
      {icon === "arrow-top-right" && (
        <path d="M5 3h8v8l-1-1V4.41L4.41 12l-.7-.71L11.29 4H6L5 3z" fillRule="evenodd" />
      )}
    </svg>
  )
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const blogPosts = [
  {
    id: 1,
    title: "Exposing Hidden Identities: Leveraging Infostealer Logs to Track CSAM Consumers",
    excerpt: "Infostealer logs reveal digital footprints that can unmask individuals consuming CSAM. By analyzing exposed credentials and session data, investigators can link activity back to real identities.",
    category: "Law Enforcement",
    date: "2024-12-18",
    readTime: "15 min read",
    author: "Digital Forensics Team",
    tags: ["Law Enforcement", "CSAM Investigation", "Infostealers", "Digital Forensics"]
  },
  {
    id: 2,
    title: "Weaponized .gov Emails: Fraudulent EDRs Traced Through Compromised Accounts",
    excerpt: "Attackers exploit stolen government email accounts to distribute fraudulent EDRs. Infostealer-sourced credentials expose how these trusted domains are leveraged in targeted campaigns.",
    category: "Threat Intelligence",
    date: "2024-12-15",
    readTime: "12 min read",
    author: "Threat Intelligence Unit",
    tags: ["EDR Fraud", "Government Compromise", "Infostealers", "Social Engineering"]
  },
  {
    id: 3,
    title: "The Evolution of Session Hijacking Attacks",
    excerpt: "Deep dive into modern session hijacking techniques and how threat actors are bypassing MFA through cookie theft from stealer logs.",
    category: "Analysis",
    date: "2024-12-10",
    readTime: "8 min read",
    author: "Dr. Sarah Chen",
    tags: ["Session Security", "MFA Bypass", "Authentication", "Cookie Theft"]
  },
  {
    id: 4,
    title: "Ransomware Data Leaks: A Growing Threat",
    excerpt: "Understanding the dual extortion model and how ransomware groups are weaponizing stolen data for maximum impact.",
    category: "Threat Research",
    date: "2024-12-05",
    readTime: "10 min read",
    author: "Incident Response Team",
    tags: ["Ransomware", "Data Leaks", "Incident Response"]
  }
]

const caseStudies = [
  {
    id: 1,
    title: "Fortune 500 Financial Services",
    industry: "Financial Services",
    challenge: "Preventing account takeover across 50,000+ employees",
    solution: "Implemented real-time credential monitoring and automated response workflows",
    results: [
      "70% reduction in account takeover incidents",
      "Average detection time reduced from days to minutes",
      "Prevented $2.3M in potential fraud losses"
    ],
    quote: "Obscura Labs helped us identify and remediate exposed credentials before attackers could exploit them.",
    quotee: "CISO, Major Bank"
  },
  {
    id: 2,
    title: "Global Healthcare Provider",
    industry: "Healthcare",
    challenge: "Protecting patient data and healthcare worker credentials",
    solution: "Deployed domain-wide monitoring with priority alerting for high-risk accounts",
    results: [
      "Identified 1,200+ compromised credentials in first month",
      "100% of exposed accounts secured within 24 hours",
      "Achieved HIPAA compliance for credential management"
    ],
    quote: "The platform's ability to detect healthcare-specific breaches has been invaluable for our security program.",
    quotee: "Security Director, Healthcare Network"
  },
  {
    id: 3,
    title: "Law Enforcement Cybercrime Unit",
    industry: "Law Enforcement",
    challenge: "Investigating identity theft ring targeting elderly victims",
    solution: "Leveraged breach data to trace stolen identities and build case evidence",
    results: [
      "Identified 500+ victim identities",
      "Led to arrest of 12 suspects",
      "Recovered $1.5M in stolen funds"
    ],
    quote: "Obscura Labs provided critical intelligence that helped us dismantle a major identity theft operation.",
    quotee: "Detective, Cybercrime Division"
  }
]

const researchTopics = [
  { name: "Infostealer Analysis", count: 28 },
  { name: "Law Enforcement", count: 22 },
  { name: "Threat Intelligence", count: 18 },
  { name: "Digital Forensics", count: 16 },
  { name: "Government Security", count: 14 },
  { name: "Credential Theft", count: 20 },
  { name: "Session Hijacking", count: 12 },
  { name: "OSINT Investigations", count: 10 }
]

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<'blog' | 'cases'>('blog')

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <Header />

      <section className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="pltr-label mb-5"
            >
              INSIGHTS
            </motion.p>
            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[32px] sm:text-[40px] lg:text-[52px] font-light text-[#1c1c1c] leading-[1.08] tracking-[-0.03em] mb-5"
            >
              Blog & Research
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-[#5a5a5a] text-base sm:text-lg max-w-2xl"
            >
              Intelligence updates, breach analyses, methodology notes, and real-world case studies from the frontlines of identity security.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pltr-section py-12 px-6 lg:px-8 bg-[#ffffff] pltr-grain">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 mb-12">
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'blog'
                  ? 'bg-[#1c1c1c] text-white'
                  : 'bg-[#f7f6f3] text-[#5a5a5a] hover:text-[#1c1c1c]'
              }`}
            >
              <BlueprintIcon icon="document" size={14} />
              Latest Posts
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                activeTab === 'cases'
                  ? 'bg-[#1c1c1c] text-white'
                  : 'bg-[#f7f6f3] text-[#5a5a5a] hover:text-[#1c1c1c]'
              }`}
            >
              <BlueprintIcon icon="book" size={14} />
              Case Studies
            </button>
          </div>

          {activeTab === 'blog' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {blogPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
                    className="border border-[#e9ecef] rounded-lg p-6 lg:p-8 bg-white hover:border-[#dee2e6] transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 text-xs font-medium text-[#e07a4a] bg-[#e07a4a]/10 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-[#adb5bd] flex items-center gap-1">
                        <BlueprintIcon icon="calendar" size={12} />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-[#adb5bd] flex items-center gap-1">
                        <BlueprintIcon icon="time" size={12} />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-[#1c1c1c] mb-3 group-hover:text-[#e07a4a] transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-[#5a5a5a] text-sm leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span key={tagIndex} className="text-xs px-2 py-1 bg-[#f7f6f3] text-[#868e96] rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="text-[#868e96] hover:text-[#e07a4a] transition-colors flex items-center gap-1 text-sm">
                        Read More
                        <BlueprintIcon icon="arrow-right" size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  className="border border-[#e9ecef] rounded-lg p-8 bg-[#fafafa] text-center"
                >
                  <BlueprintIcon icon="warning" size={24} className="text-[#adb5bd] mx-auto mb-4" />
                  <p className="text-[#868e96] text-sm">
                    Blog content is managed through Contentful CMS. 
                    Additional posts will appear here once the integration is configured.
                  </p>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  className="border border-[#e9ecef] rounded-lg p-6 bg-white"
                >
                  <h3 className="text-base font-medium text-[#1c1c1c] mb-4">Research Topics</h3>
                  <div className="space-y-3">
                    {researchTopics.map((topic, index) => (
                      <div key={index} className="flex justify-between items-center group cursor-pointer">
                        <span className="text-sm text-[#5a5a5a] group-hover:text-[#e07a4a] transition-colors">
                          {topic.name}
                        </span>
                        <span className="text-xs text-[#adb5bd]">({topic.count})</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                  className="border border-[#e9ecef] rounded-lg p-6 bg-white"
                >
                  <h3 className="text-base font-medium text-[#1c1c1c] mb-2">Intelligence Updates</h3>
                  <p className="text-[#868e96] text-sm mb-4">
                    Get weekly threat intelligence delivered to your inbox
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pltr-btn-primary w-full py-3 text-sm"
                  >
                    Subscribe
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="space-y-8">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                  className="border border-[#e9ecef] rounded-lg p-8 lg:p-10 bg-white"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-[22px] font-light text-[#1c1c1c] mb-2">
                        {study.title}
                      </h3>
                      <span className="px-3 py-1 text-xs font-medium text-[#e07a4a] bg-[#e07a4a]/10 rounded">
                        {study.industry}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-sm font-medium text-[#1c1c1c] mb-3">Challenge</h4>
                      <p className="text-[#5a5a5a] text-sm leading-relaxed">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#1c1c1c] mb-3">Solution</h4>
                      <p className="text-[#5a5a5a] text-sm leading-relaxed">{study.solution}</p>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-[#1c1c1c] mb-3">Results</h4>
                    <ul className="space-y-2">
                      {study.results.map((result, resultIndex) => (
                        <li key={resultIndex} className="flex items-start gap-3">
                          <BlueprintIcon icon="trending" size={16} className="text-[#e07a4a] mt-0.5 flex-shrink-0" />
                          <span className="text-[#5a5a5a] text-sm">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#f7f6f3] rounded-lg p-6">
                    <p className="text-[#1c1c1c] italic mb-3">"{study.quote}"</p>
                    <p className="text-sm text-[#868e96]">- {study.quotee}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                className="border border-[#e9ecef] rounded-lg p-8 lg:p-10 bg-[#fafafa] text-center"
              >
                <h3 className="text-[22px] font-light text-[#1c1c1c] mb-4">
                  Have a Success Story to Share?
                </h3>
                <p className="text-[#5a5a5a] text-sm mb-6 max-w-lg mx-auto">
                  We'd love to feature how your organization uses Obscura Labs to combat identity threats.
                </p>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pltr-btn-primary px-6 py-3 inline-flex items-center gap-2"
                  >
                    Contact Us
                    <BlueprintIcon icon="arrow-top-right" size={14} />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
