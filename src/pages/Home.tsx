import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Send } from 'lucide-react';
import clsx from 'clsx';

export default function Home() {
  const navigate = useNavigate();
  const { startBattle, stats, fetchStats, fetchModels, models } = useStore();
  const [prompt, setPrompt] = React.useState('');

  React.useEffect(() => {
    fetchStats();
    fetchModels();
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    await startBattle(prompt);
    navigate('/battle');
  };

  return (
    <div className="home-page container">
      {/* Hero Section */}
      <section className="hero animate-fade-up">
        <div className="meta-label">Community Powered AI</div>
        <h1 className="hero-title">
          The <em>Arena</em> for Intelligent Models
        </h1>
        <p className="hero-subtitle">
          Battle anonymous models. Vote on the best response. 
          Help us find the world's most capable AI through human preference.
        </p>

        {/* Simplified Chat Input Box */}
        <div className="chat-box-container" style={{ animationDelay: '0.1s' }}>
          <div className="chat-box">
            <textarea 
              placeholder="Ask your question to start a battle..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="chat-toolbar">
              <div className="toolbar-left">
                <span className="text-ink-ghost text-xs font-semibold tracking-wider uppercase">Text and Code only</span>
              </div>
              <div className="toolbar-right">
                <button className="send-btn" onClick={handleSend} disabled={!prompt.trim()}>
                  <Send size={18} color="white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="quick-stats animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="stat-item">
          <div className="stat-label">Total Battles</div>
          <div className="stat-value">{stats?.totalBattles.toLocaleString() || '124,502'}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-label">Active Models</div>
          <div className="stat-value">{models.length || '42'}</div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-label">Human Votes</div>
          <div className="stat-value">892,110</div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className="feature-card">
          <div className="icon-box blue">⚔️</div>
          <h3>Blind Evaluation</h3>
          <p>Models are hidden until you vote. Focus purely on the quality of the response without bias.</p>
        </div>
        <div className="feature-card">
          <div className="icon-box indigo">📊</div>
          <h3>Elo Rankings</h3>
          <p>A dynamic leaderboard that updates with every single vote cast by the community in real-time.</p>
        </div>
        <div className="feature-card">
          <div className="icon-box slate">🎯</div>
          <h3>True Performance</h3>
          <p>No marketing hype or synthetic benchmarks. Just real-world performance judged by real people.</p>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="leaderboard-preview animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <div className="section-header">
          <div className="header-text">
            <div className="meta-label">Top Performers</div>
            <h2>Current <em>Rankings</em></h2>
          </div>
          <Link to="/leaderboard" className="view-all">View Full Leaderboard →</Link>
        </div>
        <div className="table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Model</th>
                <th>Elo</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {models.slice(0, 5).map((model, i) => (
                <tr key={model.id}>
                  <td className="rank-col">0{i + 1}</td>
                  <td>
                    <div className="model-cell">
                      <span className="dot" style={{ background: i === 0 ? 'var(--gold)' : 'var(--accent)' }}></span>
                      <div className="model-info">
                        <div className="model-name">{model.name}</div>
                        <div className="model-provider">{model.provider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono">{model.elo}</td>
                  <td>
                    <div className="win-rate-cell">
                      <div className="track"><div className="fill" style={{ width: `${(model.wins / (model.total_battles || 1)) * 100}%` }}></div></div>
                      <span>{Math.round((model.wins / (model.total_battles || 1)) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .home-page { padding-bottom: 100px; }
        
        .hero {
          padding: 80px 0 100px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 700; margin-bottom: 16px; }
        .hero-title {
          font-size: 5rem;
          font-weight: 600;
          line-height: 0.9;
          margin-bottom: 32px;
          letter-spacing: -0.04em;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--ink-muted);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 64px;
        }

        .chat-box-container {
          width: 100%;
          max-width: 800px;
        }
        .chat-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow-lg);
          transition: var(--transition);
          overflow: hidden;
        }
        .chat-box:focus-within { border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .chat-box textarea {
          width: 100%;
          min-height: 160px;
          padding: 32px;
          border: none;
          resize: none;
          font-size: 18px;
          background: transparent;
          color: var(--ink);
          line-height: 1.6;
        }
        .chat-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }
        .send-btn {
          width: 48px;
          height: 48px;
          background: var(--ink);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .quick-stats {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 64px;
          margin-bottom: 120px;
          padding: 48px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          box-shadow: var(--shadow-sm);
        }
        .stat-item { text-align: center; }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); margin-bottom: 8px; font-weight: 700; }
        .stat-value { font-size: 2.5rem; font-weight: 700; font-family: var(--f-display); color: var(--ink); line-height: 1; }
        .stat-divider { width: 1px; height: 48px; background: var(--border); }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 120px;
        }
        .feature-card {
          padding: 40px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          transition: var(--transition);
        }
        .feature-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-md); border-color: var(--border-hover); }
        .icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-bottom: 24px;
        }
        .icon-box.blue { background: #e0f2fe; }
        .icon-box.indigo { background: #eef2ff; }
        .icon-box.slate { background: #f1f5f9; }
        .feature-card h3 { font-size: 1.4rem; margin-bottom: 16px; font-family: var(--f-display); }
        .feature-card p { font-size: 15px; color: var(--ink-muted); line-height: 1.7; }

        .leaderboard-preview {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 64px;
          margin-bottom: 100px;
          box-shadow: var(--shadow-lg);
        }
        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .section-header h2 { font-size: 3.5rem; line-height: 0.9; }
        .view-all { font-size: 14px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
        
        .table-wrapper { overflow-x: auto; }
        .preview-table { width: 100%; border-collapse: collapse; }
        .preview-table th { text-align: left; padding: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); border-bottom: 1px solid var(--border); font-weight: 700; }
        .preview-table td { padding: 24px 16px; border-bottom: 1px solid var(--border); }
        .rank-col { font-family: var(--f-display); font-size: 1.25rem; font-weight: 700; color: var(--ink-ghost); }
        .model-cell { display: flex; align-items: center; gap: 16px; }
        .model-cell .dot { width: 8px; height: 8px; border-radius: 50%; }
        .model-name { font-weight: 700; font-size: 1.1rem; color: var(--ink); }
        .model-provider { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); font-weight: 600; }
        .mono { font-family: var(--f-mono); color: var(--ink); font-weight: 700; font-size: 1.1rem; }
        .win-rate-cell { display: flex; align-items: center; gap: 16px; }
        .track { width: 120px; height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; }
        .fill { height: 100%; background: var(--accent); border-radius: 4px; }
        .win-rate-cell span { font-weight: 700; font-size: 14px; color: var(--ink-muted); }
      `}</style>
    </div>
  );
}
