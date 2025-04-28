const socketIo = require("socket.io");
const db = require("../../sql/config");
const ADMIN = "Admin";

const usersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

function socketHandler(server) {
  const io = socketIo(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? false
          : [`http://localhost:${process.env.NODEPORT}`],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.id} connected`); //Logging user ID

    // Upon connection - only to user
    // socket.emit("message", buildMsg(ADMIN, "Welcome to Chat App!"))

    socket.on("enterRoom", async ({ name, room, chatId, userId }) => {
      //Leave previous room
      console.log("Entering room");
      const prevRoom = getUser(socket.id)?.room;

      if (prevRoom) {
        socket.leave(prevRoom);
        io.to(prevRoom).emit(
          "message",
          buildMsg(ADMIN, `${name} has left the room`)
        );
      }

      const user = activateUser(socket.id, name, room);

      try {
        const checkRoom = await db.query(
          `
            SELECT "chatID" FROM "chatInfo" WHERE "chatID" = $1
            `,
          [chatId]
        );

        if (checkRoom.rows.length === 0) {
          const insertRoom = await db.query(
            `INSERT INTO "chatInfo" DEFAULT VALUES RETURNING "chatID"`
          );
          chatId = insertRoom.rows[0].chatID;
          console.log(`"Room ${room}" created in DB`);
        } else {
          chatId = checkRoom.rows[0].chatID;
          console.log(`Room already exists`);
        }
        console.log(chatId, userId);
        await db.query(
          `
          INSERT INTO "chatUsers" ("chatID", "userID")
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
          [chatId, userId]
        );
      } catch (err) {
        console.error("Error saving room:", err);
      }

      // Cannot update previous room users list until after the state
      // update in activate user
      if (prevRoom) {
        io.to(prevRoom).emit("userList", {
          users: getUsersInRoom(prevRoom),
        });
      }
      //Join room
      socket.join(user.room);
      //To user who joined
      // socket.emit('message', buildMsg(ADMIN, `You have joined the
      //   ${user.room} chat room`))
      //TO everyone else
      socket.broadcast
        .to(user.room)
        .emit("message", buildMsg(ADMIN, `${user.name} has joined the room`));
      //Update user list for room
      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });
      //Update rooms list for everyone
      io.emit("roomList", {
        rooms: getAllActiveRooms,
      });

      try {
        console.log("Fetching messages");
        const result = await db.query(
          `SELECT 
          messages."messageId",
          messages."senderId",
          users.username AS "senderName",
          messages."message",
          messages."timeSent",
          messages."timeRead",
          messages."mediaUrl",
          messages."mediaType"
          FROM messages
          JOIN users ON messages."senderId" = users.id
          WHERE messages."chatId" = $1
          ORDER BY messages."timeSent" DESC`,
          [chatId]
        );

        const recentMessages = result.rows.reverse().map((msg) => {
          return {
            name: msg.senderName, // replace with actual username if available
            text: msg.message,
            mediaUrl: msg.mediaUrl,
            mediaType: msg.mediaType,
            time: msg.timeSent,
          };
        });
        socket.emit("chatHistory", recentMessages);
        console.log(recentMessages);
      } catch (err) {
        console.error("Error fetching chat histroy", err);
      }
    });

    socket.on("message", async ({ name, text, userId, chatId, localId }) => {
      const user = getUser(socket.id);
      const room = user?.room;
      console.log("More test logs");

      if (room && chatId && userId) {
        console.log("Inserting message");
        io.to(room).emit("message", {
          name,
          text,
          mediaUrl: null,
          mediaType: null,
          time: new Date().toISOString(), // or you can keep using buildMsg if you modify it
          localId
        });
      } else {
        console.log("No message emitted");
      }
      try {
        await db.query(
          `
        INSERT INTO messages ("chatId", "senderId", message)
        VALUES ($1, $2, $3)
        `,
          [chatId, userId, text]
        );
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });

    socket.on("mediaMessage", async ({ name, userId, chatId, mediaUrl, mediaType, localId }) => {
      const user = getUser(socket.id);
      const room = user?.room;
    
      if (room && chatId && userId) {
        console.log("Inserting media message into database...");
    
        // Emit the media message to the room (so everyone sees it live)
        io.to(room).emit("message", {
          name,
          text: null, // No text for media-only message
          mediaUrl,
          mediaType,
          time: new Date().toISOString(),
          localId
        });
    
        try {
          // Save the media message into the database
          await db.query(
            `
            INSERT INTO messages ("chatId", "senderId", "mediaUrl", "mediaType")
            VALUES ($1, $2, $3, $4)
            `,
            [chatId, userId, mediaUrl, mediaType]
          );
        } catch (err) {
          console.error("Error saving media message:", err);
        }
      }
    });
    

    //User disconnects - to others
    socket.on("disconnect", () => {
      const user = getUser(socket.id);
      userLeavesApp(socket.id);

      //socket.broadcast.emit('message',
      //  `User ${socket.id.substring(0,5)} disconnected`)

      if (user) {
        io.to(user.room).emit(
          "message",
          buildMsg(
            ADMIN,
            `
          ${user.name} has left the room`
          )
        );

        io.to(user.room).emit("userList", {
          users: getUsersInRoom(user.room),
        });

        io.emit("roomList", {
          rooms: getAllActiveRooms(),
        });
      }
      console.log(`User ${socket.id} disconnected`);
    });

    //Listen for activity
    socket.on("activity", (name) => {
      const room = getUser(socket.id)?.room;
      if (room) {
        socket.broadcast.to(room).emit("activity", name);
      }
      //socket.broadcast.emit('activity', name)
    });
  });
}

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

//User functions
function activateUser(id, name, room) {
  const user = { id, name, room };
  usersState.setUsers([
    ...usersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  usersState.setUsers(usersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return usersState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return usersState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(usersState.users.map((user) => user.room)));
}

module.exports = socketHandler;
