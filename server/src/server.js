const http = require("http");
const express = require("express");
const app = express();
const path = require("path");

const httpServer = http.createServer(app);
const io = require("socket.io")(httpServer);

let users = []

app.use(express.static(path.join(__dirname, "../../client/public/")));

io.on("connection", socket => {
    console.log(`Usuário conectado com ID: ${socket.id}`);
    console.log(`Endereço IP do usuário: ${socket.handshake.address}`);
    socket.on("msg", (mensagem)=>{
        console.log(mensagem)
        io.emit("newMessage", {msg: mensagem.msg, id: socket.id, nick: mensagem.username})
    })
    socket.on("login", (data)=>{
        users.push({[socket.id]: data.username})
    })
});

const PORT = process.env.PORT || 9000;

httpServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});