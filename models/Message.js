const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     user_id: {
//       type: String,
//       required: true,
//     },
//     text: {
//       type: String,
//       required: true,
//     },
//     room_id: {
//       type: String,
//       required: true,
//     },
//     read: {
//       type: Boolean,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );
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

      required: true,
    },

    room_id: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "room",

      required: true,
    },

    type: {
      type: String,
    },
  },

  { timestamps: true }
);
const Message = mongoose.model("message", messageSchema);
module.exports = Message;
