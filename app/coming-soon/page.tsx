"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the Globe component to avoid SSR issues
const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
})

export default function ComingSoon() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const globeConfig = {
    pointSize: 2,
    globeColor: "#1a1a1a",
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.05,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.1)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 2,
    autoRotate: true,
    autoRotateSpeed: 0.3,
  }

  // Minimal sample data for the globe
  const sampleArcs = [
    {
      order: 1,
      startLat: 40.7128,
      startLng: -74.006,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.1,
      color: "#ffffff",
    },
    {
      order: 2,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.2,
      color: "#ffffff",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Globe */}
      {mounted && (
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full">
            <World data={sampleArcs} globeConfig={globeConfig} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-md mx-auto">
        <div className="space-y-6">
          {/* Obscura Labs Logo/Title */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold font-mono tracking-wider glitch" data-text="OBSCURA LABS">
              OBSCURA LABS
            </h1>
            <div className="w-16 h-1 bg-white mx-auto"></div>
          </div>

          {/* Coming Soon Message */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-mono font-light tracking-wide">
              COMING SOON
            </h2>
            <p className="text-lg md:text-xl font-mono text-gray-300 leading-relaxed">
              Obscura Labs is currently operating in private mode.
            </p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="status-indicator status-processing"></div>
            <span className="text-sm font-mono text-gray-400 tracking-wide">
              SYSTEM STATUS: RESTRICTED ACCESS
            </span>
          </div>
        </div>
      </div>

      {/* Tactical Grid Overlay */}
      <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none"></div>
    </div>
  )
} 