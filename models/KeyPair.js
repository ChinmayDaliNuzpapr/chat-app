const mongoose = require("mongoose");

const keyPairSchema = new mongoose.Schema({
  key_val: { type: Object },
});
const KeyPairVal = mongoose.model("keyPair", keyPairSchema, "keyPair");
module.exports = KeyPairVal;
