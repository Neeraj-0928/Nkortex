"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(false);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            alert("Mock Upload Successful. Internship data synchronized locally.");
            setLoading(false);
        }, 1000);
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-neon-cyan/30">
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto">
                <div className="glass-panel p-8 rounded-3xl border border-white/5">
                    <h1 className="text-3xl font-bold glow-text mb-8">Admin Dashboard</h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Manual Upload Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-neon-purple">Manual Internship Upload</h2>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <input type="text" placeholder="Internship Title" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:glow-border" required />
                                <input type="text" placeholder="Company Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:glow-border" required />
                                <input type="text" placeholder="Location" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:glow-border" required />
                                <textarea placeholder="Description & Skills" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32 focus:outline-none focus:glow-border" required></textarea>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading ? "Processing..." : "Publish to Local Node"}
                                </button>
                            </form>
                        </div>

                        {/* Analytics Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-neon-cyan">System Analytics (Local)</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <p className="text-gray-400 text-sm">Total Queries</p>
                                    <p className="text-2xl font-bold">1,284</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <p className="text-gray-400 text-sm">Match Success</p>
                                    <p className="text-2xl font-bold">92%</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <p className="text-gray-400 text-sm">Local RAM Usage</p>
                                    <p className="text-2xl font-bold">12.4 GB</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                    <p className="text-gray-400 text-sm">Active Models</p>
                                    <p className="text-2xl font-bold">Ollama: Phi</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded-2xl border border-white/10">
                                <h3 className="font-semibold mb-2">Node Status: Running</h3>
                                <p className="text-sm text-gray-300 line-clamp-2">The local AI node is operating optimally. Scheduled cleanup in 4 hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
