'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ConfirmPage() {
  const [message, setMessage] = useState('Confirming your email...')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setMessage('Confirmation failed. Please try again.')
        return
      }

      if (session) {
        setMessage('Email confirmed! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // Check URL for token hash (Supabase sends it in hash)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          setMessage('Email confirmed! Redirecting to dashboard...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          setMessage('Email confirmed! You can now sign in.')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      }
    }

    handleEmailConfirmation()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-semibold mb-2">{message}</h1>
      </div>
    </div>
  )
}