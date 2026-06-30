export interface Player {
    id: string;
    userId: string;
    name: string;
    vote?: string | null;
    isSpectator: boolean;
}

export interface Room {
    id: string;
    players: Player[];
    cards: string[];
    areCardsRevealed: boolean;
    adminId: string;
}
