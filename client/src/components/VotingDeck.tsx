import clsx from 'clsx';

interface VotingDeckProps {
    cards: string[];
    myVote: string | null;
    areCardsRevealed: boolean;
    onVote: (card: string) => void;
}

export default function VotingDeck({ cards, myVote, areCardsRevealed, onVote }: VotingDeckProps) {
    return (
        <div className="flex flex-wrap justify-center gap-3">
            {cards.map((card) => (
                <button
                    key={card}
                    onClick={() => onVote(card)}
                    disabled={areCardsRevealed}
                    className={clsx(
                        "w-16 h-24 rounded-xl font-bold text-xl transition-all transform hover:-translate-y-2 hover:shadow-xl",
                        myVote === card
                            ? "bg-primary text-white ring-4 ring-primary/30 shadow-lg shadow-primary/40 -translate-y-4"
                            : "bg-surface border border-white/10 hover:border-primary/50 hover:bg-surface/80"
                    )}
                >
                    {card}
                </button>
            ))}
        </div>
    );
}
