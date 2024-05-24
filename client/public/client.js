var socketURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : "");
var socket = io(socketURL);
console.log(socketURL)

let button = document.querySelector(".button");
let view = document.querySelector(".view");
let viewMessages = document.querySelector(".view-messages")

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

    if(input){
        let msg = document.createElement("li");
        msg.classList.add("your-message")
        msg.textContent = input;
        viewMessages.appendChild(msg);
    
        socket.emit("msg", { msg: input, username: localStorage.getItem('username')});
        console.log(input);
        inputElement.value = "";
    
        view.scrollTop = view.scrollHeight;
    }
}

socket.on("newMessage", (data) => {
    if(socket.id != data.id){
        const messages = document.querySelector('.view-messages')

        messages.innerHTML += `
            <div class="another-div-message">
                <li class="username">${data.nick}</li>
                <li class="another-message">${data.msg}</li>
            </div>
        `
        view.scrollTop = view.scrollHeight;
    }
});
