const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const uuid = require("uuid").v4;
const Image = require("./models/Images");
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
const mongoDB =
  "mongodb+srv://bhupesh:bhupesh@cluster0.axtn8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
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
const Notification = require("./models/Notification");

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
// Create an API for to upload files in message schema
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = uuid();
    const filePath = `images/${id}${ext}`;
    Image.create({ filePath: filePath }).then(() => {
      cb(null, filePath);
    });
  },
});
const upload = multer({ storage }); // or simply { dest: 'uploads/' }
app.use(express.static("public"));
app.use(express.static("uploads"));
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("req", req);
  console.log("🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨");
  console.log(res.json());
});

app.get("/images", (req, res) => {
  Image.find().then((images) => {
    return res.json({ status: "OK", images });
  });
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
      Notification.find({ reciever: user.user_id }).then((result) => {
        console.log("HISTORY OF NOTIFICATION", result);
        io.to(user.socket_id).emit("notification_history", result);
      });
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
      Notification.deleteMany({
        reciever: user.user_id,
        room_id: user.room_id,
      }).then((result) => {
        console.log("DELETED RESULT OF NOTIFICATION", result);
      });
    }
  });
  socket.on("sendMessage", (message, room_id, reciever, type, callback) => {
    const ObjectId = mongoose.Types.ObjectId;
    /**[send message event]
     * @argument message: the text based message
     * @argument room_id: the room_id
     * @argument sender: the sender (user_id & name)
     * @argument reciever: the reciever (user_id & name)
     */
    const user = getUser(socket.id);
    console.log("THE USER", user);
    console.log("THE USER", message, room_id, reciever, type);
    const msgToStore = {
      name: user.name,
      user_id: ObjectId(user.user_id),
      room_id: ObjectId(room_id),
      text: message,
      type: type,
    };
    console.log("message", msgToStore, "receiver \n", reciever);
    const msg = new Message({ ...msgToStore });
    msg.save().then((result) => {
      /** [how to send notifications]
       * If the receiver is live and connected to the same room then we send the message
       * Else send the notification
            save the notification [message/sender/reciever/room_id] all string values will be saved
            get the socket_id of the reciever
      */
      let reciever_user_obj = getUserById(reciever);
      let notification_obj = {
        sender: msgToStore.user_id, //{ user_id: msgToStore.user_id, username: msgToStore.name },
        room_id: msgToStore.room_id,
        text: msgToStore.text,
        type: msgToStore.type,
        reciever: reciever, //reciever_user_obj.user_id,
        timestamp: Date(),
      };
      const notifyObj = new Notification({
        sender: msgToStore.user_id,
        room_id: msgToStore.room_id,
        text: msgToStore.text,
        reciever: reciever,
      });
      notifyObj.save().then((result) => {
        console.log("SAVE NOTIFICATION", result);

        if (reciever_user_obj) {
          io.to(reciever_user_obj.socket_id).emit(
            "notification",
            notification_obj
          );
        }
      });
      console.log("notify-obj", notification_obj);

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
