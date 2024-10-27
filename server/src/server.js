const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const puppeteer = require("puppeteer");
const socketIO = require("socket.io");

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

let imgProcess = false;
let users = [];

app.use(express.static(path.join(__dirname, "../../client/public/")));

io.on("connection", (socket) => {
    console.log(`Usuário conectado com ID: ${socket.id}`);
    console.log(`Endereço IP do usuário: ${socket.handshake.address}`);

    socket.emit("initialUsers", users);

    socket.on('online', (data) => {
        users.push({ id: socket.id, data: data });
        socket.broadcast.emit('online', { user: data.user, id: socket.id });
        console.log(users);
    });
    
    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id);
        socket.broadcast.emit('offline', { id: socket.id });
        console.log(users);
    });

    socket.on("msg", async (mensagem) => {
        if (mensagem.msg.includes("./img")) {
            if (!imgProcess) {
                imgProcess = true;
                console.log(mensagem);

                let replaceSearch = mensagem.msg.replace("./img ", "").trim();
                const pesquisaImg = replaceSearch.substring(1).replace(" ", "+");
                const quantImg = parseInt(replaceSearch[0]);

                (async () => {
                    try {
                        const browser = await puppeteer.launch({
                            headless: true,
                            args: ['--disable-gpu', '--no-sandbox']
                        });
                        const page = await browser.newPage();
                        
                        await page.setRequestInterception(true);
                        page.on('request', (request) => {
                            if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
                                request.abort();
                            } else {
                                request.continue();
                            }
                        });

                        await page.goto(
                            `https://www.google.com/search?sca_esv=cb7836cf60c7f552&q=${pesquisaImg}&tbm=isch&source=lnms&prmd=isvnbmtz&sa=X&ved=2ahUKEwjc9dCntauGAxW2qZUCHdNYDRIQ0pQJegQIERAB&biw=800&bih=600`,
                            { waitUntil: "domcontentloaded" }
                        );

                        for (let i = 0; i < quantImg; i++) {
                            const imageUrl = await page.evaluate((index) => {
                                const imgs = document.querySelectorAll("#rso > div > div > div > div > div img");
                                const img = imgs[index];
                                return img ? img.src : null;
                            }, i * 2);

                            if (imageUrl) {
                                io.emit("imgSearch", { imageUrl });
                                console.log("Imagem enviada:", imageUrl);
                            }
                        }

                        await browser.close();
                    } catch (error) {
                        console.error("Erro durante a execução do script:", error);
                    } finally {
                        imgProcess = false;
                    }
                })();
            } else {
                let response = "Calma ai cara, eu sou só um!! 😡";
                io.emit("imgSearch", { response });
            }
        }

        io.emit("newMessage", { msg: mensagem.msg, id: socket.id, nick: mensagem.username });
    });
});

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
