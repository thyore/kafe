// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const reservations = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('reservation', (reservation) => {
        reservations.push(reservation);
        // Emit the reservation to all connected clients
        io.emit('getReservations', reservations); // Send current reservations 
    });

    io.emit('getReservations', reservations);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});