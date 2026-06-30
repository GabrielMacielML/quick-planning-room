export interface Player {
    id: string;
    userId: string;
    name: string;
    vote?: string | null;
    isSpectator: boolean;
}

export interface RoomData {
    id: string;
    players: Player[];
    cards: string[];
    areCardsRevealed: boolean;
    adminId: string;
}
