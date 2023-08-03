/***********************************
; Title:  Team API
; Description: CRUD Controller for Team HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Team = require('../models/team');
/////////////////////////////////////////////////////
// Get all Teams
exports.getAllTeams = (req,res) => {
  console.log("Get all teams");
  let pipeline = [
    {$unwind:"$stats"}
  ];
  Team.aggregate(pipeline,function(err,documents) {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        message: "All Teams Fetched Successfully",
        data : documents
      });
    }
  });
};
// Get all Teams of a season
exports.getTeams = async (req,res) => {
  console.log(req.url);
  try {
    const pipeline = [
      {$unwind:"$stats"},
      {$match:{
        "$and" : [{"stats.season":req.params.season}]}
      },
    ];
    const result = await Team.aggregate(pipeline).exec();
    return res.status(200).json({
      message: "Team Data Retrieved",
      data : result
    });
  }
  catch (err)  {
    return res.status(500).send({
      message: err.message
    });
  }
};
// get specific team
exports.getTeam = (req,res) => {
  console.log(req.params);
  //console.log(req.body);
  let pipeline = [
    {$unwind:"$stats"},
    {$match:{
      "$and" : [
        {"stats.season":req.params.season},
        {"_id": ObjectId(req.params.tid)}
      ]}
    },
  ];
  let query = Team.aggregate(pipeline);
  let promise = query.exec();
  promise.then(documents => {
    res.status(200).json({
      message: "Team Fetched Successfully",
      data : documents
    });
  });
};
// delete
exports.delete = async (req,res) => {
  try {
    const result = await Player.deleteMany({ 'season': { $e: req.params.param }});
    return res.status(200).json({
      message: "Player Data Deleted",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Add a single player to a team
exports.addPlayer = async (req,res) => {
  // console.log("addPlayer Params:");
  // console.log(req.params);
  let filterTeam = {"_id": ObjectId(req.params.tid),"stats.season": req.params.season };
  let updateTeam = {$addToSet: {"stats.$.players": ObjectId(req.params.pid)}};
  let options = {new: true};
  try {
    let result = await Team.findOneAndUpdate(filterTeam,updateTeam,options);
    return res.status(200).send({
      message: "Teams Created",
      data: result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Add an array of players to a team
exports.addPlayers = async (req,res) => {
  const bulkOperations = [];
  for (const team of req.body) {
    let teamId = team[0].teamId;
    // console.log(teamId);
    let season = team[0].season;
    let playerArray = team.map(player => player.playerId);
    // console.log(playerArray);
    let filterTeam = {"stats._id": ObjectId(teamId),"stats.season": season };
    // let updateTeam = {$addToSet: {$each:{"stats.$.players": playerArray}}};
    let updateTeam = {$set: {"stats.$.players": playerArray}};
    let options = {new: true};
    let updateObject = {
      'updateOne' : {
        'filter' : filterTeam,
        'update' : updateTeam,
        'options' : options
      }
    };
    bulkOperations.push(updateObject);
  }
  try {
    let teams = await Team.collection.bulkWrite(bulkOperations);
    return res.status(200).send({
      message: "Teams Rosters Added",
      data: teams
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Create an array of teams for a given season
exports.createTeams = async (req,res) => {
  console.log("Create Teams");
  console.log(req.body);
  let data = req.body;
  let bulkOperations = [];
  for (const team of data) {
    console.log(team);
    let season = team.stats[0].season;
    console.log(season);

    let filterTeamCase2 = {"name": team.name, stats: { $not: { $elemMatch: {season: season}}}};
    let updateCase2 =  {$push: {stats: team.stats}};
    let updateObjectCase2 = {
      'updateOne' : {
        'filter' : filterTeamCase2,
        'update' : updateCase2,
        'setDefaultsOnInsert': true
      }
    };
    bulkOperations.push(updateObjectCase2);
    // Team and season do not exist
    let filterTeamCase3 = {"name": team.name};
    let updateCase3 =  {$setOnInsert: {stats: team.stats}};
    let updateObjectCase3 = {
      'updateOne' : {
        'filter' : filterTeamCase3,
        'update' : updateCase3,
        'upsert' : true,
        'setDefaultsOnInsert': true
      }
    };
    bulkOperations.push(updateObjectCase3);
  }
  try {
    let result = await Team.bulkWrite(bulkOperations);
    let teams = await Team.find();
    return res.status(200).send({
      message: "Teams Created",
      data: teams,
      result: result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Update All teams on spreadsheet upload
exports.updateManyTeams = async (req, res) => {
  console.log("updateManyTeams API");
  console.log(req.body.season);
  console.log(req.body.stats);
  // Clear out season stats to rewrite them all
  Team.updateMany({'stats.season' : req.body.season}, {
    $set: {
      "stats.$.gf" : 0,
      "stats.$.ga" : 0,
      "stats.$.sf" : 0,
      "stats.$.sa" : 0,
      "stats.$.wins" : 0,
      "stats.$.losses" : 0,
      "stats.$.otl" : 0
    },
  });
  // Rewrite season stats
  const docs = req.body.stats;
  const bulkOps = docs.map(doc => ({
    updateOne: {
      filter: {"name": doc.teamName, "stats.season" : req.body.season},
      update:
      {
        $inc: {
          "stats.$.gf" : doc.goalsFor,
          "stats.$.ga" : doc.goalsAgainst,
          "stats.$.sf" : doc.shotsFor,
          "stats.$.sa" : doc.shotsAgainst,
          "stats.$.wins" : doc.win,
          "stats.$.losses" : doc.loss,
          "stats.$.otl" : doc.otl
        }
      }
    }
  }));
  console.log(bulkOps);
  try {
    let result = await Team.bulkWrite(bulkOps);
    console.log(result);
    return res.status(200).json({
      message: "Teams Updated Successfully",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// delete many
exports.delete = async (req,res) => {
  try {
    const result = await Team.deleteMany({ 'stats.$.season': { $e: req.params.param }});
    return res.status(200).json({
      message: "Team Data Deleted",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// get all available seasons controller
exports.getAvailableSeasons = (req,res) => {
  console.log("Get Available Seasons");
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
  console.log("Get Season Standings:");
  console.log(req.params);
  // Write query
  let pipeline = [
    {$unwind:"$stats"},
    {$project:{name:1,stats:1}},
    {$addFields:
      {
        "stats.pts": {$add:
          [{$multiply:[ {$toInt:"$stats.wins"}, 2 ]}, { $toInt:"$stats.otl"}]
        },
        "stats.gd" : {
          $subtract: [{$toInt:"$stats.gf"}, {$toInt:"$stats.ga"}]
        },
        "stats.gp" : {
          $add : [{$toInt:"$stats.wins"}, {$toInt:"$stats.losses"}, { $toInt:'$stats.otl'}]
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
      res.status(200).json({
        message: "Standings Fetched Successfully",
        data : documents
      });
    }
  });
};
