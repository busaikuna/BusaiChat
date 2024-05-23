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
    
        socket.emit("msg", { msg: input });
        console.log(input);
        inputElement.value = "";
    
        view.scrollTop = view.scrollHeight;
    }
}

socket.on("newMessage", (data) => {
    if(socket.id != data.id){
        console.log("oi");
        let msg = document.createElement("li");
        msg.classList.add("another-message")
        msg.textContent = data.msg;
        viewMessages.appendChild(msg);

        view.scrollTop = view.scrollHeight;
    }
});
