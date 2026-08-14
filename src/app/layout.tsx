import { config } from "@fortawesome/fontawesome-svg-core"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense, type ReactNode } from "react"

import { AuthGate } from "@/components/auth-gate"
import { Providers } from "@/components/providers"

import "@fortawesome/fontawesome-svg-core/styles.css"
import "./globals.css"

config.autoAddCss = false

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Spin Wallet",
  description: "A high-volume wallet simulation",
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
    <body className="flex min-h-full flex-col bg-background text-foreground">
      <Providers>
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-muted">
              <p role="status">Loading...</p>
            </div>
          }
        >
          <AuthGate>{children}</AuthGate>
        </Suspense>
      </Providers>
    </body>
  </html>
)

export default RootLayout
