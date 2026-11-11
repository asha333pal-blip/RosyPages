const mongoose = require("mongoose");
const Diary =require("./model/diary.js");


main().then(()=>{
    console.log("connection success");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Diary');

}

const entries = [
  { title: "Pehla din", content: "Aaj college gayi, maza aaya" },
  { title: "Coding", content: "Aaj MongoDB seekha" },
  { title: "Weekend", content: "Aaj ghar par rest kiya" },
  { title: "Exam", content: "Kal test hai, padhna padega" },
  { title: "Project", content: "Mini diary app bana rahi hu" }
];
Diary.insertMany(entries);