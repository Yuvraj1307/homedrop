const mongoose=require("mongoose")
const connection=mongoose.connect("mongodb+srv://yuvraj:yuvraj@cluster0.hhjiny0.mongodb.net/homedrop?retryWrites=true&w=majority")
async function makeConnect(){
    await connection
    console.log("connected to DB")
}
module.exports={makeConnect}