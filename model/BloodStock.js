const mongoose = require("mongoose");
//model du bloodStock avec les attributs
const bloodSchema = new mongoose.Schema({
    ville: { type: String, default: null },
    centre: { type: String, unique: true },
    bloodstock: { type: Array, default: null },

});

module.exports = mongoose.model("bloodstock", bloodSchema);