const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email", usernameLowerCase: true });

module.exports = mongoose.model("User", userSchema);