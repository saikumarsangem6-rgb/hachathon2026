import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./src/db/database.ts";
import { calculateEloChange } from "./src/services/elo.ts";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get all models
  app.get("/api/models", (req, res) => {
    const models = db.prepare("SELECT * FROM models ORDER BY elo DESC").all();
    res.json(models);
  });

  // Get leaderboard stats
  app.get("/api/leaderboard/stats", (req, res) => {
    const totalBattles = db.prepare("SELECT COUNT(*) as count FROM battles").get() as { count: number };
    const topModel = db.prepare("SELECT * FROM models ORDER BY elo DESC LIMIT 1").get();
    const biggestRiser = db.prepare(`
      SELECT m.*, SUM(v.elo_change_winner) as gain 
      FROM models m 
      JOIN votes v ON m.id = v.winner_model_id 
      WHERE v.created_at > datetime('now', '-24 hours')
      GROUP BY m.id 
      ORDER BY gain DESC LIMIT 1
    `).get();

    res.json({
      totalBattles: totalBattles.count,
      topModel,
      biggestRiser,
    });
  });

  // Start a battle
  app.post("/api/battle/start", (req, res) => {
    const { prompt } = req.body;
    
    // Matchmaking logic
    const models = db.prepare("SELECT * FROM models").all() as any[];
    let modelA, modelB;

    if (models.length < 2) return res.status(500).json({ error: "Not enough models" });

    // Randomly select two models for now (can enhance with Elo proximity later)
    const shuffled = models.sort(() => 0.5 - Math.random());
    modelA = shuffled[0];
    modelB = shuffled[1];

    const battleId = crypto.randomUUID();
    db.prepare("INSERT INTO battles (id, model_a_id, model_b_id, prompt) VALUES (?, ?, ?, ?)")
      .run(battleId, modelA.id, modelB.id, prompt);

    res.json({
      battleId,
      modelA: { id: modelA.id, name: "Model A" }, // Anonymized
      modelB: { id: modelB.id, name: "Model B" }, // Anonymized
    });
  });

  // Submit a vote
  app.post("/api/vote", (req, res) => {
    const { battleId, winnerId, outcome } = req.body; // winnerId is 'a', 'b', or 'tie'
    
    const battle = db.prepare("SELECT * FROM battles WHERE id = ?").get() as any;
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    const modelA = db.prepare("SELECT * FROM models WHERE id = ?").get() as any;
    const modelB = db.prepare("SELECT * FROM models WHERE id = ?").get() as any;

    let scoreA = 0.5;
    if (winnerId === 'a') scoreA = 1;
    if (winnerId === 'b') scoreA = 0;

    const { changeA, changeB } = calculateEloChange(modelA.elo, modelB.elo, scoreA);

    // Update models
    db.prepare("UPDATE models SET elo = elo + ?, total_battles = total_battles + 1 WHERE id = ?").run(changeA, modelA.id);
    db.prepare("UPDATE models SET elo = elo + ?, total_battles = total_battles + 1 WHERE id = ?").run(changeB, modelB.id);

    if (winnerId === 'a') {
      db.prepare("UPDATE models SET wins = wins + 1 WHERE id = ?").run(modelA.id);
      db.prepare("UPDATE models SET losses = losses + 1 WHERE id = ?").run(modelB.id);
    } else if (winnerId === 'b') {
      db.prepare("UPDATE models SET wins = wins + 1 WHERE id = ?").run(modelB.id);
      db.prepare("UPDATE models SET losses = losses + 1 WHERE id = ?").run(modelA.id);
    } else {
      db.prepare("UPDATE models SET ties = ties + 1 WHERE id = ?").run(modelA.id);
      db.prepare("UPDATE models SET ties = ties + 1 WHERE id = ?").run(modelB.id);
    }

    // Record vote
    const voteId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO votes (id, battle_id, winner_model_id, loser_model_id, outcome, elo_change_winner, elo_change_loser)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      voteId, 
      battleId, 
      winnerId === 'a' ? modelA.id : (winnerId === 'b' ? modelB.id : null),
      winnerId === 'a' ? modelB.id : (winnerId === 'b' ? modelA.id : null),
      outcome,
      winnerId === 'a' ? changeA : (winnerId === 'b' ? changeB : 0),
      winnerId === 'a' ? changeB : (winnerId === 'b' ? changeA : 0)
    );

    // Update battle with winner and revealed names
    db.prepare("UPDATE battles SET winner = ? WHERE id = ?").run(winnerId, battleId);

    res.json({
      success: true,
      modelA: { id: modelA.id, name: modelA.name, provider: modelA.provider, eloChange: changeA },
      modelB: { id: modelB.id, name: modelB.name, provider: modelB.provider, eloChange: changeB }
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
