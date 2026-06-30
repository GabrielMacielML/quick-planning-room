import { Eye, RotateCcw } from 'lucide-react';

interface RoomControlsProps {
    onReveal: () => void;
    onReset: () => void;
    areCardsRevealed: boolean;
}

export default function RoomControls({ onReveal, onReset, areCardsRevealed }: RoomControlsProps) {
    return (
        <div className="flex justify-center gap-4 mb-12">
            <button
                onClick={onReveal}
                disabled={areCardsRevealed}
                className="flex items-center gap-2 px-6 py-3 bg-white text-dark font-bold rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/10"
            >
                <Eye className="w-5 h-5" />
                Revelar Cartas
            </button>
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-3 bg-surface border border-white/10 hover:bg-white/5 font-bold rounded-xl transition-all"
            >
                <RotateCcw className="w-5 h-5" />
                Nova Rodada
            </button>
        </div>
    );
}
