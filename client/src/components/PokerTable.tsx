import clsx from 'clsx';
import type { Player } from '../types';

interface PokerTableProps {
    players: Player[];
    areCardsRevealed: boolean;
    average: string | null;
}

export default function PokerTable({ players, areCardsRevealed, average }: PokerTableProps) {
    return (
        <div className="relative bg-surface/30 rounded-[3rem] border-4 border-white/5 p-8 md:p-16 min-h-[300px] flex items-center justify-center mb-12">
            {areCardsRevealed ? (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="text-sm text-white/50 uppercase tracking-wider mb-2">Média</div>
                    <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {isNaN(parseFloat(average || '')) ? '-' : average}
                    </div>
                </div>
            ) : (
                <div className="text-center text-white/30 font-medium">
                    {players.filter(p => p.vote).length} de {players.length} votaram
                </div>
            )}

            <div className="absolute inset-0 pointer-events-none">
                {players.map((player, i) => {
                    const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2;
                    const radius = 42;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);

                    return (
                        <div
                            key={player.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500"
                            style={{ left: `${x}%`, top: `${y}%` }}
                        >
                            <div className={clsx(
                                "w-12 h-16 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300",
                                areCardsRevealed && player.vote
                                    ? "bg-white text-dark font-bold text-xl transform rotate-0"
                                    : player.vote
                                        ? "bg-primary border-2 border-white/20 transform rotate-180"
                                        : "bg-white/5 border-2 border-dashed border-white/10"
                            )}>
                                {areCardsRevealed && player.vote}
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-xs font-medium bg-dark/80 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                    {player.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
