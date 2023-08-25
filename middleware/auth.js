const jwt=require("jsonwebtoken")
const auth=(req,res,next)=>{
let token=req.headers.authorization
if(token){
    var decoded = jwt.verify(token, 'secret');
    req.body.phone=decoded.phone
    req.body.email=decoded.email
    req.body.userID=decoded.userID
    console.log(decoded)
    next()
}else{
    return res.status(403).send({msg:"axcess denied"})
}
}
module.exports={auth}