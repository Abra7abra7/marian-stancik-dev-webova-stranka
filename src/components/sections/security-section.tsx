"use client";

import { useCallback, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Handle,
    Position,
    MarkerType
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, User, Database, Bot } from 'lucide-react';
import '@xyflow/react/dist/style.css';

// === Custom Nodes ===

const CustomNode = ({ data }: any) => {
    const Icon = data.icon;
    return (
        <div className={`p-4 rounded-xl shadow-xl border-2 bg-slate-900 w-[180px] flex flex-col items-center gap-2 ${data.highlight ? 'border-indigo-500 shadow-indigo-500/20' : 'border-slate-700'}`}>
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data.color}`}>
                {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
            <div className="text-center">
                <div className="font-bold text-white text-sm">{data.label}</div>
                <div className="text-xs text-slate-400">{data.desc}</div>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
};

const SecurityNode = ({ data }: any) => {
    return (
        <div className={`p-4 rounded-xl shadow-xl border-2 w-[220px] flex flex-col items-center gap-2 transition-all duration-300 ${data.status === 'blocked' ? 'bg-red-950/50 border-red-500' : data.status === 'allowed' ? 'bg-emerald-950/50 border-emerald-500' : 'bg-slate-900 border-indigo-500'}`}>
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />

            {data.status === 'blocked' && <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />}
            {data.status === 'allowed' && <ShieldCheck className="w-8 h-8 text-emerald-500" />}
            {data.status === 'idle' && <Shield className="w-8 h-8 text-indigo-500" />}

            <div className="text-center">
                <div className="font-bold text-white text-sm">Supabase RLS</div>
                <div className="text-xs text-slate-400">Security Layer</div>
            </div>

            {data.status === 'blocked' && (
                <div className="bg-red-500/20 text-red-200 text-xs px-2 py-1 rounded mt-1 font-mono">
                    ACCESS DENIED
                </div>
            )}
            {data.status === 'allowed' && (
                <div className="bg-emerald-500/20 text-emerald-200 text-xs px-2 py-1 rounded mt-1 font-mono">
                    ACCESS GRANTED
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
    security: SecurityNode
};

// === Initial Graph Data ===
// === Initial Graph Data ===
import { Node } from '@xyflow/react';

type SecurityNodeData = {
    label?: string;
    desc?: string;
    icon?: any;
    highlight?: boolean;
    color?: string;
    status: 'idle' | 'allowed' | 'blocked';
};

type CustomNodeData = {
    label: string;
    desc: string;
    icon?: any;
    highlight?: boolean;
    color?: string;
    status?: undefined;
}

type AppNode = Node<SecurityNodeData | CustomNodeData>;

export function SecuritySection() {
    const { t } = useLanguage();

    const initialNodes: AppNode[] = [
        {
            id: 'user',
            type: 'custom',
            position: { x: 250, y: 0 },
            data: { label: t.security.nodes.user.label, desc: t.security.nodes.user.desc, icon: User, color: 'bg-blue-500' },
        },
        {
            id: 'agent',
            type: 'custom',
            position: { x: 250, y: 200 },
            data: { label: t.security.nodes.agent.label, desc: t.security.nodes.agent.desc, icon: Bot, color: 'bg-indigo-500' },
        },
        {
            id: 'security',
            type: 'security',
            position: { x: 230, y: 400 },
            data: { status: 'idle' }
        },
        {
            id: 'data',
            type: 'custom',
            position: { x: 250, y: 600 },
            data: { label: t.security.nodes.data.label, desc: t.security.nodes.data.desc, icon: Database, color: 'bg-slate-700' },
        },
    ];

    const initialEdges = [
        { id: 'e1-2', source: 'user', target: 'agent', animated: true, style: { stroke: '#64748b' } },
        { id: 'e2-3', source: 'agent', target: 'security', animated: true, style: { stroke: '#64748b' } },
        { id: 'e3-4', source: 'security', target: 'data', animated: false, style: { stroke: '#64748b', opacity: 0.2 } },
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when language changes (re-initialize if needed, or better: use useEffect to update labels)
    // Simple way: Key the component by language or just let `initialNodes` be re-created on mount if language changed? 
    // React Flow `useNodesState` only uses initialNodes on first render.
    // We should update nodes with `setNodes` when `t` changes.
    // However, `t` changing might not be enough if we don't explicitly setNodes.
    // Let's use a useEffect to update labels.

    useEffect(() => {
        setNodes((nds) => nds.map(n => {
            if (n.id === 'user') return { ...n, data: { ...n.data, label: t.security.nodes.user.label, desc: t.security.nodes.user.desc } };
            if (n.id === 'agent') return { ...n, data: { ...n.data, label: t.security.nodes.agent.label, desc: t.security.nodes.agent.desc } };
            if (n.id === 'data') return { ...n, data: { ...n.data, label: t.security.nodes.data.label, desc: t.security.nodes.data.desc } };
            return n;
        }));
    }, [t, setNodes]);


    const handleSimulate = (frame: 'allowed' | 'blocked') => {
        // Reset
        setEdges((eds) => eds.map(e => ({ ...e, animated: false, style: { stroke: '#64748b', opacity: 0.2 } })));
        setNodes((nds) => nds.map(n => {
            if (n.id === 'security') return { ...n, data: { ...n.data, status: 'idle' } };
            return n;
        }));

        // Start Simulation
        setTimeout(() => {
            // Step 1: User -> Agent
            setEdges((eds) => eds.map(e => {
                if (e.id === 'e1-2') return { ...e, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 1 } };
                return e;
            }));
        }, 100);

        setTimeout(() => {
            // Step 2: Agent -> Security
            setEdges((eds) => eds.map(e => {
                if (e.id === 'e2-3') return { ...e, animated: true, style: { stroke: '#6366f1', strokeWidth: 2, opacity: 1 } };
                return e;
            }));
        }, 1000);

        setTimeout(() => {
            // Step 3: Security Decision
            setNodes((nds) => nds.map(n => {
                if (n.id === 'security') return { ...n, data: { ...n.data, status: frame } };
                return n;
            }));

            if (frame === 'allowed') {
                setEdges((eds) => eds.map(e => {
                    if (e.id === 'e3-4') return { ...e, animated: true, style: { stroke: '#10b981', strokeWidth: 2, opacity: 1 } };
                    return e;
                }));
            }
        }, 2000);
    };

    return (
        <section id="bezpečnosť" className="min-h-screen py-24 bg-slate-950 flex flex-col items-center">
            <div className="container mx-auto px-4 mb-12 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">{t.security.chip}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
                    {t.security.title.split(" ")[0]} <span className="text-indigo-500">{t.security.title.split(" ").slice(1).join(" ")}</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    {t.security.description}
                </p>
            </div>

            <div className="w-full max-w-5xl h-[700px] border border-white/10 rounded-3xl overflow-hidden bg-slate-900/50 backdrop-blur-sm relative shadow-2xl">
                {/* Controls */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    <button
                        onClick={() => handleSimulate('allowed')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        {t.security.simulate.allow}
                    </button>
                    <button
                        onClick={() => handleSimulate('blocked')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        {t.security.simulate.block}
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    proOptions={{ hideAttribution: true }}
                    className="bg-slate-950"
                >
                    <Background color="#334155" gap={24} size={1} />
                    <Controls className="bg-slate-800 border-slate-700 fill-white text-white" />
                </ReactFlow>
            </div>
        </section>
    );
}
