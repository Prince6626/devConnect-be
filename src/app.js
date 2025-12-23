const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const http = require("http");

app.use(
  cors({
    origin: "https://dev-connect-fe.vercel.app", // frontend URL (adjust if needed)
    credentials: true, // allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const FpRouter = require("./routes/forgetPassword");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", FpRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connected ...");
    server.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch(() => {
    console.log("Database not connected!!");
  });
