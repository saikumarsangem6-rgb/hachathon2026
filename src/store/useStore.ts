import { create } from 'zustand';

interface Model {
  id: string;
  name: string;
  provider: string;
  elo: number;
  wins: number;
  losses: number;
  ties: number;
  total_battles: number;
}

interface BattleSession {
  battleId: string | null;
  prompt: string;
  modelA: { id: string; name: string; response: string; revealedName?: string; revealedProvider?: string; eloChange?: number } | null;
  modelB: { id: string; name: string; response: string; revealedName?: string; revealedProvider?: string; eloChange?: number } | null;
  isVoting: boolean;
  isRevealed: boolean;
}

interface ArenaState {
  models: Model[];
  stats: { totalBattles: number; topModel: Model | null; biggestRiser: Model | null } | null;
  currentSession: BattleSession;
  mode: 'battle' | 'side-by-side' | 'direct';
  
  setMode: (mode: 'battle' | 'side-by-side' | 'direct') => void;
  fetchModels: () => Promise<void>;
  fetchStats: () => Promise<void>;
  startBattle: (prompt: string) => Promise<void>;
  updateResponse: (model: 'a' | 'b', text: string) => void;
  submitVote: (winnerId: 'a' | 'b' | 'tie') => Promise<void>;
  resetSession: () => void;
}

export const useStore = create<ArenaState>((set, get) => ({
  models: [],
  stats: null,
  mode: 'battle',
  currentSession: {
    battleId: null,
    prompt: '',
    modelA: null,
    modelB: null,
    isVoting: false,
    isRevealed: false,
  },

  setMode: (mode) => set({ mode }),

  fetchModels: async () => {
    const res = await fetch('/api/models');
    const data = await res.json();
    set({ models: data });
  },

  fetchStats: async () => {
    const res = await fetch('/api/leaderboard/stats');
    const data = await res.json();
    set({ stats: data });
  },

  startBattle: async (prompt) => {
    set({ 
      currentSession: { 
        battleId: null, 
        prompt, 
        modelA: { id: '', name: 'Model A', response: '' }, 
        modelB: { id: '', name: 'Model B', response: '' },
        isVoting: false,
        isRevealed: false
      } 
    });

    const res = await fetch('/api/battle/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();

    set((state) => ({
      currentSession: {
        ...state.currentSession,
        battleId: data.battleId,
        modelA: { ...state.currentSession.modelA!, id: data.modelA.id },
        modelB: { ...state.currentSession.modelB!, id: data.modelB.id },
      }
    }));
  },

  updateResponse: (model, text) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        [model === 'a' ? 'modelA' : 'modelB']: {
          ...state.currentSession[model === 'a' ? 'modelA' : 'modelB']!,
          response: text
        }
      }
    }));
  },

  submitVote: async (winnerId) => {
    const { battleId } = get().currentSession;
    if (!battleId) return;

    set((state) => ({ currentSession: { ...state.currentSession, isVoting: true } }));

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId, winnerId, outcome: winnerId === 'tie' ? 'tie' : 'win' }),
    });
    const data = await res.json();

    set((state) => ({
      currentSession: {
        ...state.currentSession,
        isVoting: false,
        isRevealed: true,
        modelA: { 
          ...state.currentSession.modelA!, 
          revealedName: data.modelA.name, 
          revealedProvider: data.modelA.provider,
          eloChange: data.modelA.eloChange 
        },
        modelB: { 
          ...state.currentSession.modelB!, 
          revealedName: data.modelB.name, 
          revealedProvider: data.modelB.provider,
          eloChange: data.modelB.eloChange 
        },
      }
    }));

    get().fetchStats();
    get().fetchModels();
  },

  resetSession: () => set({
    currentSession: {
      battleId: null,
      prompt: '',
      modelA: null,
      modelB: null,
      isVoting: false,
      isRevealed: false,
    }
  })
}));
