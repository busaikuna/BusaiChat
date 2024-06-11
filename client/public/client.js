var socketURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : "");
var socket = io(socketURL);
console.log(socketURL)


function online() {
    socket.emit("online", { id: socket.id, user: localStorage.getItem('username') })
}

let button = document.querySelector(".button");
let view = document.querySelector(".view");
let viewMessages = document.querySelector(".view-messages")
let on = document.querySelector(".on")
let onDiv = document.querySelector(".on-div")
let disconnect = document.querySelector(".disconnect")

const messages = document.querySelector('.view-messages')

let clickOn = false;
on.addEventListener("click", () => {
    if (clickOn == false) {
        clickOn = true
        onDiv.style.display = "block"
    } else {
        clickOn = false
        onDiv.style.display = "none"
    }
})

disconnect.addEventListener("click", ()=>{
    localStorage.removeItem("username")
    window.location.href = socketURL
})

button.addEventListener("click", () => {
    send();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        send();
    }
});

function send() {
    let inputElement = document.querySelector(".input");
    let input = inputElement.value;

    if (input) {
        let msg = document.createElement("li");
        msg.classList.add("your-message")
        msg.textContent = input;
        viewMessages.appendChild(msg);

        socket.emit("msg", { msg: input, username: localStorage.getItem('username') });
        console.log(input);
        inputElement.value = "";

        view.scrollTop = view.scrollHeight;
    }
}

socket.on("online", (data) => {
    if (data.id != socket.id) {
        onDiv.innerHTML += `<div class="user-on">
        <p>${data.user}</p>
        <div class="green-ball"></div>
        </div>`
    }

})

socket.on("imgSearch", (data) => {
    if (data.response) {
        messages.innerHTML += `
            <div class="another-div-message">
                <li class="username">bot IMG</li>
                <li class="another-message">${data.response}</li>
            </div>
        `
        view.scrollTop = view.scrollHeight;
    } else {
        messages.innerHTML += `
    <div class="another-div-message">
    <li class="username">Bot IMG</li>
    <img class="sendImg" src="${data.imageUrl}"></img>
</div>
    `
        view.scrollTop = view.scrollHeight;
        console.log(data)
    }
})

socket.on("gpt", (data) => {
    if (data.processingGpt) {

        messages.innerHTML += `
            <div class="another-div-message">
                <li class="username">CHAT GPT</li>
                <li class="another-message">${data.processingGpt}</li>
            </div>
        `
        view.scrollTop = view.scrollHeight;
    } else if (data.response) {

        messages.innerHTML += `
            <div class="another-div-message">
                <li class="username">CHAT GPT</li>
                <li class="another-message">${data.response}</li>
            </div>
        `
        view.scrollTop = view.scrollHeight;
    } else {

        messages.innerHTML += `
        <div class="another-div-message">
            <li class="username">CHAT GPT</li>
            <li class="another-message">${data.msg}</li>
        </div>
    `
        view.scrollTop = view.scrollHeight;
    }
})


socket.on("newMessage", (data) => {
    if (socket.id != data.id) {

        messages.innerHTML += `
            <div class="another-div-message">
                <li class="username">${data.nick}</li>
                <li class="another-message">${data.msg}</li>
            </div>
        `
        view.scrollTop = view.scrollHeight;
    }
});
