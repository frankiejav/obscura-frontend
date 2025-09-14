"use client"

import { useState } from "react"
import Header from "@/components/navigation/header"
import Footer from "@/components/navigation/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, TrendingUp, Shield, Users, Calendar, Clock, ArrowRight, BookOpen, AlertTriangle } from "lucide-react"
import Link from "next/link"

// This would normally come from Contentful CMS
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
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Blog & Research
          </h1>
          <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto">
            Intelligence updates, breach analyses, methodology notes, and real-world case studies 
            from the frontlines of identity security.
          </p>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-16 px-4 sm:px-6 bg-neutral-950">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="blog" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-neutral-900 mb-12">
              <TabsTrigger value="blog" className="text-white data-[state=active]:bg-neutral-700">
                <FileText className="h-4 w-4 mr-2" />
                Latest Posts
              </TabsTrigger>
              <TabsTrigger value="cases" className="text-white data-[state=active]:bg-neutral-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Case Studies
              </TabsTrigger>
            </TabsList>

            {/* Blog Posts Tab */}
            <TabsContent value="blog" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {blogPosts.map((post) => (
                    <Card key={post.id} className="bg-neutral-900/60 border-white/10 hover:border-white/20 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="border-white/20 text-white">
                            {post.category}
                          </Badge>
                          <span className="text-sm text-neutral-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-neutral-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <CardTitle className="text-xl text-white hover:text-white/80 transition-colors cursor-pointer">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-neutral-300 mt-2">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10">
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Contentful Integration Note */}
                  <Card className="bg-neutral-900/60 border-white/10">
                    <CardContent className="p-8 text-center">
                      <AlertTriangle className="h-8 w-8 text-white/60 mx-auto mb-4" />
                      <p className="text-neutral-300">
                        Blog content is managed through Contentful CMS. 
                        Additional posts will appear here once the integration is configured.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Topics */}
                  <Card className="bg-neutral-900/60 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Research Topics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {researchTopics.map((topic, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-neutral-300 hover:text-white cursor-pointer transition-colors">
                              {topic.name}
                            </span>
                            <span className="text-xs text-neutral-500">({topic.count})</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Newsletter */}
                  <Card className="bg-neutral-900/60 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">Intelligence Updates</CardTitle>
                      <CardDescription className="text-neutral-300">
                        Get weekly threat intelligence delivered to your inbox
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-white text-black hover:bg-neutral-200">
                        Subscribe
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Case Studies Tab */}
            <TabsContent value="cases" className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {caseStudies.map((study, index) => (
                  <Card key={study.id} className="bg-neutral-900/60 border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl text-white mb-2">
                            {study.title}
                          </CardTitle>
                          <Badge variant="outline" className="border-white/20 text-white">
                            {study.industry}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Challenge</h3>
                          <p className="text-neutral-300">{study.challenge}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-3">Solution</h3>
                          <p className="text-neutral-300">{study.solution}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Results</h3>
                        <ul className="space-y-2">
                          {study.results.map((result, resultIndex) => (
                            <li key={resultIndex} className="flex items-start gap-3">
                              <TrendingUp className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-neutral-300">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-neutral-800/50 rounded-lg p-6">
                        <p className="text-lg text-white/90 italic mb-3">"{study.quote}"</p>
                        <p className="text-sm text-neutral-400">— {study.quotee}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA for Case Studies */}
              <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-white/20">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Have a Success Story to Share?
                  </h3>
                  <p className="text-neutral-300 mb-6">
                    We'd love to feature how your organization uses Obscura Labs to combat identity threats.
                  </p>
                  <Button className="bg-white text-black hover:bg-neutral-200">
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  )
}
