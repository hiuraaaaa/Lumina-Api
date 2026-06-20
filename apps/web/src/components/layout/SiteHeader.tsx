'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

// Homepage punya nav custom sendiri (lihat app/page.tsx), jadi
// Navbar global di-skip di situ biar gak dobel.
export default function SiteHeader() {
  const pathname = usePathname()
  if (pathname === '/') return null
  return <Navbar />
}

