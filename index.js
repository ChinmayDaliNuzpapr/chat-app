const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
var corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
const authRoutes = require("./routes/authRoutes");
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);

const http = require("http").createServer(app);
const mongoose = require("mongoose");
const socketio = require("socket.io");
const io = socketio(http);
// const path = require('path');
const mongoDB =
  "mongodb+srv://bhupesh:bhupesh@cluster0.axtn8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
/* BELOW IS THE LOCAL PSEUDO chat-db URL */
// "mongodb+srv://bhupesh:bhupesh@cluster0.axtn8.mongodb.net/myChatDb?retryWrites=true&w=majority";
/* BELOW IS THE LOCAL URL */
// const mongoDB = 'mongodb://localhost:27017/boilerplate'

mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("connected"))
  .catch((err) => console.log(err));
const {
  addUser,
  getUser,
  removeUser,
  getUserById,
  updateUserByRoomId,
} = require("./helper");
const Message = require("./models/Message");
const PORT = process.env.PORT || 5001;
const Room = require("./models/Room");
// Room.create({name:"135weqwerwqre",user_1:"",user_2:""})

app.get("/set-cookies", (req, res) => {
  res.cookie("username", "Tony");
  res.cookie("isAuthenticated", true, { maxAge: 24 * 60 * 60 * 1000 });
  res.send("cookies are set");
});
app.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;
  console.log(cookies);
  res.json(cookies);
});

console.log("IT DOES WORK", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

io.on("connection", (socket) => {
  console.log("THE SOCKET ID ", socket.id);
  /* as soon as a user connects to the server we add that user in our dynamic memory */
  socket.on("online", ({ name, user_id }) => {
    console.log(" name, user_id", name, user_id);
    // This is will work when user is chatting with another user but not in the same room
    const { error, user } = addUser({
      socket_id: socket.id,
      name,
      user_id,
    });
    // socket.join(room_id);
    if (error) {
      // NOTE: SEND A NOTIFICATION that there was a socket error or retry the socket-connection.
      console.log("join error", error);
    } else {
      console.log("join user", user);
    }
  });
  socket.on("join", ({ name, room_id, user_id }) => {
    /**[join event] 
     * when a user joins a particular room we update the
        user_obj in our dynamic memory to store the room_id
    */
    console.log("THE JOIN INPUT", name, room_id, user_id);
    const { error, user } = updateUserByRoomId(user_id, room_id);
    socket.join(room_id);
    if (error) {
      // NOTE: SEND A NOTIFICATION that there was a socket error or retry the socket-connection.
      console.log("join error", error);
    } else {
      console.log("join user", user);
    }
  });
  socket.on("sendMessage", (message, room_id, callback) => {
    /**[send message event]
     * @argument message: the text based message
     * @argument room_id: the room_id
     * @argument sender: the sender (user_id & name)
     * @argument reciever: the reciever (user_id & name)
     */
    const user = getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message,
    };
    console.log("message", msgToStore);
    const msg = new Message({ ...msgToStore, read: false });
    msg.save().then((result) => {
      /** [how to send notifications]
       * If the receiver is live and connected to the same room then we send the message
       * Else send the notification
            save the notification [message/sender/reciever/room_id] all string values will be saved
            get the socket_id of the reciever
      */
      console.log("⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐");
      console.log(getUserById(msgToStore.user_id));
      console.log("------------------------------------------------");
      io.to(room_id).emit("message", result);
      callback();
    });
  });
  socket.on("get-messages-history", (room_id) => {
    Message.find({ room_id }).then((result) => {
      socket.emit("output-messages", result);
    });
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`listening on :${PORT}`);
});
