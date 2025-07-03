import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background tactical-grid">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center gap-4">
          <Image src="/images/obscura-logo-white.png" alt="Obscura" width={200} height={200} className="opacity-90" />
          <div className="text-center">
            <p className="text-lg text-muted-foreground font-mono tracking-wider mt-2 max-w-2xl">
              PRIVATE INTELLIGENCE OPERATIONS DASHBOARD FOR THREAT MONITORING AND DIGITAL IDENTITY SECURITY
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="status-indicator status-active"></div>
              <span>SYSTEM ONLINE</span>
              <span className="mx-2">|</span>
              <span>UPTIME: 72:14:33</span>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
