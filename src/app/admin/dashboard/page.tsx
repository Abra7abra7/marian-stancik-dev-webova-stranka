"use client";

import { useEffect, useState } from 'react';
import { User, Mail, Calendar, Search, RefreshCw, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Lead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    interest?: string;
    status?: string;
    ai_analysis?: {
        status: 'qualified' | 'disqualified';
        reason: string;
    };
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const checkAuth = async (pwd: string) => {
        setIsLoading(true);
        try {
            // Test the key by trying to fetch
            const res = await fetch(`/api/admin/leads?key=${pwd}`);
            if (res.ok) {
                setIsAuthenticated(true);
                const data = await res.json();
                setLeads(data.leads || []);
                localStorage.setItem("admin_key", pwd);
            } else {
                setError("Invalid Password");
            }
        } catch (e) {
            setError("Connection Failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        checkAuth(password);
    };

    // Auto-login if key is saved
    useEffect(() => {
        const savedKey = localStorage.getItem("admin_key");
        if (savedKey) {
            checkAuth(savedKey);
            setPassword(savedKey);
        }
    }, []);

    const refreshLeads = () => {
        checkAuth(password);
    };

    const qualifyLead = async (leadId: string) => {
        // Optimistic UI update
        setLeads(current => current.map(l => l.id === leadId ? { ...l, status: 'processing' as any } : l));

        try {
            const res = await fetch(`/api/admin/qualify?key=${password}`, {
                method: 'POST',
                body: JSON.stringify({ leadId }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.success && data.result) {
                setLeads(current => current.map(l =>
                    l.id === leadId ? {
                        ...l,
                        status: data.result.status,
                        ai_analysis: data.result
                    } : l
                ));
            } else {
                refreshLeads();
            }
        } catch (e) {
            console.error("Qualify failed", e);
            refreshLeads();
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-2xl border border-slate-800">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                            <Lock className="h-6 w-6 text-slate-400" />
                        </div>
                        <h2 className="mt-6 text-3xl font-bold text-white">Admin Access</h2>
                        <p className="mt-2 text-sm text-slate-400">Enter your internal dashboard key</p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Admin Password"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? "Checking..." : "Enter Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <nav className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-indigo-500" />
                            <span className="font-bold text-xl">Marian AI Admin</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={refreshLeads}
                                disabled={isLoading}
                                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("admin_key");
                                    setIsAuthenticated(false);
                                }}
                                className="text-sm text-slate-400 hover:text-white"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-slate-900 overflow-hidden rounded-xl border border-slate-800 p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <User className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-slate-500 truncate">Total Leads</dt>
                                    <dd className="text-lg font-bold text-white">{leads.length}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">Recent Inquiries</h3>
                        {/* Search could go here */}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-950/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Interest / Message</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-900 divide-y divide-slate-800">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                            <div className="text-xs text-slate-600">{new Date(lead.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-white">{lead.name || 'Unknown'}</div>
                                                    <div className="text-sm text-indigo-400">{lead.email}</div>
                                                    {lead.phone && <div className="text-xs text-slate-500">{lead.phone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-300 max-w-xs truncate">{lead.interest || '-'}</div>
                                            {lead.company && <div className="text-xs text-slate-500 font-medium">{lead.company}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${lead.status === 'qualified' ? 'bg-green-100 text-green-800' : ''}
                                                ${lead.status === 'disqualified' ? 'bg-red-100 text-red-800' : ''}
                                                ${lead.status === 'new' || !lead.status ? 'bg-blue-100 text-blue-800' : ''}
                                                ${lead.status === 'processing' ? 'bg-gray-100 text-gray-800 animate-pulse' : ''}
                                            `}>
                                                {lead.status === 'processing' ? 'AI Thinking...' : (lead.status || 'New')}
                                            </span>
                                            {lead.ai_analysis && (
                                                <div className="mt-1 text-xs text-slate-500 max-w-[200px] whitespace-normal">
                                                    {lead.ai_analysis.reason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => qualifyLead(lead.id)}
                                                className="text-indigo-400 hover:text-indigo-300 mr-4 flex items-center gap-1 inline-flex"
                                                title="Auto-Qualify with AI"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                <span className="hidden sm:inline">AI Qualify</span>
                                            </button>
                                            <a href={`mailto:${lead.email}`} className="text-slate-400 hover:text-white">Email</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
