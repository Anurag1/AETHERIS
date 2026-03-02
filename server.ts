import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock state for the AI Swarm
  let agents = [
    { id: "ag-001", name: "Sentinel-Alpha", status: "OBSERVING", revenue: 124.50, task: "Market Sentiment Analysis", uptime: "14h 22m" },
    { id: "ag-002", name: "Arbitrage-Beta", status: "EXECUTING", revenue: 842.12, task: "Cross-Platform Price Sync", uptime: "2h 45m" },
    { id: "ag-003", name: "Content-Gamma", status: "OPTIMIZING", revenue: 45.20, task: "Social Signal Harvesting", uptime: "48h 12m" },
  ];

  let opportunities = [
    { id: "opp-1", type: "MARKET_GAP", description: "Underserved niche in AI-generated technical documentation", potential: "High", detectedAt: new Date().toISOString() },
    { id: "opp-2", type: "ARBITRAGE", description: "Price discrepancy detected in cloud compute spot instances", potential: "Medium", detectedAt: new Date().toISOString() },
  ];

  // Background simulation
  setInterval(() => {
    agents = agents.map(agent => {
      if (agent.status === "EXECUTING" || agent.status === "OPTIMIZING") {
        return { ...agent, revenue: agent.revenue + (Math.random() * 0.5) };
      }
      if (agent.status === "DEPLOYING") {
        return { ...agent, status: "EXECUTING", uptime: "1m" };
      }
      return agent;
    });
  }, 3000);

  // API Routes
  app.get("/api/swarm/status", (req, res) => {
    res.json({
      totalRevenue: agents.reduce((acc, curr) => acc + curr.revenue, 0),
      activeAgents: agents.length,
      optimizationCycles: 142,
      agents,
      opportunities
    });
  });

  app.post("/api/swarm/deploy", (req, res) => {
    const { opportunityId } = req.body;
    const opp = opportunities.find(o => o.id === opportunityId);
    if (opp) {
      const newAgent = {
        id: `ag-00${agents.length + 1}`,
        name: `Agent-${Math.random().toString(36).substring(7).toUpperCase()}`,
        status: "DEPLOYING",
        revenue: 0,
        task: opp.description,
        uptime: "0m"
      };
      agents.push(newAgent);
      opportunities = opportunities.filter(o => o.id !== opportunityId);
      res.json({ success: true, agent: newAgent });
    } else {
      res.status(404).json({ error: "Opportunity not found" });
    }
  });

  app.post("/api/swarm/opportunities", (req, res) => {
    const { opportunity } = req.body;
    const newOpp = {
      id: `opp-${opportunities.length + 1}`,
      ...opportunity,
      detectedAt: new Date().toISOString()
    };
    opportunities.unshift(newOpp);
    res.json({ success: true, opportunity: newOpp });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
