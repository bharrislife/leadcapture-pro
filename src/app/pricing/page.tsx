'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
    }
    checkAuth()
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Failed to create checkout session')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Get Started with LeadCapture Pro</h1>
        <p className="text-xl text-gray-600 mb-8">
          Start capturing leads at your next trade show
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
          <div className="text-5xl font-bold mb-2">$599</div>
          <div className="text-gray-500 mb-6">per year</div>

          <ul className="text-left space-y-3 mb-8">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Unlimited leads at every trade show
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              QR code scanning with instant capture
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Export to CRM or spreadsheet
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Works offline at exhibition halls
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              No per-scan fees, ever
            </li>
          </ul>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>

          <p className="mt-4 text-sm text-gray-500">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

        <div className="mt-8">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}