const mongoose = require("mongoose");
// const
/**
 * message_obj ===> sender+room_id+text+read
 * receiver-user-object
 *
 * */
const NotificationSchema = new mongoose.Schema(
  {
    message_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model("message", NotificationSchema);
module.exports = Notification;
