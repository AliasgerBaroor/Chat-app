require("../config/database")

const mongoose = require("mongoose")

const ChatSchema = mongoose.Schema({
    sender  : String,
    message  : String,
    timestamp : { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Chat", ChatSchema)