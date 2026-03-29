'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Event {
  id: number
  name: string
}

export default function ScanPage() {
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState<any>(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: ''
    });

    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            
            // Load user's events
            const { data: eventsData } = await supabase
                .from('events')
                .select('id, name')
                .order('name');
            
            if (eventsData && eventsData.length > 0) {
                setEvents(eventsData);
                setSelectedEvent(eventsData[0].id);
            }
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                false
            );

            scanner.render(onScanSuccess, onScanError);

            return () => {
                scanner.clear();
            };
        }
    }, [scanning]);

    const onScanSuccess = async (decodedText: string) => {
        const contact = parseVCard(decodedText);

        if (contact) {
            await saveLead(contact);
            setLastScan(contact);
            setScanning(false);
            setTimeout(() => setScanning(true), 2000);
        }
    };

    const onScanError = (err: any) => {
        // Ignore errors
    };

    const parseVCard = (vcard: string) => {
        try {
            const lines = vcard.split('\n');
            const contact: any = {};

            lines.forEach(line => {
                if (line.startsWith('FN:')) contact.name = line.substring(3).trim();
                if (line.startsWith('ORG:')) contact.company = line.substring(4).trim();
                if (line.startsWith('EMAIL:')) contact.email = line.substring(6).trim();
                if (line.startsWith('TEL:')) contact.phone = line.substring(4).trim();
            });

            return contact.name ? contact : null;
        } catch {
            return null;
        }
    };

    const saveLead = async (contact: any) => {
        if (!selectedEvent) return;

        const { error } = await supabase
            .from('leads')
            .insert({
                name: contact.name,
                company: contact.company || '',
                email: contact.email || '',
                phone: contact.phone || '',
                notes: contact.notes || '',
                event_id: selectedEvent,
                scanned_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error saving lead:', error);
        }
    };

    const handleManualSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) {
            alert('Please select an event first');
            return;
        }
        await saveLead(formData);
        setLastScan(formData);
        setFormData({ name: '', company: '', email: '', phone: '', notes: '' });
        setManualEntry(false);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Scan Badges</h1>
                    <a href="/dashboard" className="text-blue-600 hover:underline text-sm">
                        Dashboard
                    </a>
                </div>

                {/* Event Selector */}
                {events.length > 0 ? (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Event</label>
                        <select
                            value={selectedEvent || ''}
                            onChange={(e) => setSelectedEvent(Number(e.target.value))}
                            className="w-full p-3 border rounded-lg bg-white"
                        >
                            {events.map(event => (
                                <option key={event.id} value={event.id}>
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">
                            No events yet.{' '}
                            <a href="/dashboard" className="underline font-medium">
                                Create one in Dashboard
                            </a>
                        </p>
                    </div>
                )}

                {/* Scanner Toggle */}
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => { setScanning(!scanning); setManualEntry(false); }}
                        disabled={!selectedEvent}
                        className={`flex-1 py-3 rounded-lg font-medium ${scanning
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button>

                    <button
                        onClick={() => { setManualEntry(!manualEntry); setScanning(false); }}
                        disabled={!selectedEvent}
                        className="flex-1 py-3 rounded-lg font-medium bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Manual Entry
                    </button>
                </div>

                {/* QR Scanner */}
                {scanning && (
                    <div className="bg-white rounded-lg p-4 mb-4">
                        <div id="qr-reader"></div>
                    </div>
                )}

                {/* Manual Entry Form */}
                {manualEntry && (
                    <div className="bg-white rounded-lg p-6 mb-4">
                        <h2 className="text-lg font-semibold mb-4">Enter Contact Info</h2>
                        <form onSubmit={handleManualSave} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Name *"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                            />
                            <textarea
                                placeholder="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full p-3 border rounded-lg"
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
                            >
                                Save Lead
                            </button>
                        </form>
                    </div>
                )}

                {/* Last Scanned */}
                {lastScan && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">✓</span>
                            <span className="font-semibold text-green-800">Lead Captured!</span>
                        </div>
                        <div className="text-sm text-gray-700">
                            <p><strong>{lastScan.name}</strong></p>
                            {lastScan.company && <p>{lastScan.company}</p>}
                            {lastScan.email && <p>{lastScan.email}</p>}
                            {lastScan.phone && <p>{lastScan.phone}</p>}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!scanning && !manualEntry && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
                        <p className="font-semibold mb-2">How to use:</p>
                        <ol className="list-decimal ml-4 space-y-1">
                            <li>Select an event above</li>
                            <li>Click "Start Scanning" to use camera</li>
                            <li>Point at QR code on attendee badge</li>
                            <li>Contact info saves automatically</li>
                            <li>Or use "Manual Entry" if no QR code</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}