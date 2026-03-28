'use client';

import { useState } from 'react';

export default function ScanPage() {
    const [manualEntry, setManualEntry] = useState(false);
    const [leads, setLeads] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        notes: ''
    });

    const handleManualSave = (e: React.FormEvent) => {
        e.preventDefault();
        setLeads([...leads, { ...formData, timestamp: new Date().toISOString() }]);
        setFormData({ name: '', company: '', email: '', phone: '', notes: '' });
        setManualEntry(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-6">Scan Badges</h1>

                <button
                    onClick={() => setManualEntry(!manualEntry)}
                    className="w-full py-3 rounded-lg font-medium bg-blue-600 text-white mb-4"
                >
                    {manualEntry ? 'Cancel' : 'Add Contact'}
                </button>

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
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
                            >
                                Save Lead
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg p-4">
                    <h2 className="font-semibold mb-3">Captured Leads ({leads.length})</h2>
                    {leads.length === 0 ? (
                        <p className="text-gray-500 text-sm">No leads yet. Add your first contact above.</p>
                    ) : (
                        <div className="space-y-2">
                            {leads.map((lead, i) => (
                                <div key={i} className="border-b pb-2">
                                    <p className="font-medium">{lead.name}</p>
                                    <p className="text-sm text-gray-600">{lead.company}</p>
                                    <p className="text-sm text-gray-600">{lead.email}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}