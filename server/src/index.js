import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";
import http from 'http'
import { initializeSocketIO } from "./conf/socket.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    const server = http.createServer(app);
    initializeSocketIO(server);
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
