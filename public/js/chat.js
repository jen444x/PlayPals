const local = window.location.hostname === 'localhost'
const prod = window.location.hostname === 'playpals-app.com'
const test = window.location.hostname.endsWith('.playpals-app.com')

let socketUrl

if (local) {
    socketUrl = 'ws://localhost:3000'
} else if (prod || test) {
    socketUrl = `wss://${window.location.hostname}`
} else {
    socketUrl = `ws://localhost:3000`
}

const socket = io(socketUrl)

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom  = document.querySelector('#room')
const activity  = document.querySelector('.activity')
const usersList  = document.querySelector('.user-list')
const roomList  = document.querySelector('.room-list')
const chatDisplay  = document.querySelector('.chat-display')

function sendMessage(e) {
    console.log("Message sending!")
    e.preventDefault()
    if (msgInput.value && nameInput.value && chatRoom.value) {
        socket.emit('message', { 
            text: msgInput.value,
            name: nameInput.value
        })
        msgInput.value = ""
        console.log("Sent..?")
    }
    msgInput.focus()
}

function enterRoom(e) {
    e.preventDefault()
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        })
    }
}

document.querySelector('.form-msg')
    .addEventListener('submit', sendMessage)

document.querySelector('.form-join')
    .addEventListener('submit', enterRoom)

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

// Listening for message
socket.on("message", ( data ) => {
    activity.textContent = ""
    const { name, text, time } = data
    const li = document.createElement('li')
    li.className = 'post'
    if (name === nameInput.value) li.className = 'post post--left'
    if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'
    if (name !== 'Admin') {
        li.innerHTML = `<div class="post__header 
        ${name === nameInput.value 
            ? 'post__header--user'
            : 'post__header--reply'
        }">
        <span class="post__header--name">${name}</span>
        <span class="post__header--time">${time}</span>
        </div>
        <div class="post__text">${text}</div>
        `
    } else {
        li.innerHTML = `<div class="post__text">${text}</div>`
    }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
})

socket.on('chatHistory', (messages) => {
    messages.forEach(({ name, text, time }) => {
        const li = document.createElement('li')
        li.className = 'post'

        if (name === nameInput.value) li.className = 'post post--left'
        if (name !== nameInput.value && name !== 'Admin') li.className = 'post post--right'

        if (name !== 'Admin') {
            li.innerHTML = `<div class="post__header 
            ${name === nameInput.value 
                ? 'post__header--user'
                : 'post__header--reply'
            }">
            <span class="post__header--name">${name}</span>
            <span class="post__header--time">${time}</span>
            </div>
            <div class="post__text">${text}</div>
            `
        } else {
            li.innerHTML = `<div class="post__text">${text}</div>`
        }

        document.querySelector('.chat-display').appendChild(li)
    })

    chatDisplay.scrollTop = chatDisplay.scrollHeight
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

socket.on('userList', ({ users }) => {
    showUsers(users)
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms)
})

function showUsers(users) {
    usersList.textContent = ''
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`
        users.forEach((user, i) => {
            usersList.textContent += `${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ","
            }
        })
    }
}

function showRooms(rooms) {
    roomList.textContent = ''
    if (rooms) {
        roomList.innerHTML = `<em>Active Rooms:</em>`
        rooms.forEach((room, i) => {
            roomList.textContent += `${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ","
            }
        })
    }
}