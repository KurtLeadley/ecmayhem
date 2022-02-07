/***********************************
; Title:  Standings API
; Description: CRUD Controller for Standings HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Team = require('../models/team');
/////////////////////////////////////////////////////
// Get all Teams
// get all available teams controller
exports.getTeams = (req,res) => {
  Team.find({},{stats:0}, function(err,documents) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        message: "Available Teams Fetched Successfully",
        data : documents
      });
    }
  });
};
// get all available seasons controller
exports.getSeasons = (req,res) => {
  Team.distinct('stats.season', function(err,documents) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        message: "Available Seasons Fetched Successfully",
        data : documents
      });
    }
  });
};
// Get Team standings for selected season
exports.getSeasonStandings = (req,res) => {
  console.log("getSeasonStandings");
  console.log(req.params);
  // Write query
  let pipeline = [
    {$unwind:"$stats"},
    {$project:{name:1,stats:1}},
    {$addFields:
      {
        "stats.pts": {$add:
          [{$multiply:[ "$stats.wins", 2 ]}, "$stats.otl"]
        },
        "stats.gd" : {
          $subtract: ["$stats.gf", "$stats.ga"]
        },
        "stats.gp" : {
          $add : ["$stats.wins", "$stats.losses", '$stats.otl']
        }
      }
    },
    {$match:{"stats.season":req.params.season}},
    {$sort:{"stats.pts":-1, "stats.gp" : 1, "stats.gd":-1}}
  ];
  // Run the aggregated query
  Team.aggregate(pipeline, function(err,documents) {
    if (err) {
      console.log(err);
    } else {
      console.log(documents);
      res.status(200).json({
        message: "Available Seasons Fetched Successfully",
        stats : documents
      });
    }
  });
};
