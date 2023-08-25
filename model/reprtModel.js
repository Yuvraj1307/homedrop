const mongoose = require("mongoose");
let report = mongoose.Schema({
  phone: Number,
  email: String,
  userID:String,
  date:String
});

let reportModel=mongoose.model("report",report)
module.exports={
    reportModel
}