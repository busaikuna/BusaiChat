var socketURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : "");
var socket = io(socketURL);
console.log(socketURL)

document.addEventListener("keydown", (e)=>{
    if (e.key == "Enter"){
        submitar();
    }
})

window.addEventListener('load', () => {
    if (localStorage.getItem('username')) {
        window.location.href = "chat.html"
    }
})

let submit = document.querySelector(".submit")

submit.addEventListener("click", ()=>{
    submitar();
})

function submitar(){
    let username = document.querySelector(".username").value
    window.location.href = "chat.html"
    socket.emit("login", {nick: username})
    localStorage.setItem('username', username )
}