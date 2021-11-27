const mongoose = require("mongoose");

const bloodSchema = new mongoose.Schema({
    ville: { type: String, default: null },
    centre: { type: String, unique: true },
    bloodstock: { type: Array, default: null },

});

module.exports = mongoose.model("bloodstock", bloodSchema);