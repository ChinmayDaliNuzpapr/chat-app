const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.String, unique: true },
  user_1: {
    type: String,
    required: true,
  },
  user_2: {
    type: String,
    required: true,
  },
});
const Room = mongoose.model("room", roomSchema, "room");
module.exports = Room;
