import Image from "next/image"

export default function ComingSoon() {

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Content */}
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="border border-white/20 bg-card/30 p-12 rounded-lg min-h-[625px] flex flex-col justify-center">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Image src="/images/symbolwhite.png" alt="Obscura Labs" width={64} height={64} className="opacity-90" priority />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-primary mb-8 tracking-tight leading-tight">
                OBSCURA LABS
                <br />
                <span className="text-muted-foreground">COMING SOON</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Obscura Labs is currently operating in private mode.
              </p>
              
              {/* Status Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-8">
                <div className="status-indicator status-processing"></div>
                <span className="text-sm font-mono text-muted-foreground tracking-wide">
                  SYSTEM STATUS: RESTRICTED ACCESS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 