import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"


export const metadata: Metadata = {
  title: "Prism Insight Dashboard",
  description: "AI Agent-based Korean Stock Analysis & Trading System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Hedvig+Letters+Serif&display=swap" />
        <style>{`:root{--font-geist:'Geist',system-ui,sans-serif;--font-geist-mono:'Geist Mono',ui-monospace,monospace;--font-hedvig:'Hedvig Letters Serif',Georgia,serif}`}</style>
        <script src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + "/sync-shim.js"} />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
