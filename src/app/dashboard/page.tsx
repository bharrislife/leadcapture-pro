'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Event {
  id: number
  name: string
  date: string
  created_at: string
}

interface Lead {
  id: number
  event_id: number
  name: string
  company: string
  email: string
  phone: string
  notes: string
  scanned_at: string
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
  const [newEventName, setNewEventName] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      loadData()
    }
    checkAuth()
  }, [])

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Load events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (eventsData) {
      setEvents(eventsData)
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0].id)
      }
    }

    // Load leads
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .order('scanned_at', { ascending: false })

    if (leadsData) {
      setLeads(leadsData)
    }

    setLoading(false)
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !newEventName.trim()) return

    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: session.user.id,
        name: newEventName,
      })
      .select()
      .single()

    if (!error && data) {
      setEvents([data, ...events])
      setSelectedEvent(data.id)
      setNewEventName('')
    }
  }

  const exportLeads = (format: 'csv' | 'excel') => {
    const eventLeads = selectedEvent 
      ? leads.filter(l => l.event_id === selectedEvent)
      : leads

    if (format === 'csv') {
      const csv = [
        ['Name', 'Company', 'Email', 'Phone', 'Notes', 'Scanned At'],
        ...eventLeads.map(l => [l.name, l.company, l.email, l.phone, l.notes, l.scanned_at])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-${selectedEvent}.csv`
      a.click()
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const eventLeads = selectedEvent 
    ? leads.filter(l => l.event_id === selectedEvent)
    : []

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button onClick={signOut} className="text-gray-600 hover:text-gray-900">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Events Sidebar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            
            <form onSubmit={createEvent} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New event name"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  +
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedEvent === event.id 
                      ? 'bg-blue-100 border-blue-500 border' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-gray-500">
                    {eventLeads.filter(l => l.event_id === event.id).length} leads
                  </div>
                </button>
              ))}
              
              {events.length === 0 && (
                <p className="text-gray-500 text-sm">No events yet. Create one to get started!</p>
              )}
            </div>
          </div>

          {/* Leads Table */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedEvent 
                  ? `Leads (${eventLeads.length})`
                  : 'Leads'}
              </h2>
              {eventLeads.length > 0 && (
                <button
                  onClick={() => exportLeads('csv')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Export CSV
                </button>
              )}
            </div>

            {eventLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Company</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventLeads.map(lead => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{lead.name}</td>
                        <td className="p-2">{lead.company}</td>
                        <td className="p-2">{lead.email}</td>
                        <td className="p-2">{lead.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">
                {selectedEvent 
                  ? 'No leads yet. Use /scan to capture leads for this event.'
                  : 'Select an event to view leads.'}
              </p>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium mb-2">Scan QR Codes:</p>
              <a href="/scan" className="text-blue-600 hover:underline font-medium">
                Go to Scanner →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}