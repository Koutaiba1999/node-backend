const mongoose = require("mongoose");
//user model avec attributs d'utilisateur 
const userSchema = new mongoose.Schema({
    name: { type: String, default: null },
    username: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    token: { type: String },
});

module.exports = mongoose.model("user", userSchema);