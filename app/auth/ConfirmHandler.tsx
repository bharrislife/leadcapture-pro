'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ConfirmHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleConfirmation = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error === 'access_denied') {
        // Link expired - redirect to login
        router.replace('/login?expired=true')
        return
      }

      if (code) {
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!exchangeError && data.session) {
          router.replace('/dashboard')
        } else {
          router.replace('/login?error=confirmation_failed')
        }
      }
    }

    handleConfirmation()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="text-xl font-semibold">Confirming your email...</h1>
      </div>
    </div>
  )
}