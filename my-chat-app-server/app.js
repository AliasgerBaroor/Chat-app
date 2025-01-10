const express = require("express");
const cors = require("cors");
const ngrok = require("ngrok")
const routes = require("./config/routes")
const http = require('http');

const { Server: SocketServer } = require('socket.io');

const app = express();
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);

const port = process.env.PORT || 8023;

server.listen(port, async () => {
    console.log("Server running on port: http://localhost:" + port);

    try {
        const ngrokUrl = await ngrok.connect(port);
        console.log(`Ngrok tunnel established at: ${ngrokUrl}`);
    } catch (error) {
        console.error(`Couldn't establish Ngrok tunnel:`, error);
    }
});