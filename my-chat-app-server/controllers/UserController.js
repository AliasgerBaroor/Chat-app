const router = require("express").Router();
const { validatePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken")
const userClient = require("../models/User");
const ChatClient = require("../models/Chat")
const http = require('http');
const express = require("express");

const { Server: SocketServer } = require('socket.io');

const app = express()
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
  },
});


io.on("connection", (socket) => {
    console.log("A chat participant connected:", socket.id);
  
    socket.on("msg:typing", (typingData) => {
      const { sender, state } = typingData;
      // console.log(`${sender} is ${state ? "typing..." : "stopped typing."}`);
  
      socket.broadcast.emit("msg:typing", { sender, state });
    });
  
  
    socket.on('msg:send', async (msg) => {
        console.log("messages", msg)
      try {
        // const response_add_message = await ChatClient.create(msg);
        // io.emit('msg:receive', response_add_message);
        io.emit('msg:receive', msg);
      } catch (error) {
        console.error('Failed to save message:', error);
  
        socket.emit('msg:error', { message: 'Failed to send message', error });
      }
    });
  
    socket.on("disconnect", () => {
      console.log("A chat participant disconnected:", socket.id);
    });
  });
  
router.post("/authenticate", async (req, res) => {
    let { username, password } = req.body;
    username = username.toLowerCase();
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }
    try {
        const response_find_user = await userClient.find({ username });
        if (!response_find_user || response_find_user.length === 0) {
            return res.status(401).json({ error: "Username or password is not valid." });
        }

        const user = response_find_user[0];

        if (!(await validatePassword(password, user.password))) {
            return res.status(401).json({ error: "Username or password is not valid." });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ error: "Server configuration error." });
        }


        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
        return res.status(200).json({ token });
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/participants", async (req, res) => {
    
    try {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { _id } = jwt.decode(token);
    if (!_id) {
        return res.status(401).json({ error: "Unable to find" });
    }

        const response_find_users = await userClient.find({})
        if (!response_find_users || response_find_users.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        const filtered_users = response_find_users.filter(
            (user) => user._id.toString() !== _id.toString()
        );
        return res.status(200).json({ participant: filtered_users, _id });

    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
})

router.get("/data/:_id", async (req, res) => {
    const { _id } = req.params
    if(!_id)   return res.status(404).json({ error: "Id not found." });
    try {
        const response_fetch_user = await userClient.findById({ _id })

        if (!response_fetch_user) return res.status(404).json({ error: "User not found." });

        return res.status(200).json(response_fetch_user);
        
    } catch (error) {
        console.error("Error during authentication:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
})

const PORT = 9023;
server.listen(PORT, () => {
  console.log(`Socket Server is running on http://localhost:${PORT}`);
});


module.exports = router;
