if(process.env.NODE_ENV!= "production"){
    require("dotenv").config();
}

const express=require("express");
const {createServer}=require("node:http");
const {Server}=require("socket.io");
const connectToServer=require("./controllers/socketManager");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");

const mongoose=require("mongoose");
const cors=require("cors");
const app=express();
const server=createServer(app);
const io=connectToServer(server);

app.set("port",(process.env.PORT || 8080));
app.use(cors());

app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));


const dbUrl=process.env.ATLASDB_URL;

async function main(){
    await mongoose.connect(dbUrl);
}

main()
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});
app.use("/users",userRouter);

server.listen(app.get("port"),()=>{
    console.log("server started");
})


