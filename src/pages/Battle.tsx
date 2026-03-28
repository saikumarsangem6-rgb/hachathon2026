import React from 'react';
import { useStore } from '../store/useStore';
import { getGeminiResponse, getMockResponse } from '../services/aiService';
import { ThumbsUp, Scale, SkipForward, CheckCircle } from 'lucide-react';
import { marked } from 'marked';
import clsx from 'clsx';

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function Battle() {
  const { currentSession, updateResponse, submitVote, startBattle } = useStore();
  const { prompt, modelA, modelB, isRevealed, isVoting } = currentSession;
  const [isStreaming, setIsStreaming] = React.useState(false);

  React.useEffect(() => {
    if (currentSession.battleId && !isStreaming && !modelA?.response && !modelB?.response) {
      handleStream();
    }
  }, [currentSession.battleId]);

  const handleStream = async () => {
    if (!modelA || !modelB) return;
    setIsStreaming(true);

    try {
      // Stream both in parallel
      await Promise.all([
        (async () => {
          // If it's the gemini model, use real gemini, otherwise mock
          if (modelA.id === 'gemini-2-flash') {
            await getGeminiResponse(prompt, (text) => updateResponse('a', text));
          } else {
            await getMockResponse(modelA.id, prompt, (text) => updateResponse('a', text));
          }
        })(),
        (async () => {
          if (modelB.id === 'gemini-2-flash') {
            await getGeminiResponse(prompt, (text) => updateResponse('b', text));
          } else {
            await getMockResponse(modelB.id, prompt, (text) => updateResponse('b', text));
          }
        })()
      ]);
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  if (!modelA || !modelB) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '2rem' }}>No active battle.</h2>
        <p style={{ marginTop: '16px', color: 'var(--ink-muted)' }}>Start a battle from the home page.</p>
      </div>
    );
  }

  return (
    <div className="battle-page container">
      {/* Prompt Card */}
      <div className="prompt-card animate-fade-up">
        <div className="meta-label">The Challenge</div>
        <div className="prompt-text">"{prompt}"</div>
        <div className="prompt-meta">
          <span className="meta-item">Text & Code only</span>
          <span className="meta-divider"></span>
          <span className="meta-item">Anonymous Battle</span>
        </div>
      </div>

      {/* Battle Panels */}
      <div className="battle-grid">
        <div className={clsx("model-panel animate-fade-up", isRevealed && "revealed")}>
          <div className="panel-header">
            <div className="model-badge">
              {isRevealed ? (
                <div className="revealed-info">
                  <div className="revealed-name">
                    <span className="dot" style={{ background: 'var(--accent)' }}></span>
                    {modelA.revealedName}
                  </div>
                  <div className="revealed-provider">{modelA.revealedProvider}</div>
                </div>
              ) : (
                <div className="anonymous-badge">
                  <span className="dot" style={{ background: 'var(--accent)' }}></span>
                  Model A
                </div>
              )}
            </div>
            {isRevealed && modelA.eloChange !== undefined && (
              <div className={clsx("elo-change-badge", modelA.eloChange >= 0 ? "positive" : "negative")}>
                {modelA.eloChange >= 0 ? "+" : ""}{modelA.eloChange} Elo
              </div>
            )}
          </div>
          <div className="response-content" dangerouslySetInnerHTML={{ __html: marked.parse(modelA.response || (isStreaming ? "..." : "")) as string }}></div>
        </div>

        <div className={clsx("model-panel animate-fade-up", isRevealed && "revealed")} style={{ animationDelay: '0.1s' }}>
          <div className="panel-header">
            <div className="model-badge">
              {isRevealed ? (
                <div className="revealed-info">
                  <div className="revealed-name">
                    <span className="dot" style={{ background: 'var(--accent-secondary)' }}></span>
                    {modelB.revealedName}
                  </div>
                  <div className="revealed-provider">{modelB.revealedProvider}</div>
                </div>
              ) : (
                <div className="anonymous-badge">
                  <span className="dot" style={{ background: 'var(--accent-secondary)' }}></span>
                  Model B
                </div>
              )}
            </div>
            {isRevealed && modelB.eloChange !== undefined && (
              <div className={clsx("elo-change-badge", modelB.eloChange >= 0 ? "positive" : "negative")}>
                {modelB.eloChange >= 0 ? "+" : ""}{modelB.eloChange} Elo
              </div>
            )}
          </div>
          <div className="response-content" dangerouslySetInnerHTML={{ __html: marked.parse(modelB.response || (isStreaming ? "..." : "")) as string }}></div>
        </div>
      </div>

      {/* Vote Bar */}
      {!isRevealed ? (
        <div className="vote-bar animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <button className="vote-btn primary" onClick={() => submitVote('a')} disabled={isVoting || isStreaming}>
            <ThumbsUp size={18} />
            <span>A is Better</span>
          </button>
          <button className="vote-btn secondary" onClick={() => submitVote('tie')} disabled={isVoting || isStreaming}>
            <Scale size={18} />
            <span>Tie</span>
          </button>
          <button className="vote-btn primary" onClick={() => submitVote('b')} disabled={isVoting || isStreaming}>
            <ThumbsUp size={18} />
            <span>B is Better</span>
          </button>
          <button className="vote-btn ghost" onClick={() => submitVote('tie')} disabled={isVoting || isStreaming}>
            <SkipForward size={18} />
            <span>Skip</span>
          </button>
        </div>
      ) : (
        <div className="next-battle-bar animate-fade-up">
          <div className="success-toast">
            <CheckCircle size={18} color="var(--success)" />
            <span>Vote recorded! Elo updated.</span>
          </div>
          <button className="next-btn" onClick={() => startBattle(prompt)}>
            Next Battle →
          </button>
        </div>
      )}

      <style>{`
        .battle-page { padding-bottom: 100px; }
        .prompt-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 64px;
          margin-bottom: 64px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
        }
        .prompt-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(to right, var(--accent), var(--accent-secondary));
        }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 700; margin-bottom: 16px; }
        .prompt-text { font-size: 2rem; font-weight: 600; font-family: var(--f-display); font-style: italic; color: var(--ink); line-height: 1.3; margin-bottom: 24px; }
        .prompt-meta { display: flex; justify-content: center; align-items: center; gap: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); font-weight: 700; }
        .meta-divider { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

        .battle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 80px;
        }
        .model-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 48px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          transition: var(--transition-slow);
          position: relative;
          box-shadow: var(--shadow-sm);
        }
        .model-panel:hover { box-shadow: var(--shadow-md); border-color: var(--border-hover); }
        .panel-header { 
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .model-badge { display: flex; flex-direction: column; gap: 4px; }
        .anonymous-badge { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 700; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .anonymous-badge .dot { width: 8px; height: 8px; border-radius: 50%; }
        
        .revealed-info { display: flex; flex-direction: column; gap: 4px; }
        .revealed-name { display: flex; align-items: center; gap: 8px; color: var(--ink); font-weight: 700; font-size: 1.25rem; }
        .revealed-name .dot { width: 8px; height: 8px; border-radius: 50%; }
        .revealed-provider { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); font-weight: 600; padding-left: 16px; }
        
        .elo-change-badge {
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          font-family: var(--f-mono);
          box-shadow: var(--shadow-sm);
        }
        .elo-change-badge.positive { background: var(--success-soft); color: var(--success); }
        .elo-change-badge.negative { background: var(--accent-soft); color: var(--accent); }

        .response-content {
          font-size: 17px;
          line-height: 1.8;
          color: var(--ink);
          flex-grow: 1;
        }
        .response-content pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 32px;
          border-radius: 20px;
          margin: 32px 0;
          overflow-x: auto;
          font-family: var(--f-mono);
          font-size: 15px;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
        }
        .response-content code {
          font-family: var(--f-mono);
          background: var(--bg);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.9em;
          color: var(--accent);
          font-weight: 600;
        }
        .response-content pre code { background: transparent; padding: 0; color: inherit; font-weight: normal; }

        .vote-bar {
          display: flex;
          justify-content: center;
          gap: 24px;
        }
        .vote-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 40px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
          transition: var(--transition);
        }
        .vote-btn.primary { background: var(--ink); color: var(--surface); }
        .vote-btn.secondary { background: var(--surface); border: 1px solid var(--border); color: var(--ink); }
        .vote-btn.ghost { color: var(--ink-muted); }
        .vote-btn:hover:not(:disabled) { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .vote-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .next-battle-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }
        .success-toast {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 20px 40px;
          border-radius: var(--radius-full);
          font-weight: 700;
          box-shadow: var(--shadow-lg);
          font-size: 16px;
        }
        .next-btn {
          background: var(--accent);
          color: white;
          padding: 24px 64px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 20px;
          transition: var(--transition);
          box-shadow: 0 10px 30px var(--accent-soft);
        }
        .next-btn:hover { transform: translateY(-4px); box-shadow: 0 20px 40px var(--accent-soft); }
      `}</style>
    </div>
  );
}
