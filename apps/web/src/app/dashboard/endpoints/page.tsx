'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Halaman katalog endpoint udah dipindah ke /models (peer page sama /docs & /playground).
export default function DashboardEndpointsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/models') }, [router])
  return null
}
