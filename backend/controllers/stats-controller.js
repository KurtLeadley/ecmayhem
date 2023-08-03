/***********************************
; Title:  Stats API
; Description: CRUD Controller for Stats HTTP requests
***************************************************************/
const mongoose = require('mongoose');
mongoose.Promise = Promise;
// allow for matching on _id in aggregate db functions
const ObjectId = mongoose.Types.ObjectId;
// Document Object model to query in MongoDB
const Player = require('../models/player');
const Team = require('../models/team');
/////////////////////////////////////////////////////

// CREATE
exports.insertPlayerStats = (req,res) => {
  let stats = req.body;
  // console.log(stats);
  // remove angular ids from body, they get handled by mongoose automatically
  // delete stats.id;
  delete stats._id;
  stats.team = stats.teamId;
  // delete stats.teamId;
  // console.log(stats);
  const filterPlayer = {"_id": req.params.player};
  const updatePlayer = {$push : {stats:stats}};
  // return newest obj in stats only (slice grabs last one)
  const optionsPlayer = {new: true, "fields":  { "stats": { "$slice": -1 } }};

  Player.findOneAndUpdate(filterPlayer,updatePlayer,optionsPlayer).exec().then(result => {
    res.status(200).json({
      message: "Player Stats Created",
      data : result
    });
  });
};
// READ
exports.getStats = async (req,res) => {
  console.log(req.body);
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
      data : documents
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
exports.updateManyStats = async (req, res) => {
  console.log("updateManyStats API");
  // console.log(req.body.season);
  // console.log(req.body.stats);
  const docs = req.body.stats;
  const bulkOps = docs.map(doc => ({
    updateOne: {
      filter: {"email": doc.email, "stats.season" : req.body.season},
      update:
      {
        $set: {
          "stats.$.goals" : doc.goals,
          "stats.$.assists" : doc.assists,
          "stats.$.pim" : doc.pim,
          "stats.$.shotsFaced" : doc.shotsFaced,
          "stats.$.goalsAgainst" : doc.goalsAgainst
        }
      }
    }
  }));
  //console.log(bulkOps);
  try {
    let result = await Player.bulkWrite(bulkOps);
    console.log(result);
    return res.status(200).json({
      message: "Players Updated Successfully",
      data : result
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message
    });
  }
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
      data: documents
    });
  });
};
// get all available seasons controller
exports.getSeasons = (req,res,next) => {
  Player.distinct('stats.season').then(documents => {
    res.status(200).json({
      message: "Available Seasons Fetched Successfully",
      data : documents
    });
  });
};

