import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  TrendingUp, 
  Globe, 
  Shield, 
  Terminal, 
  AlertCircle,
  ChevronRight,
  Plus,
  RefreshCw,
  DollarSign,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

interface Agent {
  id: string;
  name: string;
  status: string;
  revenue: number;
  task: string;
  uptime: string;
}

interface Opportunity {
  id: string;
  type: string;
  description: string;
  potential: string;
  detectedAt: string;
}

interface SwarmStatus {
  totalRevenue: number;
  activeAgents: number;
  optimizationCycles: number;
  agents: Agent[];
  opportunities: Opportunity[];
}

export default function App() {
  const [status, setStatus] = useState<SwarmStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/swarm/status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch swarm status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const deployAgent = async (opportunityId: string) => {
    setDeploying(opportunityId);
    try {
      const res = await fetch('/api/swarm/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId })
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (err) {
      console.error("Deployment failed", err);
    } finally {
      setDeploying(null);
    }
  };

  const scanForOpportunities = async () => {
    setScanning(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Analyze the current digital landscape and identify a high-potential revenue opportunity gap for an autonomous AI agent to exploit. Be creative and technical. Examples: 'Cross-chain liquidity imbalance in emerging L2s', 'Sentiment arbitrage on niche developer forums', 'Automated optimization of GPU spot instance pricing'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Type of opportunity (e.g. MARKET_GAP, ARBITRAGE, OPTIMIZATION)" },
              description: { type: Type.STRING, description: "Concise description of the opportunity" },
              potential: { type: Type.STRING, description: "Potential rating (High, Medium, Low)" }
            },
            required: ["type", "description", "potential"]
          }
        }
      });

      const opportunity = JSON.parse(response.text || '{}');
      
      await fetch('/api/swarm/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity })
      });
      
      await fetchStatus();
    } catch (err) {
      console.error("Scanning failed", err);
    } finally {
      setScanning(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-emerald-500 font-mono text-sm tracking-widest">INITIALIZING SWARM PROTOCOL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header / Stats */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter flex items-center gap-3">
            <Layers className="text-emerald-500 w-10 h-10" />
            AETHERIS
          </h1>
          <p className="text-white/40 font-mono text-xs mt-1 uppercase tracking-widest">Autonomous Revenue Swarm v2.4.0</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
          <StatCard 
            label="Total Revenue" 
            value={`$${status?.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign className="w-4 h-4 text-emerald-400" />} 
          />
          <StatCard 
            label="Active Agents" 
            value={status?.activeAgents.toString() || '0'} 
            icon={<Cpu className="w-4 h-4 text-blue-400" />} 
          />
          <StatCard 
            label="Optimization Cycles" 
            value={status?.optimizationCycles.toString() || '0'} 
            icon={<RefreshCw className="w-4 h-4 text-purple-400" />} 
          />
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intelligence & Opportunities */}
        <div className="lg:col-span-4 space-y-8">
          <section className="glass-panel p-6 relative overflow-hidden">
            <div className="scanline" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              World Observer
            </h2>
            <div className="space-y-4">
              <div className="h-32 flex items-end gap-1 px-2">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: `${Math.random() * 100}%` }}
                    transition={{ repeat: Infinity, duration: 1 + Math.random(), ease: "easeInOut" }}
                    className="flex-1 bg-emerald-500/20 border-t border-emerald-500/40"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase">
                <span>Market Sentiment</span>
                <span>Social Signals</span>
                <span>Arbitrage Gaps</span>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Opportunity Feed
              </h2>
              <button 
                onClick={scanForOpportunities}
                disabled={scanning}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-emerald-500 disabled:opacity-50"
                title="Scan for new opportunities"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {status?.opportunities.map((opp) => (
                  <motion.div 
                    key={opp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-white/5 border border-white/5 rounded-lg group hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase">
                        {opp.type}
                      </span>
                      <span className="text-[10px] font-mono text-white/30">
                        {opp.potential} Potential
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-4">{opp.description}</p>
                    <button 
                      onClick={() => deployAgent(opp.id)}
                      disabled={deploying === opp.id}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-[10px] font-bold uppercase tracking-widest text-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deploying === opp.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      Deploy Micro-Agent
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {status?.opportunities.length === 0 && (
                <div className="text-center py-8 text-white/20 text-xs font-mono">
                  Scanning for new opportunities...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Agent Swarm */}
        <div className="lg:col-span-8">
          <section className="glass-panel p-6 h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Active Swarm
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  System Nominal
                </span>
                <span>Uptime: 142:22:04</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <th className="pb-4 font-normal">Agent ID</th>
                    <th className="pb-4 font-normal">Status</th>
                    <th className="pb-4 font-normal">Current Task</th>
                    <th className="pb-4 font-normal">Revenue</th>
                    <th className="pb-4 font-normal">Uptime</th>
                    <th className="pb-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <AnimatePresence>
                    {status?.agents.map((agent) => (
                      <motion.tr 
                        key={agent.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 font-mono text-xs text-white/60">{agent.id}</td>
                        <td className="py-4">
                          <span className={`flex items-center gap-2 ${
                            agent.status === 'EXECUTING' ? 'text-blue-400' : 
                            agent.status === 'DEPLOYING' ? 'text-yellow-400' : 'text-emerald-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              agent.status === 'EXECUTING' ? 'bg-blue-400 animate-pulse' : 
                              agent.status === 'DEPLOYING' ? 'bg-yellow-400 animate-bounce' : 'bg-emerald-400'
                            }`} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{agent.status}</span>
                          </span>
                        </td>
                        <td className="py-4 text-white/80 max-w-[200px] truncate">{agent.task}</td>
                        <td className="py-4 font-mono text-emerald-400">${agent.revenue.toFixed(2)}</td>
                        <td className="py-4 font-mono text-xs text-white/40">{agent.uptime}</td>
                        <td className="py-4 text-right">
                          <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white">
                            <Terminal className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Footer: System Logs */}
      <footer className="glass-panel p-4 font-mono text-[10px] text-white/30 flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 text-emerald-500 whitespace-nowrap">
          <Shield className="w-3 h-3" />
          SECURE_NODE_CONNECTED
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-8"
          >
            <span>[SYSTEM] Detecting market volatility in sector 7G...</span>
            <span>[AGENT ag-001] Completed sentiment harvest. Optimization in progress.</span>
            <span>[REVENUE] +$12.40 from arbitrage cycle 882.</span>
            <span>[SWARM] Scaling compute resources for incoming social signals.</span>
            <span>[SYSTEM] All nodes operational. Latency 14ms.</span>
          </motion.div>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="whitespace-nowrap">
          UTC: {new Date().toISOString().split('T')[1].split('.')[0]}
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-4 flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

