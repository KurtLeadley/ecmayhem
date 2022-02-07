// import dependencies
const express = require('express');
const mongoose = require('mongoose');
// require our route definitions
const statRoutes = require("./routes/stats-router");
const playerRoutes = require("./routes/players-routes");
const standingsRoutes = require("./routes/standings-routes");
const teamRoutes = require("./routes/team-routes");
// create our express application
const app = express();
// express middleware for handling json data
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// Connect to mongoDb "ecmayhem"
mongoose.connect("mongodb+srv://kurt:Sunset1212!@ecmayhem.8kfkj.mongodb.net/ecmayhem?retryWrites=true&w=majority")
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
app.use("/api/standings", standingsRoutes);
app.use('/api/team', teamRoutes);
// export app
module.exports = app;
