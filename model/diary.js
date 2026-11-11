const mongoose = require("mongoose");



const diarySchema = new mongoose.Schema({
    title: { type: String,
         required: true,
          trim: true,
           maxLength: 100 },
    content: {
    type: String,
    required: true,
    maxLength: 50000
},
    created_at:{
        type:Date,
        default:Date.now

    },
    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
journal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Journal",
    required: true
}

});
const Diary = mongoose.model("Diary", diarySchema);

module.exports = Diary;