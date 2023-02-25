import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import * as dotenv from 'dotenv'

const app = express();
const port = process.env.PORT || 8080 ;
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
dotenv.config()

// app.use(cors())

let dbUri = process.env.DB_URI
mongoose.connect(dbUri);

let chatSchema = new mongoose.Schema({
  myName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

let chatModel = mongoose.model("chat", chatSchema);

server.listen(port, () => {
  console.log(`server is running on ${port}`);
});

io.on("connection", (socket) => {
  console.log(socket.id);
  chatModel.find({} ,(err,data) => {
    if (!err) {
        socket.emit('msgs',data)
    }else{
      console.log(err);
    }
  })

  socket.on("msg", (data) => {
    console.log(data);
    chatModel.create({
      myName: data.myName,
      text: data.text,
    });
    io.emit("msg", data);
  });

  socket.on("delete", () => {
    chatModel.deleteMany({}, () => {
      io.emit("delete", 'Data Cleared');
    })
  });

});
