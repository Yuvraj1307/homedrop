const express=require("express")
const { makeConnect } = require("./config/db")
const { User } = require("./model/userModel")
const jwt=require("jsonwebtoken")
 
const nodemailer = require('nodemailer');
require("dotenv").config()
const PDFDocument = require('pdfkit');
const { auth } = require("./middleware/auth");
const fs=require("fs");
const { reportModel } = require("./model/reprtModel");
const { resolve } = require("path");
const app=express()

makeConnect()
app.use(express.json())
 
 

app.get('/home',(req,res)=>{
    res.send({msg:"hello from server"})
})

app.post('/auth',async(req,res)=>{

    let {phone,email}=req.body
    try {
        let user=await User.findOne({phone,email})
        if(user){
            var token = jwt.sign({ userID:user._id, phone:user.phone,email:user.email }, 'secret');
            return res.status(201).send({phone:user.phone,token,email:user.email})
        }else{
            let newuser= new User({phone,email})
            await newuser.save()
            var token = jwt.sign({ userID:newuser._id, phone:newuser.phone,email:newuser.email  }, 'secret');
            return res.status(201).send({phone:newuser.phone,token,email:newuser.email})
        }
    } catch (error) {
        res.status(404).send({msg:"can't authenticate",err:error.message})
    }
 })


 app.post("/send-report",auth,async(req,res)=>{
    let {phone,email,userID}=req.body
    const doc = new PDFDocument();
    let date=new Date().toLocaleString()
  // Save the PDF to a file
  let pdfBuffer=await new Promise(resolve=>{
    const buffers=[]
    doc.on("data",buffer=>buffers.push(buffer))
    doc.on("end",()=>resolve(Buffer.concat(buffers)))
    doc.end()
  })
const pdfBase64=pdfBuffer.toString("base64")
 

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure:false,
        auth: {
          user: 'yogeshnda2018@gmail.com',
          pass: process.env.PASS,
        },
      });
      const mailOptions = {
        from: 'yogeshnda2018@gmail.com',
        to: email,
        subject: 'report',
        text: 'Please find your report attached.',
        attachments: [
          {
            filename: 'report.pdf',
            content:pdfBase64,

          },
        ],
      };

  

      try {
         
        await transporter.sendMail(mailOptions);         
        let rep=new reportModel({userID,email,phone,date})
        await rep.save()
        res.send({success:true});

      } catch (error) {
        console.error('Error sending SES email:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
      }
 })


 app.get("/get-history",auth,async(req,res)=>{
  let {userID}=req.body
  try {
     let result=await reportModel.find({userID})
     res.status(200).send({result})
  } catch (error) {
    res.status(404).send({err:error.message})
  }
 })
// app.listen(4500,()=>{
//     console.log("running on 4500")
// })
module.exports={app}
// serverless config credentials \
//   --provider aws \
//   --key AKIA4CCPA7H4V67T3BGY \
//   --secret 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


// serverless config credentials \
//   --provider aws \
//   --key AKIA6BXV2YDCN44QRTMR \
//   --secret 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