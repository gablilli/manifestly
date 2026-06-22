import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Foldaa — Turn Framer sites into installable PWAs',
  description: 'Foldaa bridges Framer and Progressive Web Apps — no code required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} antialiased bg-[#0d0d0d] text-[#f0f0f0]`}>
        {children}
      </body>
    </html>
  )
}
