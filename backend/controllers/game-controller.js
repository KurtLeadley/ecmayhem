/***********************************
; Title:  Stats API
; Description: CRUD Controller for Game HTTP requests
***************************************************************/
const mongoose = require('mongoose');
mongoose.Promise = Promise;
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Game = require('../models/game');
// Get Games
// READ
// Get Season Schedule MongoDB
exports.getGames = async (req,res) => {
  let season = req.params.season;
  try {
    data = await Game.find({season:season});
    return res.status(200).json({
      message: "Season Data Fetched",
      data : data
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Import game stats for a season
exports.updateManyGames = async (req, res) => {
  console.log("updateManyGames API");
  console.log(req.body.season);
  const docs = req.body.stats;
  console.log(docs);
  const bulkOps = docs.map(doc => ({
    updateOne: {
      filter: {"season": doc.season, "week" : doc.week, "time" : doc.time},
      update:
      {
        $set: {
          "stats": doc.playerGameStats
        }
      }
    }
  }));
  try {
    let result = await Game.bulkWrite(bulkOps);
    console.log(result);
    return res.status(200).json({
      message: "Games Updated Successfully",
      data : result
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: err.message
    });
  }
};

