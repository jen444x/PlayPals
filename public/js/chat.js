const socket = io('ws://localhost:3000')

const activity = document.querySelector('.activity')
const msgInput = document.querySelector('input')


function sendMessage(e) {
    console.log("Message sending!")
    e.preventDefault()
    //const input = document.querySelector('input')
    if (msgInput.value) {
        socket.emit('message', msgInput.value)
        msgInput.value = ""
    }
    msgInput.focus()
}

document.querySelector('form')
    .addEventListener('submit', sendMessage)

// Listening for message
socket.on("message", ( data ) => {
    activity.textContent = ""
    const li = document.createElement('li')
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', socket.id.substring(0,5))
})

//Typing indicator
let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    //Clear after 3 seconds
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})