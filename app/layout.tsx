import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ระบบคำนวณ OT พนักงาน',
  description: 'ระบบคำนวณชั่วโมง OT อัตโนมัติสำหรับโรงงาน',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={sarabun.className}>{children}</body>
    </html>
  )
}
