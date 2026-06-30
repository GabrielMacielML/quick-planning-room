import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/realtime';
import { Plus, Users } from 'lucide-react';

const CARD_SYSTEMS = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'],
};

export default function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [customCards, setCustomCards] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<keyof typeof CARD_SYSTEMS | 'custom'>('fibonacci');
  const [isCreating, setIsCreating] = useState(false);
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', id);
    }
    return id;
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsCreating(true);

    let cards = selectedSystem === 'custom'
      ? customCards.split(',').map(c => c.trim()).filter(Boolean)
      : CARD_SYSTEMS[selectedSystem];

    if (cards.length === 0) cards = CARD_SYSTEMS.fibonacci;

    try {
      const response = await createRoom(name, cards, userId);
      if (response.roomId) {
        navigate(`/room/${response.roomId}`, { state: { name } });
      }
    } catch (err) {
      alert('Erro ao criar sala.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark to-surface p-4">
      <div className="max-w-md w-full bg-surface/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Planning Poker
          </h1>
          <p className="text-white/50 mt-2">Crie uma sala e comece a estimar</p>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Seu Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Sistema de Cartas</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CARD_SYSTEMS) as Array<keyof typeof CARD_SYSTEMS>).map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => setSelectedSystem(sys)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedSystem === sys
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-dark/30 border-white/10 text-white/50 hover:bg-dark/50'
                  }`}
                >
                  {sys.charAt(0).toUpperCase() + sys.slice(1)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedSystem('custom')}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedSystem === 'custom'
                    ? 'bg-primary/20 border-primary text-white'
                    : 'bg-dark/30 border-white/10 text-white/50 hover:bg-dark/50'
                }`}
              >
                Customizado
              </button>
            </div>
          </div>

          {selectedSystem === 'custom' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Cartas (separadas por vírgula)</label>
              <input
                type="text"
                value={customCards}
                onChange={(e) => setCustomCards(e.target.value)}
                className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Ex: 1, 2, 3, 5, 8, 13"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !name}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Criar Sala
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
