import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'arena.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    elo INTEGER DEFAULT 1200,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY,
    model_a_id TEXT NOT NULL,
    model_b_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    response_a TEXT,
    response_b TEXT,
    winner TEXT, -- 'a', 'b', 'tie', 'skip'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(model_a_id) REFERENCES models(id),
    FOREIGN KEY(model_b_id) REFERENCES models(id)
  );

  CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    battle_id TEXT NOT NULL,
    winner_model_id TEXT,
    loser_model_id TEXT,
    outcome TEXT NOT NULL,
    elo_change_winner INTEGER,
    elo_change_loser INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(battle_id) REFERENCES battles(id)
  );
`);

// Seed initial models if empty
const modelCount = db.prepare('SELECT COUNT(*) as count FROM models').get() as { count: number };
if (modelCount.count === 0) {
  const initialModels = [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', elo: 1348 },
    { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', elo: 1332 },
    { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', provider: 'Google', elo: 1318 },
    { id: 'llama-3-1-405b', name: 'Llama 3.1 405B', provider: 'Meta', elo: 1301 },
    { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', elo: 1288 },
    { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', elo: 1275 },
    { id: 'command-r-plus', name: 'Command R+', provider: 'Cohere', elo: 1261 },
    { id: 'phi-3-medium', name: 'Phi-3 Medium', provider: 'Microsoft', elo: 1244 },
  ];

  const insertModel = db.prepare('INSERT INTO models (id, name, provider, elo) VALUES (?, ?, ?, ?)');
  for (const model of initialModels) {
    insertModel.run(model.id, model.name, model.provider, model.elo);
  }
}

export default db;
