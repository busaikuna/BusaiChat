const http = require("http");
const express = require("express");
const app = express();
const path = require("path");
const puppeteer = require("puppeteer");
const socketIO = require("socket.io");

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

let gptProcess = false;
let imgProcess = false;

let users = [];



app.use(express.static(path.join(__dirname, "../../client/public/")));

io.on("connection", (socket) => {
    console.log(`Usuário conectado com ID: ${socket.id}`);
    console.log(`Endereço IP do usuário: ${socket.handshake.address}`);

    socket.on("online", (data) => {
        users.push({[socket.id]: data.user})
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
                        const browser = await puppeteer.launch({ headless: false });
                        const page = await browser.newPage();

                        await page.goto(
                            `https://www.google.com/search?sca_esv=cb7836cf60c7f552&q=${pesquisaImg}&tbm=isch&source=lnms&prmd=isvnbmtz&sa=X&ved=2ahUKEwjc9dCntauGAxW2qZUCHdNYDRIQ0pQJegQIERAB&biw=800&bih=600`,
                            { waitUntil: "networkidle2" }
                        );

                        await page.waitForSelector(
                            "#rso > div > div > div > div > div img",
                            { visible: true }
                        );

                        for (let i = 0; i < quantImg; i++) {
                            const imageUrl = await page.evaluate((index) => {
                                const imgs = document.querySelectorAll(
                                    "#rso > div > div > div > div > div img"
                                );
                                const img = imgs[index];
                                return img ? img.src : null;
                            }, i * 2);

                            if (imageUrl) {
                                io.emit("imgSearch", { imageUrl });
                                console.log("Imagem enviada:");
                            }
                        }

                        await browser.close()
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

        if (mensagem.msg.includes("./gpt")) {
            if (!gptProcess) {
                gptProcess = true;
                let processingGpt = "Estou pensando no que responder aqui, pera ai.";
                io.emit("gpt", { processingGpt });
                console.log(mensagem);

                (async () => {
                    try {
                        const browser = await puppeteer.launch({ headless: false});
                        const page = await browser.newPage();

                        await page.goto('https://chatgpt.com/', { waitUntil: 'networkidle2' });
                        await page.waitForSelector("#prompt-textarea", { visible: true });

                        await page.click("#prompt-textarea");
                        await page.type("#prompt-textarea", `${mensagem.msg.replace("./gpt", "")}`);
                        await page.keyboard.press("Enter");

                        await page.waitForSelector("div > main > div > div > div > div > div > div > div > div > div > div > div > div > div > span > button > svg", {visible: true});

                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        const resposta = await page.evaluate(() => {
                            const element = document.querySelector("div > div > main > div > div > div > div > div > div > div:nth-child(3) > div > div");
                            return element.textContent.replace("ChatGPTChatGPT", "");
                        });

                        console.log(resposta);
                        io.emit("gpt", { msg: resposta.replace("#fim", "") });
                        await browser.close()
                    } catch (error) {
                        console.error("Erro durante a execução do script:", error);
                    } finally {
                        gptProcess = false;
                    }
                })();
            } else {
                let response = "Calma ai, só consigo pensar em uma coisa por vez!! 😔";
                io.emit("gpt", { response });
            }
        }

        io.emit("newMessage", { msg: mensagem.msg, id: socket.id, nick: mensagem.username });
    });
});

const PORT = process.env.PORT || 9000;

httpServer.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
