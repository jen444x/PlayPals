const socketIo = require('socket.io')
const db = require('../../sql/config')
const ADMIN = "Admin";

const usersState = {
    users: [],
    setUsers: function (newUsersArray) {
      this.users = newUsersArray
    }
}

function socketHandler(server) {
    const io = socketIo(server, {
      cors: {
        origin: process.env.NODE_ENV === "production"
          ? false
          : [`http://localhost:${process.env.NODEPORT}`]
      }
    })


io.on('connection', socket => {
    console.log(`User ${socket.id} connected`) //Logging user ID
  
    // Upon connection - only to user
    socket.emit("message", buildMsg(ADMIN, "Welcome to Chat App!"))
  
    socket.on('enterRoom', async ({ name, room }) => {
      //Leave previous room
      const prevRoom = getUser(socket.id)?.room
  
      if (prevRoom) {
        socket.leave(prevRoom)
        io.to(prevRoom).emit('message', buildMsg(ADMIN, 
        `${name} has left the room`))
      }
  
      const user = activateUser(socket.id, name, room)

      try {
        const checkRoom = await db.query(`
            SELECT "roomName" FROM "chatInfo" WHERE "roomName" = $1
            `, [room]
        )

        if (checkRoom.rows.length === 0) {
            await db.query(
                `INSERT INTO "chatInfo" ("roomName") VALUES ($1)`, [room]
            )
            console.log(`"Room ${room}" created in DB`)
        } else {
            console.log(`Room already exists`)
        }
      } catch (err) {
        console.error("Error saving room:", err)
      }
  
      // Cannot update previous room users list until after the state
      // update in activate user
      if (prevRoom) {
        io.to(prevRoom).emit('userList', {
          users: getUsersInRoom(prevRoom)
        })
      }
      //Join room
      socket.join(user.room)
      //To user who joined
      socket.emit('message', buildMsg(ADMIN, `You have joined the
        ${user.room} chat room`))
      //TO everyone else
      socket.broadcast.to(user.room).emit('message', buildMsg(
        ADMIN, `${user.name} has joined the room`))
      //Update user list for room
      io.to(user.room).emit('userList', {
        users: getUsersInRoom(user.room)
      })
      //Update rooms list for everyone
      io.emit('roomList', {
        rooms: getAllActiveRooms
      })

      const result = await db.query(
        `SELECT * FROM messages
        WHERE "chatId" = $1
        ORDER BY "messageId" DESC LIMIT 10`,
        ['1']
      );
      const recentMessages = result.rows.reverse().map(msg => {
        return {
            name: 'User', // replace with actual username if available
            text: msg.message,
            time: new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            }).format(new Date())
        }
    });
      socket.emit('chatHistory', recentMessages);
      console.log(recentMessages)
    })
  
    socket.on('message', async ({ name, text }) => {
      const room = getUser(socket.id)?.room

      if (room) {
        io.to(room).emit('message', buildMsg(name, text))
      }
      try {
        const query = `
        INSERT INTO messages ("chatId", "sentBy", message)
        VALUES ($1, $2, $3)
        `
        await db.query(query, ['1', '1', text]);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    })
  
    //User disconnects - to others
    socket.on('disconnect', () => {
      const user = getUser(socket.id)
      userLeavesApp(socket.id)
  
      //socket.broadcast.emit('message', 
      //  `User ${socket.id.substring(0,5)} disconnected`)
  
      if (user) {
        io.to(user.room).emit('message', buildMsg(ADMIN, `
          ${user.name} has left the room`))
  
          io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
          })
  
          io.emit('roomList', {
            rooms: getAllActiveRooms()
          })
      }
      console.log(`User ${socket.id} disconnected`)
    })
  
    //Listen for activity
    socket.on('activity', (name) => {
      const room = getUser(socket.id)?.room
      if (room) {
        socket.broadcast.to(room).emit('activity', name)
      }
      //socket.broadcast.emit('activity', name)
    })
  })
}

function buildMsg(name, text) {
    return { 
      name, 
      text, 
      time: new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }).format(new Date())
    }
  }
  
  //User functions
  function activateUser(id, name, room) {
    const user = { id, name, room }
    usersState.setUsers([
      ...usersState.users.filter(user => user.id !== id),
      user
    ])
    return user
  }
  
  function userLeavesApp(id) {
    usersState.setUsers(
      usersState.users.filter(user => user.id !== id)
    )
  }
  
  function getUser(id) {
    return usersState.users.find(user => user.id === id)
  }
  
  function getUsersInRoom(room) {
    return usersState.users.filter(user => user.room === room)
  }
  
  function getAllActiveRooms() {
    return Array.from(new Set(usersState.users.map(user => user.room)))
  }

module.exports = socketHandler;