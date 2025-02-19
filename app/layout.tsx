import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AudioAnalyzerProvider } from "@/components/audio-analyzer"

const inter = Inter({ subsets: ["latin"] })
const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
})

export const metadata: Metadata = {
  title: "terminals // digital worlds",
  description: "decentralized world computer",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            function updateViewportUnits() {
              let vh = window.innerHeight * 0.01;
              let vw = window.innerWidth * 0.01;
              document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
              document.documentElement.style.setProperty('--viewport-width', window.innerWidth + 'px');
            }
            window.addEventListener('resize', updateViewportUnits);
            window.addEventListener('orientationchange', updateViewportUnits);
            updateViewportUnits();
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="terminals-theme"
          disableTransitionOnChange={false}
        >
          <AudioAnalyzerProvider>
            <div className="transition-colors duration-300">
              {children}
            </div>
          </AudioAnalyzerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}