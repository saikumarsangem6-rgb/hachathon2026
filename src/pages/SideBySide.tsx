import React from 'react';
import { useStore } from '../store/useStore';
import { getMockResponse, getGeminiResponse } from '../services/aiService';
import { Send } from 'lucide-react';
import { marked } from 'marked';
import clsx from 'clsx';

export default function SideBySide() {
  const { models, fetchModels } = useStore();
  const [modelA, setModelA] = React.useState('');
  const [modelB, setModelB] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [responseA, setResponseA] = React.useState('');
  const [responseB, setResponseB] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);

  React.useEffect(() => {
    fetchModels();
  }, []);

  const handleSend = async () => {
    if (!prompt.trim() || !modelA || !modelB) return;
    setIsStreaming(true);
    setResponseA('');
    setResponseB('');

    try {
      await Promise.all([
        (async () => {
          if (modelA === 'gemini-2-flash') {
            await getGeminiResponse(prompt, setResponseA);
          } else {
            await getMockResponse(modelA, prompt, setResponseA);
          }
        })(),
        (async () => {
          if (modelB === 'gemini-2-flash') {
            await getGeminiResponse(prompt, setResponseB);
          } else {
            await getMockResponse(modelB, prompt, setResponseB);
          }
        })()
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="side-by-side container">
      <header className="page-header animate-fade-up">
        <div className="meta-label">Explicit Comparison</div>
        <h1>Side by <em>Side</em></h1>
        <p className="subtitle">Select two models to compare their performance on the same prompt. No bias, just results.</p>
      </header>

      {/* Selectors */}
      <div className="selectors-row animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="selector-group">
          <label>Model A</label>
          <select value={modelA} onChange={(e) => setModelA(e.target.value)}>
            <option value="">Select a model</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.elo})</option>)}
          </select>
        </div>
        <div className="vs-badge">VS</div>
        <div className="selector-group">
          <label>Model B</label>
          <select value={modelB} onChange={(e) => setModelB(e.target.value)}>
            <option value="">Select a model</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.name} ({m.elo})</option>)}
          </select>
        </div>
      </div>

      {/* Input */}
      <div className="input-row animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="chat-input-wrapper">
          <textarea 
            placeholder="Type your comparison prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="input-toolbar">
            <div className="toolbar-left">
              <span className="text-ink-ghost text-xs font-bold uppercase tracking-widest">Text & Code</span>
            </div>
            <div className="toolbar-right">
              <button className="send-btn" onClick={handleSend} disabled={isStreaming || !prompt.trim() || !modelA || !modelB}>
                <Send size={18} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responses */}
      <div className="responses-grid animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <div className={clsx("response-panel", responseA && "has-content")}>
          <div className="panel-label">
            <span className="dot" style={{ background: 'var(--accent)' }}></span>
            <div className="model-info">
              <div className="model-name">{modelA ? models.find(m => m.id === modelA)?.name : "Model A"}</div>
              <div className="model-provider">{modelA ? models.find(m => m.id === modelA)?.provider : "Provider"}</div>
            </div>
          </div>
          <div className="content" dangerouslySetInnerHTML={{ __html: marked.parse(responseA || (isStreaming ? "..." : "")) as string }}></div>
        </div>
        <div className={clsx("response-panel", responseB && "has-content")}>
          <div className="panel-label">
            <span className="dot" style={{ background: 'var(--accent-secondary)' }}></span>
            <div className="model-info">
              <div className="model-name">{modelB ? models.find(m => m.id === modelB)?.name : "Model B"}</div>
              <div className="model-provider">{modelB ? models.find(m => m.id === modelB)?.provider : "Provider"}</div>
            </div>
          </div>
          <div className="content" dangerouslySetInnerHTML={{ __html: marked.parse(responseB || (isStreaming ? "..." : "")) as string }}></div>
        </div>
      </div>

      <style>{`
        .side-by-side { padding-bottom: 100px; }
        .page-header { text-align: center; margin-bottom: 80px; }
        .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); font-weight: 700; margin-bottom: 16px; }
        .page-header h1 { font-size: 5rem; line-height: 0.9; margin-bottom: 24px; letter-spacing: -0.04em; }
        .subtitle { color: var(--ink-muted); font-size: 1.25rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }

        .selectors-row {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 40px;
          margin-bottom: 64px;
        }
        .selector-group { display: flex; flex-direction: column; gap: 16px; flex: 1; max-width: 360px; }
        .selector-group label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ink-muted); letter-spacing: 0.05em; }
        .selector-group select {
          padding: 20px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--surface);
          font-size: 16px;
          color: var(--ink);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          font-weight: 600;
        }
        .selector-group select:focus { border-color: var(--accent); outline: none; box-shadow: 0 0 0 4px var(--accent-soft); }
        .vs-badge {
          height: 60px;
          display: flex;
          align-items: center;
          font-family: var(--f-display);
          font-weight: 700;
          font-style: italic;
          font-size: 2rem;
          color: var(--ink-ghost);
        }

        .input-row { display: flex; justify-content: center; margin-bottom: 80px; }
        .chat-input-wrapper {
          width: 100%;
          max-width: 800px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          transition: var(--transition);
          overflow: hidden;
        }
        .chat-input-wrapper:focus-within { border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .chat-input-wrapper textarea {
          width: 100%;
          border: none;
          resize: none;
          padding: 32px;
          font-size: 18px;
          min-height: 120px;
          background: transparent;
          color: var(--ink);
          line-height: 1.6;
        }
        .input-toolbar {
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

        .responses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 64px;
        }
        .response-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 48px;
          min-height: 500px;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
          display: flex;
          flex-direction: column;
        }
        .response-panel.has-content { border-color: var(--border); box-shadow: var(--shadow-md); }
        .panel-label {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .panel-label .dot { width: 8px; height: 8px; border-radius: 50%; }
        .panel-label .model-info { display: flex; flex-direction: column; gap: 2px; }
        .panel-label .model-name { font-weight: 700; font-size: 1.1rem; color: var(--ink); }
        .panel-label .model-provider { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); font-weight: 600; }
        
        .content { font-size: 17px; line-height: 1.8; color: var(--ink); flex-grow: 1; }
      `}</style>
    </div>
  );
}
