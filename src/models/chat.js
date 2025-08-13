const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text : {
        type : String,
        required : true
    }
},{timestamps : true})

const chatSchema = new mongoose.Schema({
    participants : [{ // [{}] did this because there will be multiple participants so participants will be an array
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }],
    messages : [messageSchema]
    // there is no sender or reciever becuase i do not want to restrict chat to 2 people

})
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;