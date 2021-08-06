const mongoose = require("mongoose");
// const
function isMyFieldRequired() {
  return typeof this.myField === "string" ? false : true;
}
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
      // required: isMyFieldRequired,
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
