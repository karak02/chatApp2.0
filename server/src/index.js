import express from "express";
import "dotenv/config";
import cors from "cors";
import Routes from "./routes/route.js";
import { Server } from "socket.io";
import { createServer } from "http";
import { setupSocket } from "./socket.js";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import redis from "./config/redis.js";
import { instrument } from "@socket.io/admin-ui";
import { connectKafkaProducer } from "./config/kafka.config.js";
import { consumeMessages } from "./helper.js";

const app = express();
const PORT = process.env.PORT || 7000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_APP_URL, "https://admin.socket.io"],
  },
  adapter: createAdapter(redis),
});

// Instrument the socket.io server for admin UI
instrument(io, {
  auth: false,
  mode: "development",
});

// Setup socket connection
setupSocket(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Root route
app.get("/", (req, res) => {
  return res.send("It's working Guys 🙌");
});

// Connect Kafka producer
connectKafkaProducer().catch((err) => console.log("Kafka Producer error", err));

// Start consuming messages
consumeMessages(process.env.KAFKA_TOPIC).catch((err) =>
  console.log("The Kafka Consume error", err)
);

// API Routes
app.use("/api", Routes);

// Start the server
server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
