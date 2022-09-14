const http = require("http");
const https = require("https");
const express = require("express");
const fs = require("fs");
const socketIo = require("socket.io");
const app = express();

const options = {
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem'),
};
const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);
const io = socketIo(httpsServer);


app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static('public'));
app.get("/client2", (_, res) => {
    res.render('client2')
});
app.get("/client1", (_, res) => {
    res.render('client1')
});
app.get("/videochat", (_, res) => {
    res.render('room')
});


io.on('connection', (socket) => {
    socket.on('join_room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});

httpServer.listen(8080);
httpsServer.listen(10000);