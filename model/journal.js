const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Journal", journalSchema);