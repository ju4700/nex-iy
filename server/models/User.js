const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash this in production
  role: { type: String, enum: ["founder", "team_lead", "intern", "member"], default: "member" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  permissions: [String],
});

module.exports = mongoose.model("User", userSchema);