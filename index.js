const express=require("express")
const { makeConnect } = require("./config/db")
const { User } = require("./model/userModel")
const jwt=require("jsonwebtoken")
// const AWS = require('aws-sdk');
// const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const nodemailer = require('nodemailer');
require("dotenv").config()
const PDFDocument = require('pdfkit');
const { auth } = require("./middleware/auth");
const fs=require("fs");
const { reportModel } = require("./model/reprtModel");
const app=express()

makeConnect()
app.use(express.json())
const pass = process.env.PASS;
     app.get('/', (req, res) => {
        res.send(`Environment variable PASS: ${pass}`);
      });
 // const ses = new SESClient({ region: 'us-east-1' });
// AWS.config.update({ region: 'us-east-1' });  
// const ses = new AWS.SES();
// const sns = new AWS.SNS();

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
doc.pipe(fs.createWriteStream('report.pdf')); // Save the PDF to a file

// Add content to the PDF
doc.fontSize(16).text('PDF Report', { align: 'center' });
doc.fontSize(12).text('Generated on: ' + date, { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12).text(`User Email:${email}, User Phone: ${phone}`, { align: 'center' });

// End the PDF generation
doc.end();
    // const doc = new PDFDocument();
    // let date=Date()
    // doc.text(`phone: ${phone}, email:${email}, date:${date}`);
    // const pdfBuffer = await new Promise(resolve => {
    //     const chunks = [];
    //     doc.on('data', chunk => chunks.push(chunk));
    //     doc.on('end', () => resolve(Buffer.concat(chunks)));
    //   });

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
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
            path: "report.pdf",

          },
        ],
      };

    // const sesParams = {
    //     Destination: {
    //       ToAddresses: [email],
    //     },
    //     Message: {
    //       Body: {
    //         Text: {
    //           Data: 'Please find your report code attached.',
    //         },
    //       },
    //       Subject: {
    //         Data: 'Your report',
    //       },
    //     },
    //     Source: 'yogeshnda2018@gmail.com', // Replace with your SES sender email
    //     Attachments: [
    //       {
    //         Filename: 'report.pdf',
    //         Content: pdfBuffer,
    //         ContentType: 'application/pdf',
    //       },
    //     ],
    //   };

      try {
         
        await transporter.sendMail(mailOptions);        // await ses.send(new SendEmailCommand(sesParams));
        let rep=new reportModel({userID,email,phone,date})
        await rep.save()
        res.json({ message: 'email sent' });

      } catch (error) {
        console.error('Error sending SES email:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
      }
 })
// app.listen(4500,()=>{
//     console.log("running on 4500")
// })
module.exports={app}
// serverless config credentials \
//   --provider aws \
//   --key AKIA4CCPA7H47DFQZBZL \
//   --secret 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