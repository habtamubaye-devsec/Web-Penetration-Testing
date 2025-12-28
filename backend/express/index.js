const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./config/DBconnect");
const connectCloudinary = require("./config/cloudinary");
const passport = require("passport");

const app = express();
connectDB();
connectCloudinary();
require("./config/passport");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(passport.initialize());

// importing routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const scanRoutes = require("./routes/scanReport");

// // using routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/scan", scanRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the backend server");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
