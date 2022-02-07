/***********************************
; Title:  Stats API
; Description: CRUD Controller for Stats HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Player = require('../models/player');
const Team = require('../models/team');
/////////////////////////////////////////////////////

// CREATE
exports.insertPlayerStats = (req,res) => {
  let stats = req.body;
  //console.log(stats);
  // remove angular ids from body, they get handled by mongoose automatically
  delete stats.id;
  delete stats._id;
  stats.team = stats.teamId;
  delete stats.teamId;
  const filter = {"_id": req.params.player};
  const update = {$push : {stats:stats}};
  // return newest obj in stats only
  const options = {new: true, "fields":  { "stats": { "$slice": -1 } }};
  Player.findOneAndUpdate(filter,update,options).populate({
    path: "stats",
    populate: {
      path : "team",
      model : Team,
      select: {_id:1,name:1}
    }
  }).exec(function(err,document) {
    if (err) {
      console.log(err);
    } else {
      //console.log(document.stats[0]);
      returnObj = {
        statId : document.stats[0]._id,
        teamName : document.stats[0].team.name,
        teamId : document.stats[0].team._id
      };
      // console.log(returnObj);
      res.status(200).json({
        document : returnObj
      });
    }
  });
};
// READ
exports.getStats = (req,res) => {
  //console.log(req.params);
  if (req.params.team != "All" && req.params.player == "All") {
    let pipeline = [
      {$unwind:"$stats"},
      {$project:{first:1,last:1,email:1,stats:1}},
      {$addFields:{"stats.points":{$add:[ "$stats.goals", "$stats.assists" ]}}},
      {$match:{
        "$and" : [
          {"stats.season":req.params.season},
          {"stats.team":req.params.team}
        ]}
      },
      {$sort:{"stats.points":-1}}
    ];
    let query = Player.aggregate(pipeline);
    let promise = query.exec();
    promise.then(documents => {
      res.status(200).json({
        message: "Players Fetched Successfully",
        players : documents
      });
    });
  }
  if (req.params.team == "All" && req.params.player == "All") {
    let pipeline = [
      {$unwind:"$stats"},
      {$project:{first:1,last:1,email:1,stats:1}},
      {$addFields:{"stats.points":{$add:[ "$stats.goals", "$stats.assists" ]}}},
      {$match:{"stats.season":req.params.season}},
      {$sort:{"stats.points":-1}}
    ];
    let query = Player.aggregate(pipeline);
    let promise = query.exec();
    promise.then(documents => {
      res.status(200).json({
        message: "Players Fetched Successfully",
        players : documents
      });
    });
  }
  // get single player stats
  if (req.params.player != "All") {
    //console.log("Get Player");
    let pipeline = [
      {$unwind:"$stats"},
      {$project:{first:1,last:1,email:1,stats:1}},
      {$addFields:{"stats.points":{$add:[ "$stats.goals", "$stats.assists" ]}}},
      {$match:{"_id": ObjectId(req.params.player)}},
      {$sort:{"stats.season":-1}}
    ];
    let query = Player.aggregate(pipeline);
    let promise = query.exec();
    promise.then(documents => {
      //console.log(documents);
      res.status(200).json({
        message: "Player Fetched Successfully",
        players : documents
      });
    });
  }
};
// READ single
exports.getSinglePlayerStats = (req, res) => {
  //console.log(req.params);
  let pipeline = [
    {$unwind:"$stats"},
    {$project:{first:1,last:1, email:1, stats:1}},
    {$addFields:{"stats.points":{$add:[ "$stats.goals", "$stats.assists" ]}}},
    {$match:{"_id": ObjectId(req.params.player)}},
    {$sort:{"stats.season":-1}}
  ];
  let query = Player.aggregate(pipeline);
  let promise = query.exec();
  promise.then(documents => {
    res.status(200).json({
      message: "Player Fetched Successfully",
      player : documents
    });
  });
};
// UPDATE
exports.updateStats = (req,res) => {
  const playerId = req.params.playerId;
  const statsId = req.params.statsId;
  const stats = req.body;
  //console.log(stats);
  const filter = {"_id" : playerId, stats: {$elemMatch:{ _id : statsId} } };
  const update = {$set : {"stats.$":stats}};
  const options = {new: true};
  Player.findOneAndUpdate(filter,update,options).populate({
    path: "stats",
    populate: {
      path : "team",
      model : Team,
      select: {_id:1,name:1}
    }
  }).exec(function(err,doc) {
    if (err) {
      console.log(err);
    } else {
      //console.log(doc);
      res.send(doc.stats);
    }
  });
};
// DELETE
exports.deletePlayerStats = (req,res) => {
  //console.log(req.params);
  Player.updateOne(
    {"_id": ObjectId(req.params.playerId)},
    {$pull : {stats: {_id : ObjectId(req.params.statsId)}}}
  ).then(documents => {
    res.status(204).json({
      message: "Player Stats Deleted Successfully",
      documents: documents
    });
  });
};
// get all available seasons controller
exports.getSeasons = (req,res,next) => {
  Player.distinct('stats.season').then(documents => {
    res.status(200).json({
      message: "Available Seasons Fetched Successfully",
      seasons : documents
    });
  });
};

