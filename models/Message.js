const mongoose = require("mongoose");

function isMyFieldRequired() {
  return typeof this.myField === "string" ? false : true;
}
const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      required: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "users",

      required: true,
    },

    text: {
      type: String,

      // required: isMyFieldRequired,
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "room",

      required: true,
    },
    filePath: {
      type: String,
    },
    type: {
      type: String,
    },
  },

  { timestamps: true }
);
const Message = mongoose.model("message", messageSchema);
module.exports = Message;
