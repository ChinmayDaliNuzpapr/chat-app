const mongoose = require("mongoose");
// const
/**
 * message_obj ===> sender+room_id+text+read
 * receiver-user-object
 *
 * */
const NotificationSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    room_id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    reciever: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Notification = mongoose.model("notification", NotificationSchema);
module.exports = Notification;
