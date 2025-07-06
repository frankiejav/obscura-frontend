"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Shield, Eye, Lock, Target, AlertTriangle, Users, ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the World component with SSR disabled
const World = dynamic(() => import("@/components/ui/globe").then((m) => ({ default: m.World })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground font-mono">LOADING GLOBE...</p>
      </div>
    </div>
  ),
});

// Preload the globe component on mount
const GlobeWithPreload = ({ globeConfig, data }: any) => {
  useEffect(() => {
    // Preload the globe component
    const preloadGlobe = async () => {
      try {
        await import("@/components/ui/globe");
      } catch (error) {
        console.error("Failed to preload globe:", error);
      }
    };
    preloadGlobe();
  }, []);

  return <World globeConfig={globeConfig} data={data} />;
};

export default function LandingPage() {
  const router = useRouter()

  const globeConfig = {
    pointSize: 4,
    globeColor: "#1a1a1a",
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#333333",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#666666",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };

  const colors = ["#ffffff", "#cccccc", "#666666"];
  const sampleArcs = [
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: 28.6139,
      startLng: 77.209,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -1.303396,
      endLng: 36.852443,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: -15.785493,
      startLng: -47.909029,
      endLat: 36.162809,
      endLng: -115.119411,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: -33.8688,
      startLng: 151.2093,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: 21.3099,
      startLng: -157.8581,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: -34.6037,
      startLng: -58.3816,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 14.5995,
      startLng: 120.9842,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -33.8688,
      endLng: 151.2093,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: -15.432563,
      startLng: 28.315853,
      endLat: 1.094136,
      endLng: -63.34546,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: 37.5665,
      startLng: 126.978,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: 48.8566,
      startLng: -2.3522,
      endLat: 52.52,
      endLng: 13.405,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: -8.833221,
      startLng: 13.264837,
      endLat: -33.936138,
      endLng: 18.436529,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: 49.2827,
      startLng: -123.1207,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: 28.6139,
      endLng: 77.209,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: 41.9028,
      startLng: 12.4964,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 1.3521,
      endLng: 103.8198,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 37.7749,
      endLng: -122.4194,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 35.6762,
      startLng: 139.6503,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 14,
      startLat: -33.936138,
      startLng: 18.436529,
      endLat: 21.395643,
      endLng: 39.883798,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
  ];

  const valueStatements = [
    {
      title: "Real-World Threat Detection",
      description: "Parses breach archives and malware logs tied to your verified assets. Timely exposure alerts."
    },
    {
      title: "Data Removal Without Hassle",
      description: "Automated takedowns from broker and people-search sites. Status tracked in-platform."
    },
    {
      title: "Expert-Led Response",
      description: "Concierge support directly from the platform owner—no queue, no offshore agents."
    }
  ]

  const capabilities = [
    {
      title: "Credential & Leak Monitoring",
      description: "Comprehensive sweep of decades of breached credentials and code-sourced malware dumps tied to your emails and domains."
    },
    {
      title: "Network & Infrastructure Scans",
      description: "Periodic audit of verified home/office IPs for open ports, exposed devices, and misconfigurations."
    },
    {
      title: "Personal Identity Score",
      description: "Real-time composite risk score based on exposure volume, velocity, botnet signals, and asset sensitivity."
    },
    {
      title: "Privacy Hardening & VPN",
      description: "Guided device audits and secure VPN setup—reduce privacy leaks from apps, tracking, and metadata."
    }
  ]

  const statistics = [
    { number: "6.5B+", label: "breached credentials analyzed" },
    { number: "Thousands", label: "of credentials extracted weekly from malware dumps" },
    { number: "1 in 3", label: "executives exposed via stealth data resale" },
    { number: "<6 hours", label: "average time from leak to compromise" },
    { number: "20+", label: "saved passwords and live sessions per malware log" }
  ]

  const processSteps = [
    "Verify asset ownership",
    "Monitor breach and leak sources", 
    "Generate threat alerts",
    "Provide remediation & takedown support",
    "Offer ongoing guidance from owner"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={32} height={32} className="opacity-90" />
            <span className="text-lg font-semibold text-primary">OBSCURA LABS</span>
          </div>

        </div>
      </header>

      {/* Hero Section with Globe Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Globe Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4">
            <GlobeWithPreload data={sampleArcs} globeConfig={globeConfig} />
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="border border-transparent bg-card/20 backdrop-blur-sm p-12 rounded-lg min-h-[625px] flex flex-col justify-center">
              <h1 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight leading-tight">
                DIGITAL EXPOSURE PROTECTION
                <br />
                <span className="text-muted-foreground">FOR HNW INDIVIDUALS & EXECUTIVES</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Solo-operated intelligence system delivering continuous breach monitoring, identity security, and white-glove response—without corporate overhead.
              </p>
              <Button 
                size="lg" 
                className="tactical-button px-8 py-4 text-lg font-semibold border-2 border-white/30 hover:border-white/50"
                onClick={() => router.push('/login')}
              >
                REQUEST ACCESS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Statements */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {valueStatements.map((statement, index) => (
              <div key={index} className="text-center border border-white/10 bg-card/20 backdrop-blur-sm p-8 rounded-lg hover:bg-card/30 transition-all duration-300">
                <h3 className="text-xl font-semibold text-primary mb-4">{statement.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{statement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center border-b border-white/20 pb-4">CAPABILITIES</h2>
          <div className="space-y-12">
            {capabilities.map((capability, index) => (
              <div key={index} className="tactical-card p-8 border border-white/20 bg-card/30 backdrop-blur-sm hover:bg-card/40 transition-all duration-300">
                <h3 className="text-xl font-semibold text-primary mb-4">{capability.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center border-b border-white/20 pb-4">THREAT LANDSCAPE</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {statistics.map((stat, index) => (
              <div key={index} className="tactical-card p-6 text-center border border-white/20 bg-card/30 backdrop-blur-sm hover:bg-card/40 transition-all duration-300">
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center border-b border-white/20 pb-4">HOW IT WORKS</h2>
          <div className="border border-white/20 bg-card/30 backdrop-blur-sm p-8 rounded-lg">
            <div className="space-y-6">
              {processSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary/20 border-2 border-white/30 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-muted-foreground text-lg">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Solo Matters */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="tactical-card p-8 border-2 border-white/20 bg-card/30 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-primary mb-6">WHY SOLO MATTERS</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Operated entirely by the platform's creator — no offshoring, no support layers. One trusted expert, one point of accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="border border-white/20 bg-card/30 backdrop-blur-sm p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-primary mb-6">NO PUBLIC SIGNUP</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Access is by invitation only.
            </p>
            <Button 
              size="lg" 
              className="tactical-button px-8 py-4 text-lg font-semibold border-2 border-white/30 hover:border-white/50"
              onClick={() => router.push('/login')}
            >
              REQUEST ACCESS
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Obscura Labs. Digital protection and intelligence platform.
          </p>
        </div>
      </footer>
    </div>
  )
}
