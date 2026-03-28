import React from 'react';
import { useStore } from '../store/useStore';
import { Trophy, Zap, TrendingUp, Flame, Search } from 'lucide-react';
import clsx from 'clsx';

export default function Leaderboard() {
  const { models, stats, fetchModels, fetchStats } = useStore();
  const [search, setSearch] = React.useState('');

  const tableRef = React.useRef<HTMLTableSectionElement>(null);

  React.useEffect(() => {
    fetchModels();
    fetchStats();
  }, []);

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const rows = document.querySelectorAll('.reveal-on-scroll');
    rows.forEach(row => observer.observe(row));

    return () => observer.disconnect();
  }, [filteredModels]);

  return (
    <div className="leaderboard-page container">
      <header className="page-header animate-fade-up">
        <div className="meta-label">Global Rankings</div>
        <h1>The Arena <em>Leaderboard</em></h1>
        <p className="subtitle">Ranked by human preference across {stats?.totalBattles.toLocaleString() || '124,502'} battles</p>
        <div className="last-updated">Last updated: Just now</div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card">
          <div className="stat-icon gold"><Trophy size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Top Model</div>
            <div className="stat-value">{stats?.topModel?.name || 'GPT-4o'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Zap size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Most Active</div>
            <div className="stat-value">Claude 3.5 Sonnet</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Biggest Riser</div>
            <div className="stat-value">{stats?.biggestRiser?.name || 'Gemini 2.0 Flash'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal"><Flame size={20} /></div>
          <div className="stat-info">
            <div className="stat-label">Current Streak</div>
            <div className="stat-value">Llama 3.1 405B</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-row animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search models..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button className="chip active">All Time</button>
          <button className="chip">Last 7 Days</button>
          <button className="chip">Last 30 Days</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <table className="full-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Model Name</th>
              <th>Elo Score</th>
              <th>Battles</th>
              <th>Win Rate</th>
              <th>24h Change</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((model, i) => (
              <tr key={model.id} className="reveal-on-scroll" style={{ transitionDelay: `${i * 0.05}s` }}>
                <td className="rank-cell">
                  {i < 3 ? (
                    <span className={clsx("rank-medal", i === 0 ? "gold" : i === 1 ? "silver" : "bronze")}>
                      {i + 1}
                    </span>
                  ) : (
                    <span className="rank-number">0{i + 1}</span>
                  )}
                </td>
                <td>
                  <div className="model-name-cell">
                    <span className="dot" style={{ background: i === 0 ? 'var(--gold)' : 'var(--accent-secondary)' }}></span>
                    <div className="model-info">
                      <div className="model-name">{model.name}</div>
                      <div className="model-provider">{model.provider}</div>
                    </div>
                  </div>
                </td>
                <td className="mono-bold">{model.elo}</td>
                <td className="battles-cell">{model.total_battles.toLocaleString()}</td>
                <td>
                  <div className="win-rate-cell">
                    <div className="track"><div className="fill" style={{ width: `${(model.wins / (model.total_battles || 1)) * 100}%` }}></div></div>
                    <span>{Math.round((model.wins / (model.total_battles || 1)) * 100)}%</span>
                  </div>
                </td>
                <td className="text-accent-secondary">▲ 12</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .leaderboard-page { padding-bottom: 100px; }
        .page-header { text-align: center; margin-bottom: 80px; }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 700; margin-bottom: 16px; }
        .page-header h1 { font-size: 5rem; line-height: 0.9; margin-bottom: 24px; letter-spacing: -0.04em; }
        .subtitle { font-size: 1.25rem; color: var(--ink-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .last-updated { font-size: 11px; color: var(--ink-ghost); margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 80px;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .stat-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--border-hover); }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon.gold { background: #fcf6e6; color: var(--gold); }
        .stat-icon.orange { background: var(--accent-soft); color: var(--accent); }
        .stat-icon.green { background: #e6f4f1; color: var(--success); }
        .stat-icon.teal { background: var(--accent-secondary-soft); color: var(--accent-secondary); }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); margin-bottom: 6px; font-weight: 700; }
        .stat-value { font-weight: 700; font-size: 1.25rem; font-family: var(--f-display); color: var(--ink); line-height: 1.2; }

        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 32px;
        }
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
        }
        .search-icon {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--ink-ghost);
        }
        .search-wrapper input {
          width: 100%;
          padding: 18px 24px 18px 56px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
          font-size: 16px;
          color: var(--ink);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .search-wrapper input:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 4px var(--accent-soft); }
        
        .filter-chips { display: flex; gap: 12px; }
        .chip {
          padding: 14px 28px;
          border-radius: 16px;
          border: 1px solid var(--border);
          font-size: 14px;
          font-weight: 700;
          color: var(--ink-muted);
          background: var(--surface);
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .chip.active { background: var(--ink); color: white; border-color: var(--ink); box-shadow: var(--shadow-md); }
        .chip:hover:not(.active) { border-color: var(--border-hover); background: var(--bg); transform: translateY(-2px); }

        .table-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        .full-table { width: 100%; border-collapse: collapse; }
        .full-table th {
          text-align: left;
          padding: 24px 32px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--ink-muted);
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          font-weight: 700;
        }
        .full-table td { padding: 28px 32px; border-bottom: 1px solid var(--border); }
        .reveal-on-scroll { transition: var(--transition-slow); opacity: 0; transform: translateY(20px); }
        .reveal-on-scroll.visible { opacity: 1; transform: translateY(0); }
        
        .rank-cell { text-align: center !important; width: 100px; }
        .rank-medal {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          margin: 0 auto;
        }
        .rank-medal.gold { background: #FFD700; color: #8B4513; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4); }
        .rank-medal.silver { background: #C0C0C0; color: #4F4F4F; box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4); }
        .rank-medal.bronze { background: #CD7F32; color: #5D2E00; box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4); }
        .rank-number { font-weight: 700; color: var(--ink-ghost); font-size: 1.25rem; font-family: var(--f-display); }

        .model-name-cell { display: flex; align-items: center; gap: 16px; }
        .model-name-cell .dot { width: 8px; height: 8px; border-radius: 50%; }
        .model-info { display: flex; flex-direction: column; gap: 2px; }
        .model-name { font-weight: 700; font-size: 1.1rem; color: var(--ink); }
        .model-provider { font-size: 11px; color: var(--ink-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .mono-bold { font-family: var(--f-mono); font-weight: 700; font-size: 1.1rem; color: var(--ink); }
        .battles-cell { font-family: var(--f-mono); font-weight: 600; color: var(--ink-muted); font-size: 14px; }
        .win-rate-cell { display: flex; align-items: center; gap: 16px; }
        .track { width: 120px; height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; }
        .fill { height: 100%; background: var(--accent); border-radius: 4px; }
        .win-rate-cell span { font-weight: 700; font-size: 14px; color: var(--ink-muted); }
        .text-accent-secondary { color: var(--accent-secondary); font-weight: 700; font-family: var(--f-mono); font-size: 14px; }
      `}</style>
    </div>
  );
}
