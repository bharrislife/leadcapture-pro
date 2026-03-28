'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function ScanPage() {
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState<any>(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: ''
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
        // Parse vCard format
        const contact = parseVCard(decodedText);

        if (contact) {
            await saveLead(contact);
            setLastScan(contact);

            // Stop scanning briefly to show success
            setScanning(false);
            setTimeout(() => setScanning(true), 2000);
        }
    };

    const onScanError = (err: any) => {
        // Ignore errors (camera permission, bad scans, etc)
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
        const { error } = await supabase
            .from('leads')
            .insert({
                name: contact.name,
                company: contact.company || '',
                email: contact.email || '',
                phone: contact.phone || '',
                notes: contact.notes || '',
                event_id: 1, // TODO: Get from current event
                scanned_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error saving lead:', error);
        }
    };

    const handleManualSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveLead(formData);
        setLastScan(formData);
        setFormData({ name: '', company: '', email: '', phone: '', notes: '' });
        setManualEntry(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6">Scan Badges</h1>

                {/* Scanner Toggle */}
                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => { setScanning(!scanning); setManualEntry(false); }}
                        className={`flex-1 py-3 rounded-lg font-medium ${scanning
                                ? 'bg-red-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                    >
                        {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button>

                    <button
                        onClick={() => { setManualEntry(!manualEntry); setScanning(false); }}
                        className="flex-1 py-3 rounded-lg font-medium bg-gray-600 text-white"
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
