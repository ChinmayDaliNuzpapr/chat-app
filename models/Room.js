const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // will store the _id of the users
  user_1: {
    type: String,
    required: true,
  },
  user_2: {
    type: String,
    required: true,
  },
});
const Room = mongoose.model("room", roomSchema);
module.exports = Room;
