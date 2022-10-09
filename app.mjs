import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const port = 8080 || process.env.port;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors())

let dbUri =
  "mongodb+srv://obaidmuneer:Abc123@cluster0.jop1spc.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(dbUri);

let chatSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

let chatModel = mongoose.model("chat-app", chatSchema);

app.get('/port', (req,res) => {
    res.send({data : port})
})

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

io.on("connection", (socket) => {
  console.log(socket.id);
  chatModel.find({} ,(err,data) => {
    if (!err) {
        socket.emit('msgs',data)
    }
  })

  socket.on("msg", (msg) => {
    chatModel.create({
      text: msg,
    });
    io.emit("msg", msg);
  });
});
