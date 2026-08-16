const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const cors = require('cors');

const buildPath = path.join(__dirname, "../frontend/dist");
const landingBuildPath = path.join(__dirname, "../landing_pge/dist");
const app = express();

const http = require("http").Server(app);
const PORT = process.env.PORT || 5000;

const { Server } = require("socket.io");
const io = new Server(http, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
app.set("io", io);
io.on("connection", (socket) => {
  socket.on("join_admin", () => {
    socket.join("admin_panel");
  });
});

const db = require('./models');
require('./models/associations')(db);

// Ensure singular property models and dealer_requirements are synchronized
if (db.property) db.property.sync({ alter: false });
if (db.property_images) db.property_images.sync({ alter: false });
if (db.dealer_requirements) db.dealer_requirements.sync({ alter: false });

const AdminRouter = require('./routes/route_admin');
const apisRouter = require('./routes/apis');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/admin', AdminRouter);
app.use('/webapi', apisRouter(io));
app.use('/api', apisRouter(io));
app.use('/api/auth', apisRouter(io));


// Catch all unmatched /api/* requests and respond with JSON (prevent HTML response)
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `API route ${req.originalUrl} not found.` });
});

require('./socket/socket')(io);
require('./helpers/cronJobs')();

app.get('/landing*', (req, res) => {
  res.sendFile(path.join(landingBuildPath, "index.html"));
});

app.get("*", async (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ success: false, message: "API route not found." });
  }
  if (fs.existsSync(path.join(buildPath, "index.html"))) {
    return res.sendFile(path.join(buildPath, "index.html"));
  }
  res.send("DealConnect API Server Running");
});

// Global error handler for API
app.use(function (err, req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
  next(createError(err.status || 500));
});

http.listen(PORT, (req, res) => {
  console.log(`🚀 DealConnect Server started on port ${PORT}`);
});
