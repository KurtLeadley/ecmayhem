// import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// require our route definitions
const statRoutes = require("./routes/stats-router");
const playerRoutes = require("./routes/players-routes");
const teamRoutes = require("./routes/team-routes");
const scheduleRoutes = require("./routes/schedule-routes");
const gameRoutes = require("./routes/games-routes");

require('dotenv').config();
// create our express application
const app = express();
// express middleware for handling json data
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true, parameterLimit: 50000}));
// Connect to mongoDb "ecmayhem"
mongoose.connect("mongodb+srv://"+process.env.DB_USER+":" +process.env.DB_PASS+"@ecmayhem.8kfkj.mongodb.net/ecmayhem?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection to database failed!");
  });
// set HTTP headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});
// apply routes
app.use("/api/players", playerRoutes);
app.use("/api/statistics", statRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/games', gameRoutes);
// export app
module.exports = app;
