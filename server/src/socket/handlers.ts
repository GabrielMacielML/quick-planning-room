import { Server, Socket } from 'socket.io';
import { Room, Player } from '../types';
import { getRoom, saveRoom } from '../services/roomService';

export function setupSocketHandlers(io: Server) {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('create_room', async ({ name, cards, userId, roomId: requestedRoomId }: { name: string, cards: string[], userId: string, roomId?: string }, callback) => {
            const roomId = (requestedRoomId || Math.random().toString(36).substring(2, 8)).toUpperCase();
            const existingRoom = await getRoom(roomId);

            if (existingRoom) {
                let player = existingRoom.players.find(p => p.userId === userId);

                if (player) {
                    player.id = socket.id;
                    player.name = name;
                    player.isSpectator = false;
                } else {
                    existingRoom.players.push({
                        id: socket.id,
                        userId,
                        name,
                        vote: null,
                        isSpectator: false
                    });
                }

                await saveRoom(existingRoom);
                socket.join(roomId);
                io.to(roomId).emit('room_update', existingRoom);
                callback({ roomId, room: existingRoom });
                console.log(`Room reused: ${roomId} by ${name}`);
                return;
            }

            const room: Room = {
                id: roomId,
                players: [{
                    id: socket.id,
                    userId,
                    name,
                    vote: null,
                    isSpectator: false
                }],
                cards,
                areCardsRevealed: false,
                adminId: socket.id
            };

            await saveRoom(room);
            socket.join(roomId);
            callback({ roomId, room });
            console.log(`Room created: ${roomId} by ${name}`);
        });

        socket.on('join_room', async ({ roomId, name, isSpectator, userId }: { roomId: string, name: string, isSpectator: boolean, userId: string }, callback) => {
            const room = await getRoom(roomId);
            if (!room) {
                return callback({ error: 'Room not found' });
            }

            let player = room.players.find(p => p.userId === userId);

            if (player) {
                player.id = socket.id;
                player.name = name;
                player.isSpectator = isSpectator;
            } else {
                const newPlayer: Player = {
                    id: socket.id,
                    userId,
                    name,
                    vote: null,
                    isSpectator
                };
                room.players.push(newPlayer);
            }

            await saveRoom(room);
            socket.join(roomId);

            io.to(roomId).emit('room_update', room);
            callback({ room });
            console.log(`${name} joined room ${roomId}`);
        });

        socket.on('vote', async ({ roomId, value }: { roomId: string, value: string }) => {
            const room = await getRoom(roomId);
            if (room) {
                const player = room.players.find(p => p.id === socket.id);
                if (player) {
                    player.vote = value;
                    await saveRoom(room);
                    io.to(roomId).emit('room_update', room);
                }
            }
        });

        socket.on('reveal_cards', async ({ roomId }: { roomId: string }) => {
            const room = await getRoom(roomId);
            if (room) {
                room.areCardsRevealed = true;
                await saveRoom(room);
                io.to(roomId).emit('room_update', room);
            }
        });

        socket.on('reset_votes', async ({ roomId }: { roomId: string }) => {
            const room = await getRoom(roomId);
            if (room) {
                room.areCardsRevealed = false;
                room.players.forEach(p => p.vote = null);
                await saveRoom(room);
                io.to(roomId).emit('room_update', room);
            }
        });

        socket.on('disconnecting', async () => {
            for (const roomId of socket.rooms) {
                if (roomId !== socket.id) {
                    const room = await getRoom(roomId);
                    if (room) {
                        room.players = room.players.filter(p => p.id !== socket.id);

                        if (room.players.length === 0) {
                            // Opcional: Deletar sala se vazia
                            // await deleteRoom(roomId);
                        } else {
                            // Se o admin saiu, passar a bola para o próximo
                            if (room.adminId === socket.id) {
                                room.adminId = room.players[0].id;
                            }
                        }

                        await saveRoom(room);
                        io.to(roomId).emit('room_update', room);
                    }
                }
            }
            console.log('User disconnecting:', socket.id);
        });
    });
}
