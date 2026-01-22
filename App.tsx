
import React, { useState, useEffect, useRef } from 'react';
import { GameState } from './types';
import { getGMResponse } from './geminiService';
import { Activity, Wind, Zap, MapPin, Package, Terminal as TerminalIcon, Send, ShieldAlert } from 'lucide-react';

const INITIAL_STATE: GameState = {
  oxygen: 100,
  health: 100,
  power: 12,
  location: "Cryo-Chamber",
  inventory: [],
  turnCount: 0,
  isGameOver: false,
  history: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState.history.length === 0) {
      handleAction("Wake up");
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [gameState.history, loading]);

  const handleAction = async (action: string) => {
    if (gameState.isGameOver || loading) return;

    setLoading(true);
    const updatedHistory = [...gameState.history];
    if (action !== "Wake up") {
      updatedHistory.push({ role: 'player', content: action });
    }

    const oxygenCost = action === "Wake up" ? 0 : 5;
    const newOxygen = Math.max(0, gameState.oxygen - oxygenCost);

    if (newOxygen <= 0) {
      setGameState(prev => ({
        ...prev,
        oxygen: 0,
        isGameOver: true,
        history: [...updatedHistory, { 
          role: 'gm', 
          content: "ERROR: CRITICAL OXYGEN FAILURE. BIOSYSTEMS SHUTTING DOWN... You succumb to the vacuum of the Aetheris. The emerald growth pulses one last time over your cooling body. CONNECTION LOST.",
          actions: ["REBOOT SYSTEM"]
        }]
      }));
      setLoading(false);
      return;
    }

    try {
      const result = await getGMResponse({ ...gameState, history: updatedHistory, oxygen: newOxygen }, action);
      
      const newHealth = Math.max(0, gameState.health + (result.healthDelta || 0));
      const newPower = Math.min(100, Math.max(0, gameState.power + (result.powerDelta || 0)));
      const newInventory = [...gameState.inventory];
      if (result.itemFound && !newInventory.includes(result.itemFound)) {
        newInventory.push(result.itemFound);
      }

      const gameOver = newHealth <= 0 || result.narrative.toLowerCase().includes("game over");

      setGameState(prev => ({
        ...prev,
        oxygen: newOxygen,
        health: newHealth,
        power: newPower,
        location: result.locationUpdate,
        inventory: newInventory,
        turnCount: prev.turnCount + 1,
        isGameOver: gameOver,
        history: [...updatedHistory, { 
          role: 'gm', 
          content: result.narrative,
          actions: result.suggestedActions 
        }]
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setCustomAction("");
    }
  };

  const restartGame = () => {
    setGameState(INITIAL_STATE);
    // Use a small timeout to allow state to reset before triggering initial action
    setTimeout(() => handleAction("Wake up"), 50);
  };

  const StatBox = ({ icon: Icon, label, value, color, max = 100 }: { icon: any, label: string, value: number, color: string, max?: number }) => (
    <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-md flex flex-col gap-1 min-w-[110px] backdrop-blur-xl relative overflow-hidden group">
      <div className={`absolute top-0 left-0 h-full w-1 transition-all duration-1000 ${color.replace('text-', 'bg-')}`} style={{ height: `${(value / max) * 100}%` }} />
      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">
        <Icon size={12} className={color} />
        {label}
      </div>
      <div className="flex items-baseline gap-1 pl-2">
        <span className={`text-xl font-bold orbitron ${color} text-glow`}>{value}</span>
        <span className="text-[10px] text-zinc-600">%</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto px-6 py-8 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]"></div>

      {/* Top HUD */}
      <header className="flex flex-col md:flex-row gap-4 mb-8 shrink-0 z-10">
        <div className="flex-1 flex gap-3">
          <StatBox icon={Activity} label="Vitals" value={gameState.health} color="text-rose-500" />
          <StatBox icon={Wind} label="Oxygen" value={gameState.oxygen} color="text-emerald-400" />
          <StatBox icon={Zap} label="Core" value={gameState.power} color="text-amber-400" />
        </div>
        
        <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-md flex-1 md:flex-none md:w-64 backdrop-blur-xl flex items-center gap-4">
          <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
            <MapPin size={18} className="text-purple-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Deck Registry</div>
            <div className="text-sm font-bold orbitron text-purple-300 truncate tracking-wider uppercase">
              {gameState.location}
            </div>
          </div>
        </div>
      </header>

      {/* Main Narrative Feed */}
      <main 
        ref={scrollRef}
        className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-y-auto p-8 space-y-12 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm relative z-10"
      >
        {gameState.history.map((entry, i) => (
          <div key={i} className={`flex flex-col ${entry.role === 'player' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both`}>
            {entry.role === 'player' ? (
              <div className="max-w-[70%] bg-emerald-500/5 border border-emerald-500/20 text-emerald-300/80 px-6 py-3 rounded-full rounded-tr-none text-xs font-bold tracking-[0.2em] uppercase italic flex items-center gap-3">
                <TerminalIcon size={14} />
                {entry.content}
              </div>
            ) : (
              <div className="max-w-[90%] space-y-4">
                <div className="text-zinc-200 leading-relaxed text-lg lg:text-xl font-serif tracking-tight drop-shadow-sm first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-emerald-500">
                  {entry.content}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-emerald-500 animate-pulse font-mono text-xs tracking-widest">
              <TerminalIcon size={14} className="animate-spin-slow" />
              UPDATING AETHERIS LOGS...
            </div>
            <div className="h-[2px] w-48 bg-emerald-500/20 overflow-hidden rounded-full">
              <div className="h-full bg-emerald-500 animate-progress-indefinite w-1/2"></div>
            </div>
          </div>
        )}
      </main>

      {/* Input / Control Area */}
      <footer className="mt-8 space-y-6 shrink-0 z-10">
        {!gameState.isGameOver ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {gameState.history[gameState.history.length - 1]?.actions?.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(action)}
                  disabled={loading}
                  className="bg-zinc-900/50 hover:bg-emerald-500/10 border border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 px-5 py-2.5 rounded-full transition-all duration-300 text-xs font-bold tracking-widest uppercase active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  {action}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); if(customAction.trim()) handleAction(customAction); }}
              className="relative"
            >
              <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <TerminalIcon size={18} className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="INPUT SHIP COMMAND..."
                disabled={loading}
                className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-16 text-emerald-400 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all font-mono uppercase tracking-[0.3em] text-xs placeholder:text-zinc-700"
              />
              <button 
                type="submit"
                disabled={loading || !customAction.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-emerald-500 hover:text-emerald-400 transition-all disabled:opacity-0 hover:scale-110"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-1000">
            <div className="flex items-center gap-4 text-rose-500 orbitron tracking-[0.5em] text-2xl font-bold animate-pulse">
              <ShieldAlert size={32} />
              CRITICAL SYSTEM FAILURE
            </div>
            <button
              onClick={restartGame}
              className="w-full max-w-md bg-rose-600 hover:bg-rose-500 text-white font-bold orbitron py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(225,29,72,0.3)] uppercase tracking-widest active:scale-95"
            >
              Initialize Reboot Protocol
            </button>
          </div>
        )}

        {/* Footer Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
          <div className="flex items-center gap-6">
            <span>OS: VERCEL-EDGE-AETHERIS-v4</span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              RELAY: ENCRYPTED
            </span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
              <Package size={12} className="text-zinc-400" />
              <span className="text-zinc-400">MANIFEST:</span>
              <span className="text-zinc-200">
                {gameState.inventory.length > 0 ? gameState.inventory.join(' | ') : 'NULL'}
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 1.5s infinite linear;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
