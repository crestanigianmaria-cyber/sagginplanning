import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Space_Grotesk, Inter } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Saggin Planning',
  description: 'Gestione planning trasporti',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-[#0E0F11] text-[#F5F5F4]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
