import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoomHeaderProps {
    roomId: string;
    playerCount: number;
}

export default function RoomHeader({ roomId, playerCount }: RoomHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 bg-surface rounded-lg border border-white/10 hover:bg-white/5 transition-all text-white/70 hover:text-white"
                    title="Voltar para o início"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div>
                    <h1 className="text-2xl font-bold">Sala #{roomId}</h1>
                    <p className="text-white/50 text-sm">Planning Poker</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium">
                    {playerCount} Jogadores
                </div>
            </div>
        </div>
    );
}
