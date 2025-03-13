require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const redis = require("redis");
const helmet = require("helmet");
const { initSocket } = require("./sockets");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const taskRoutes = require("./routes/tasks");
const reportRoutes = require("./routes/reports");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(helmet());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);

initSocket(io, redisClient);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));