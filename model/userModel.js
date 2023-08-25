const mongoose = require("mongoose");
let userschema = mongoose.Schema({
  phone: Number,
  email: String,
});

let User=mongoose.model("user",userschema)
module.exports={
    User
}