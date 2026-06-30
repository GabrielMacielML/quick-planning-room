import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initRedis } from './services/roomService';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

initRedis();
setupSocketHandlers(io);

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
