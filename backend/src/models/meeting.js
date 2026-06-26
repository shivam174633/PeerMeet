const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const meetingSchema=new Schema({
    user_id:{
        type:String,
        required:true,
    },
    meetingCode:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        required:true,
        default:Date.now(),
    }
})

module.exports=mongoose.model("Meeting",meetingSchema);