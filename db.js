const mongoose = require("mongoose");
const mongoURL = process.env.MONGODB_URL_LOCAL;
//const mongoURL="mongodb+srv://itskirankumar18:Kirankumar@9611@cluster0.tkw29.mongodb.net/";
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Make DB connection
const db=mongoose.connection;

// Add Event handlers
db.on("connected", ()=>{
    console.log("Connected to MongoDB Server");
})
db.on("error", (error)=>{
    console.log("Connection Error" , error);
})
db.on("disconnected", ()=>{
    console.log("Disconnected");
})

module.exports=db;

