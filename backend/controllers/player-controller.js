/***********************************
; Title:  Player API
; Description: CRUD Controller for Stats HTTP requests
***************************************************************/
const mongoose = require('mongoose');
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Player = require('../models/player');
const Team = require('../models/team');

// Create Player
exports.createPlayer = (req,res) => {
  // console.log(req.body);
  const player = new Player({
    first : req.body.first,
    last : req.body.last,
    email : req.body.email
  });
  player.save().then(result => {
    res.status(201).json({
      message: "Player Created",
      data: result
    });
  }).catch(err =>{
    res.status(500).json({
      error:err
    });
  });
};
// Create Roster
exports.createRosters = async (req,res) => {
  console.log("Creating Rosters");
  let data = req.body;
  let bulkOperations = [];
  for (const player of data) {
    let season = player.stats.season;
    //Player Exists, season does not
    let filterCase1 = {"email": player.email, stats: { $not: { $elemMatch: {season: season}}}};
    let updateCase1 =  {$push: {stats: [player.stats]}};
    let updateObjectCase1 = {
      'updateOne' : {
        'filter' : filterCase1,
        'update' : updateCase1,
        'setDefaultsOnInsert': true
      }
    };
    bulkOperations.push(updateObjectCase1);
    // Player and season do not exist
    let filterCase2 = {"email": player.email};
    let updateCase2 =  {$setOnInsert: {first : player.first, last : player.last, stats: [player.stats]}};
    let updateObjectCase2 = {
      'updateOne' : {
        'filter' : filterCase2,
        'update' : updateCase2,
        'upsert' : true,
        'setDefaultsOnInsert': true
      }
    };
    bulkOperations.push(updateObjectCase2);
  }
  try {
    let result = await Player.bulkWrite(bulkOperations);
    let players = await Player.find();
    return res.status(200).send({
      message: "Players Created",
      data: players,
      result: result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
};
// Read Players
exports.getPlayers = (req,res) => {
  Player.find()
    .populate({
      path: "stats",
      populate: {
        path : "team",
        model : Team,
        select: {name:1}
      }
    }).then(documents => {
    res.status(200).json({
      message: "Players Fetched Successfully",
      data : documents
    });
  });
};
// READ Unwound Player Stats
exports.getPlayerStats = async (req,res) => {
  console.log("Get Player Stats");
  let pipeline = [
    {$unwind:"$stats"},
    {"$lookup": {
      "from": "teams",
      "localField": "stats.team",
      "foreignField": "stats._id",
      "as": "team"
    }},
    {$project:{first:1,last:1,email:1,stats:1, team:1}},
    {$addFields:{"stats.points":{$add:[ "$stats.goals", "$stats.assists" ]}}},
    {$sort:{"stats.points":-1}}
  ];
  try {
    let result = await Player.aggregate(pipeline).exec();
    return res.status(200).json({
      message: "Players Stats Fetched Successfully",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
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
