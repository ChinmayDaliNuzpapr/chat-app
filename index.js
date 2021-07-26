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
const { addUser, getUser, removeUser } = require("./helper");
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
  socket.on("create-room", (val) => {
    console.log("THE CREATE ROOM EMITTER", val);
    // const server_save_keyPair = new KeyPairVal({
    //   key_val: {
    //     publicKeyJwk: val.publicKeyJwk,
    //     privateKeyJwk: val.privateKeyJwk,
    //   },
    // });
    // server_save_keyPair
    //   .save()
    //   .then((res) => console.log("THE KEY-PAIR SAVED", res));
  });
  socket.on("join", ({ name, room_id, user_id }) => {
    const { error, user } = addUser({
      socket_id: socket.id,
      name,
      room_id,
      user_id,
    });
    socket.join(room_id);
    if (error) {
      console.log("join error", error);
    } else {
      console.log("join user", user);
    }
  });
  socket.on("sendMessage", (message, room_id, callback) => {
    const user = getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message,
    };
    console.log("message", msgToStore);
    const msg = new Message(msgToStore);
    msg.save().then((result) => {
      io.to(room_id).emit("message", result);
      callback();
    });
  });
  socket.on("get-messages-history", (room_id) => {
    Message.find({ room_id })
      // .sort({ createdAt: -1 })
      // .limit(10)
      .then((result) => {
        // console.log("THE RESULT \n", result);
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
